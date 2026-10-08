-- =====================================================================
-- 上線前安全強化
-- 1. 函式執行權限改成「白名單」（Supabase 預設會把新函式開放給所有登入者）
-- 2. 小老師每次呼叫 AI 都原子計次＋全站每日上限（防止並發繞過、控制費用）
-- 3. 邀請碼加長、家長綁定猜碼次數限制、學生可查看／解除家長綁定
-- 4. 成績證明檔案大小與格式限制、題目回報防灌、補索引
-- 5. 使用 AI 小老師前需同意資料提供給 AI 服務（Apple 5.1.2(i)）
-- =====================================================================

-- ---------- 設定 ----------
insert into public.app_config (key, value) values
  ('free_daily_tutor_calls',    '40'),     -- 免費版每天最多幾則小老師回覆（含提示）
  ('premium_daily_tutor_calls', '400'),    -- 完整版每天最多幾則
  ('global_daily_tutor_calls',  '20000'),  -- 全站每天 AI 呼叫上限（費用保險絲）
  ('link_child_daily_fails',    '10')      -- 家長每天最多輸錯幾次邀請碼
on conflict (key) do nothing;

-- ---------- 小老師計次 ----------
alter table public.tutor_usage add column if not exists calls int not null default 0;
alter table public.tutor_sessions add column if not exists turn int not null default 0;

create table if not exists public.tutor_global_usage (
  day   date primary key,
  calls int  not null default 0
);
alter table public.tutor_global_usage enable row level security;
revoke all on public.tutor_global_usage from anon, authenticated;

-- 原子扣一次：回傳 'ok' / 'daily_tutor_limit' / 'daily_call_limit' / 'global_limit'
create or replace function public.tutor_consume(p_user uuid, p_is_start boolean, p_start_limit int, p_call_limit int)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_day date := public.app_today();
  v_row public.tutor_usage;
  v_ok  boolean;
begin
  insert into public.tutor_usage (user_id, day) values (p_user, v_day) on conflict do nothing;
  select * into v_row from public.tutor_usage where user_id = p_user and day = v_day for update;
  if p_is_start and v_row.count >= p_start_limit then return 'daily_tutor_limit'; end if;
  if v_row.calls >= p_call_limit then return 'daily_call_limit'; end if;

  update public.tutor_global_usage set calls = calls + 1
    where day = v_day and calls < public.cfg_int('global_daily_tutor_calls')
    returning true into v_ok;
  if v_ok is null then
    insert into public.tutor_global_usage (day, calls) values (v_day, 1)
      on conflict (day) do nothing returning true into v_ok;
  end if;
  if v_ok is null then return 'global_limit'; end if;

  update public.tutor_usage
    set count = count + (case when p_is_start then 1 else 0 end), calls = calls + 1
    where user_id = p_user and day = v_day;
  return 'ok';
end $$;

-- AI 呼叫失敗時退回
create or replace function public.tutor_refund(p_user uuid, p_is_start boolean)
returns void language plpgsql security definer set search_path = public as $$
declare v_day date := public.app_today();
begin
  update public.tutor_usage
    set count = greatest(count - (case when p_is_start then 1 else 0 end), 0), calls = greatest(calls - 1, 0)
    where user_id = p_user and day = v_day;
  update public.tutor_global_usage set calls = greatest(calls - 1, 0) where day = v_day;
end $$;

-- ---------- AI 資料使用同意 ----------
alter table public.profiles add column if not exists ai_consent_at timestamptz;

create or replace function public.give_ai_consent()
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  update public.profiles set ai_consent_at = coalesce(ai_consent_at, now()) where id = auth.uid();
end $$;

-- ---------- 邀請碼：8 碼、去掉容易看錯的 0/O/1/I ----------
create or replace function public.gen_invite_code()
returns text language plpgsql volatile set search_path = public as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  b bytea := uuid_send(gen_random_uuid());
  s text := '';
begin
  for i in 0..7 loop
    s := s || substr(alphabet, (get_byte(b, i) % 32) + 1, 1);
  end loop;
  return s;
end $$;

alter table public.profiles alter column invite_code set default public.gen_invite_code();
update public.profiles set invite_code = public.gen_invite_code() where char_length(invite_code) < 8;

-- 註冊時萬一邀請碼重複，重新產生（避免註冊失敗）
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  for attempt in 1..5 loop
    begin
      insert into public.profiles (id, role, nickname, parent_consent_at, freeze_cards, invite_code)
      values (
        new.id,
        case when (new.raw_user_meta_data ->> 'role') = 'parent' then 'parent' else 'student' end,
        left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'nickname'), ''), '同學'), 20),
        case when (new.raw_user_meta_data ->> 'parent_consent') = 'true' then now() end,
        public.cfg_int('start_freeze_cards'),
        public.gen_invite_code()
      )
      on conflict (id) do nothing;
      return new;
    exception when unique_violation then
      if attempt = 5 then raise; end if;
    end;
  end loop;
  return new;
end $$;

-- 家長綁定：錯誤次數限制（輸錯不丟例外，這樣計數才會保存）
create table if not exists public.link_attempts (
  parent_id uuid not null references auth.users (id) on delete cascade,
  day       date not null,
  fails     int  not null default 0,
  primary key (parent_id, day)
);
alter table public.link_attempts enable row level security;
revoke all on public.link_attempts from anon, authenticated;

create or replace function public.link_child(p_code text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_child public.profiles;
  v_fails int;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if (select role from public.profiles where id = auth.uid()) is distinct from 'parent' then raise exception 'not_parent'; end if;
  select fails into v_fails from public.link_attempts where parent_id = auth.uid() and day = public.app_today();
  if coalesce(v_fails, 0) >= public.cfg_int('link_child_daily_fails') then
    return jsonb_build_object('error', 'too_many_attempts');
  end if;
  select * into v_child from public.profiles
    where invite_code = upper(regexp_replace(coalesce(p_code, ''), '\s', '', 'g')) and role = 'student';
  if not found then
    insert into public.link_attempts (parent_id, day, fails) values (auth.uid(), public.app_today(), 1)
      on conflict (parent_id, day) do update set fails = public.link_attempts.fails + 1;
    return jsonb_build_object('error', 'code_not_found');
  end if;
  insert into public.parent_links (parent_id, student_id) values (auth.uid(), v_child.id)
  on conflict do nothing;
  return jsonb_build_object('student_id', v_child.id, 'nickname', v_child.nickname);
end $$;

-- 學生查看、解除家長綁定
create or replace function public.my_parents()
returns table (parent_id uuid, nickname text, linked_at timestamptz)
language sql stable security definer set search_path = public as $$
  select l.parent_id, p.nickname, l.created_at
  from public.parent_links l join public.profiles p on p.id = l.parent_id
  where l.student_id = auth.uid()
  order by l.created_at
$$;

create or replace function public.unlink_parent(p_parent uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  delete from public.parent_links where student_id = auth.uid() and parent_id = p_parent;
end $$;

-- 學生換一組新邀請碼（舊碼立即失效）
create or replace function public.rotate_invite_code()
returns text language plpgsql security definer set search_path = public as $$
declare v_code text;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  for attempt in 1..5 loop
    begin
      update public.profiles set invite_code = public.gen_invite_code() where id = auth.uid()
        returning invite_code into v_code;
      return v_code;
    exception when unique_violation then
      if attempt = 5 then raise; end if;
    end;
  end loop;
  return v_code;
end $$;

-- ---------- 題目回報：同一人同一題同一類只算一次；新增「內容不恰當」----------
alter table public.question_reports drop constraint if exists question_reports_kind_check;
alter table public.question_reports add constraint question_reports_kind_check
  check (kind in ('question_wrong', 'tutor_wrong', 'tutor_inappropriate'));
create unique index if not exists question_reports_dedupe
  on public.question_reports (user_id, question_id, kind) where not resolved;

create or replace function public.report_question(p_question_id text, p_kind text, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
declare v_n int;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  insert into public.question_reports (user_id, question_id, kind, note)
  values (auth.uid(), p_question_id, p_kind, left(p_note, 500))
  on conflict (user_id, question_id, kind) where not resolved do nothing;
  get diagnostics v_n = row_count;
  if v_n > 0 then
    update public.questions set reported_count = reported_count + 1 where id = p_question_id;
  end if;
end $$;

-- ---------- 成績證明：最大 5 MB、只收圖片 ----------
update storage.buckets
  set file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp']
  where id = 'proofs';

-- ---------- 索引 ----------
create index if not exists attempts_user_question_idx on public.attempts (user_id, question_id);

-- ---------- 函式執行權限：白名單 ----------
revoke execute on all functions in schema public from public, anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;
grant execute on all functions in schema public to service_role;

grant execute on function
  -- 學生
  public.submit_answer(text, text, text, text),
  public.get_home(),
  public.get_units(text),
  public.next_questions(text[], int),
  public.due_reviews(int),
  public.list_mistakes(text),
  public.similar_question(text),
  public.set_error_type(text, text),
  public.report_question(text, text, text),
  public.apply_top_three(text, int, text, int, text, boolean),
  public.grant_ad_bonus(),
  public.give_ai_consent(),
  public.my_parents(),
  public.unlink_parent(uuid),
  public.rotate_invite_code(),
  -- 家長
  public.link_child(text),
  public.get_child_summary(uuid),
  -- 管理後台（函式內會檢查是否為管理員）
  public.is_admin(),
  public.admin_stats(),
  public.admin_pending_applications(),
  public.admin_review_top_three(uuid, boolean, text),
  public.admin_reports(boolean),
  public.admin_resolve_report(bigint),
  public.admin_set_question_active(text, boolean)
to authenticated;
-- 注意：以後新增給 App 呼叫的函式，要記得加進上面的白名單
