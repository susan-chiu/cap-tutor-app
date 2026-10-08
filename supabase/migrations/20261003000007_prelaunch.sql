-- =====================================================================
-- 上線前第 3 輪：
-- 1. 每日練習改由伺服器一次出題：依學生選的科目「平均輪流」、照各科版本的學期範圍，題數不足時自動補滿
-- 2. 出題時回傳「是否做過」，App 可以提示「這個範圍的題目都做過了」
-- 3. 記錄服務條款同意時間與版本
-- 4. 記錄年級最後確認時間（每年 8 月提醒學生確認是否升年級）
-- 5. App 讀取免費額度設定（首頁顯示今天還剩幾題）
-- =====================================================================

-- ---------- 服務條款同意、年級確認 ----------
alter table public.profiles add column if not exists terms_accepted_at timestamptz;
alter table public.profiles add column if not exists terms_version text;
alter table public.profiles add column if not exists grade_confirmed_at timestamptz;
update public.profiles set grade_confirmed_at = created_at where grade_confirmed_at is null and grade is not null;

-- 只要更新了年級（即使數字一樣，例如按「還沒升級」），就記下確認時間
create or replace function public.touch_grade_confirmed()
returns trigger language plpgsql as $$
begin
  new.grade_confirmed_at := now();
  return new;
end $$;
drop trigger if exists profiles_grade_confirmed on public.profiles;
create trigger profiles_grade_confirmed before update of grade on public.profiles
  for each row execute function public.touch_grade_confirmed();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  for attempt in 1..5 loop
    begin
      insert into public.profiles (id, role, nickname, parent_consent_at, freeze_cards, invite_code,
                                   terms_accepted_at, terms_version)
      values (
        new.id,
        case when (new.raw_user_meta_data ->> 'role') = 'parent' then 'parent' else 'student' end,
        left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'nickname'), ''), '同學'), 20),
        case when (new.raw_user_meta_data ->> 'parent_consent') = 'true' then now() end,
        public.cfg_int('start_freeze_cards'),
        public.gen_invite_code(),
        case when (new.raw_user_meta_data ->> 'terms_accepted') = 'true' then now() end,
        left(new.raw_user_meta_data ->> 'terms_version', 20)
      )
      on conflict (id) do nothing;
      return new;
    exception when unique_violation then
      if attempt = 5 then raise; end if;
    end;
  end loop;
  return new;
end $$;

-- ---------- 出題（回傳是否做過） ----------
-- 每日練習：p_subjects 科目、p_max_sem 只出到哪個學期（照學生各科版本；null = 不限）
create or replace function public.daily_questions(p_subjects text[], p_max_sem text default null, p_limit int default 5)
returns table (id text, unit_id text, concept text, stem text, options jsonb, difficulty smallint, source text,
               subject text, semester text, unit_title text, seen boolean)
language sql volatile security definer set search_path = public as $$
  with prof as (
    select coalesce(textbook_versions, '{}'::jsonb) tv from public.profiles where id = auth.uid()
  ),
  units_ok as (
    select u.id
    from public.units u
    left join public.unit_versions v on v.unit_id = u.id and v.version = ((select tv from prof) ->> u.subject)
    where u.subject = any (p_subjects)
      and (p_max_sem is null or coalesce(v.semester, u.semester) <= p_max_sem)
  ),
  cand as (
    select qp.*,
      exists (select 1 from public.attempts a where a.user_id = auth.uid() and a.question_id = qp.id) as seen,
      exists (select 1 from public.mistakes m where m.user_id = auth.uid() and m.question_id = qp.id
                and m.status <> 'graduated') as open_mistake
    from public.questions_public qp
    where qp.unit_id in (select id from units_ok)
  ),
  ranked as (
    select c.*, row_number() over (partition by c.subject order by c.seen, not c.open_mistake, random()) as rn
    from cand c
  )
  select r.id, r.unit_id, r.concept, r.stem, r.options, r.difficulty, r.source, r.subject, r.semester, r.unit_title, r.seen
  from ranked r
  order by r.rn, random()
  limit least(greatest(p_limit, 1), 50)
$$;

-- 單元練習、段考複習卷、會考模擬考：先出沒做過的，再出做錯過的
create or replace function public.practice_questions(p_unit_ids text[], p_limit int default 5)
returns table (id text, unit_id text, concept text, stem text, options jsonb, difficulty smallint, source text,
               subject text, semester text, unit_title text, seen boolean)
language sql volatile security definer set search_path = public as $$
  select qp.id, qp.unit_id, qp.concept, qp.stem, qp.options, qp.difficulty, qp.source, qp.subject, qp.semester, qp.unit_title,
    exists (select 1 from public.attempts a where a.user_id = auth.uid() and a.question_id = qp.id)
  from public.questions_public qp
  where qp.unit_id = any (p_unit_ids)
  order by
    (exists (select 1 from public.attempts a where a.user_id = auth.uid() and a.question_id = qp.id)),
    (not exists (select 1 from public.mistakes m where m.user_id = auth.uid() and m.question_id = qp.id and m.status <> 'graduated')),
    random()
  limit least(greatest(p_limit, 1), 60)  -- 模擬考最多 54 題（社會）
$$;

-- App 需要知道的額度設定
create or replace function public.get_limits()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'free_daily_questions', public.cfg_int('free_daily_questions'),
    'free_daily_tutor', public.cfg_int('free_daily_tutor'),
    'premium_daily_tutor', public.cfg_int('premium_daily_tutor')
  )
$$;

revoke execute on function public.daily_questions(text[], text, int), public.practice_questions(text[], int),
  public.get_limits(), public.touch_grade_confirmed() from public, anon;
grant execute on function public.daily_questions(text[], text, int), public.practice_questions(text[], int),
  public.get_limits() to authenticated;
