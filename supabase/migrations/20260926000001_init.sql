-- =====================================================================
-- 會考練習 APP — 資料庫結構（Supabase / PostgreSQL）
-- 所有計分邏輯（對錯判斷、連勝、XP、錯題狀態）都在伺服器端執行，
-- App 端只能透過下方 RPC 函式寫入，無法直接修改分數或看到答案。
-- =====================================================================

-- ---------- 共用設定 ----------
create table if not exists public.app_config (
  key   text primary key,
  value jsonb not null
);

insert into public.app_config (key, value) values
  ('daily_goal',            '5'),    -- 每日連勝門檻：答 5 題
  ('free_daily_questions',  '30'),   -- 免費版每日作答上限
  ('free_daily_tutor',      '3'),    -- 免費版每日小老師次數
  ('premium_daily_tutor',   '50'),   -- 付費／前三名每日小老師上限（防濫用）
  ('xp_correct',            '10'),
  ('xp_mistake_graduated',  '30'),
  ('start_freeze_cards',    '2')
on conflict (key) do nothing;

create or replace function public.cfg_int(p_key text)
returns int language sql stable as $$
  select (value #>> '{}')::int from public.app_config where key = p_key
$$;

-- 台灣日期（連勝以台灣時間的「一天」計算）。
-- app.today 僅供自動化測試覆寫日期，正式環境不會設定。
create or replace function public.app_today()
returns date language sql stable as $$
  select coalesce(
    nullif(current_setting('app.today', true), '')::date,
    (now() at time zone 'Asia/Taipei')::date
  )
$$;

-- 學期結束日：前三名免費使用到該學期結束
create or replace function public.semester_end(p_day date)
returns date language sql immutable as $$
  select case
    when extract(month from p_day) between 2 and 7
      then make_date(extract(year from p_day)::int, 7, 31)
    when extract(month from p_day) = 1
      then make_date(extract(year from p_day)::int, 1, 31)
    else make_date(extract(year from p_day)::int + 1, 1, 31)
  end
$$;

-- ---------- 使用者 ----------
create table if not exists public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  role              text not null default 'student' check (role in ('student', 'parent')),
  nickname          text not null default '同學' check (char_length(nickname) between 1 and 20),
  grade             smallint check (grade between 7 and 9),
  textbook_version  text check (textbook_version in ('康軒', '南一', '翰林')),
  tutor_persona     text not null default 'gentle' check (tutor_persona in ('gentle', 'funny', 'strict')),
  xp                int  not null default 0,
  current_streak    int  not null default 0,
  longest_streak    int  not null default 0,
  last_goal_date    date,                       -- 最近一次達成每日目標的日期
  freeze_cards      int  not null default 2 check (freeze_cards between 0 and 5),
  premium_until     date,                       -- 付費或前三名到期日
  parent_consent_at timestamptz,                -- 未成年註冊：家長同意時間
  invite_code       text unique default upper(substr(md5(gen_random_uuid()::text), 1, 6)),
  created_at        timestamptz not null default now()
);

-- 新使用者註冊時自動建立 profile
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, nickname, parent_consent_at, freeze_cards)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'student'),
    coalesce(nullif(new.raw_user_meta_data ->> 'nickname', ''), '同學'),
    case when (new.raw_user_meta_data ->> 'parent_consent') = 'true' then now() end,
    public.cfg_int('start_freeze_cards')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_premium(p_user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select premium_until >= public.app_today() from public.profiles where id = p_user), false)
$$;

-- ---------- 題庫 ----------
create table if not exists public.units (
  id        text primary key,                  -- 例如 M-8A-2
  subject   text not null check (subject in ('math', 'chinese', 'english', 'science', 'social')),
  semester  text not null check (semester in ('7A', '7B', '8A', '8B', '9A', '9B')),
  seq       smallint not null,
  title     text not null
);

create table if not exists public.questions (
  id             text primary key,
  unit_id        text not null references public.units (id),
  concept        text not null,                 -- 觀念標籤，用來找相似題
  stem           text not null,
  options        jsonb not null,                -- [{"key":"A","text":"..."}]
  answer         text not null,
  explanation    text not null,                 -- 官方／標準解法：小老師講解的依據
  hints          jsonb not null default '[]',   -- 分層提示（最多 3 層）
  wrong_reasons  jsonb not null default '{}',   -- {"A":"常見錯誤觀念"}
  difficulty     smallint not null default 2 check (difficulty between 1 and 3),
  source         text not null default 'original', -- original / cap-年度
  active         boolean not null default true,
  reported_count int not null default 0
);
create index if not exists questions_unit_idx on public.questions (unit_id) where active;

-- 學生看得到的題目（不含答案、解析、錯誤原因）
create or replace view public.questions_public as
  select q.id, q.unit_id, q.concept, q.stem, q.options, q.difficulty, q.source,
         u.subject, u.semester, u.title as unit_title
  from public.questions q join public.units u on u.id = q.unit_id
  where q.active;

-- ---------- 作答與學習紀錄 ----------
create table if not exists public.attempts (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references auth.users (id) on delete cascade,
  question_id  text not null references public.questions (id),
  choice       text not null,
  correct      boolean not null,
  context      text not null default 'practice' check (context in ('practice', 'review', 'exam', 'tutor_check')),
  answered_at  timestamptz not null default now(),
  answered_day date not null default public.app_today()
);
create index if not exists attempts_user_idx on public.attempts (user_id, answered_at desc);

create table if not exists public.daily_activity (
  user_id  uuid not null references auth.users (id) on delete cascade,
  day      date not null,
  answered int  not null default 0,
  correct  int  not null default 0,
  froze    boolean not null default false,        -- 當天是用保護卡補上的
  primary key (user_id, day)
);

create table if not exists public.mistakes (
  user_id        uuid not null references auth.users (id) on delete cascade,
  question_id    text not null references public.questions (id),
  status         text not null default 'pending'
                 check (status in ('pending', 'learning', 'consolidating', 'almost', 'graduated')),
  error_type     text check (error_type in ('concept', 'calculation', 'misread', 'careless', 'guess')),
  wrong_count    int  not null default 1,
  next_review    date not null default public.app_today(),
  created_at     timestamptz not null default now(),
  graduated_at   timestamptz,
  primary key (user_id, question_id)
);
create index if not exists mistakes_due_idx on public.mistakes (user_id, next_review) where status <> 'graduated';

-- 錯題狀態前進規則：答對一次往下一階段，並決定幾天後再複習
-- pending → learning(+1 天) → consolidating(+3) → almost(+7) → graduated(+14 天抽考)
create or replace function public.next_mistake_state(p_status text, out new_status text, out wait_days int)
language sql immutable as $$
  select case p_status
           when 'pending'       then 'learning'
           when 'learning'      then 'consolidating'
           when 'consolidating' then 'almost'
           else 'graduated' end,
         case p_status
           when 'pending'       then 1
           when 'learning'      then 3
           when 'consolidating' then 7
           else 14 end
$$;

-- ---------- 小老師 ----------
create table if not exists public.tutor_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  question_id  text not null references public.questions (id),
  hint_level   smallint not null default 0 check (hint_level between 0 and 3),
  messages     jsonb not null default '[]',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists tutor_sessions_user_idx on public.tutor_sessions (user_id, created_at desc);

create table if not exists public.tutor_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day     date not null,
  count   int  not null default 0,
  primary key (user_id, day)
);

create table if not exists public.question_reports (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  question_id text not null references public.questions (id),
  kind        text not null check (kind in ('question_wrong', 'tutor_wrong')),
  note        text check (char_length(note) <= 500),
  created_at  timestamptz not null default now()
);

-- ---------- 全校前三名申請 ----------
create table if not exists public.top_three_applications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  school          text not null check (char_length(school) between 2 and 40),
  grade           smallint not null check (grade between 7 and 9),
  exam            text not null check (char_length(exam) between 2 and 40),
  school_rank     smallint not null check (school_rank between 1 and 3),
  proof_path      text not null,                -- storage: proofs/<user_id>/<file>
  parent_consent  boolean not null check (parent_consent),
  status          text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewer_note   text,
  created_at      timestamptz not null default now(),
  reviewed_at     timestamptz
);
-- 同一學生同一時間只能有一筆審核中的申請
create unique index if not exists top_three_one_pending
  on public.top_three_applications (user_id) where status = 'pending';

-- ---------- 家長連結 ----------
create table if not exists public.parent_links (
  parent_id  uuid not null references auth.users (id) on delete cascade,
  student_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (parent_id, student_id)
);

-- =====================================================================
-- 權限（RLS）：學生只能讀自己的資料；寫入一律走 RPC
-- =====================================================================
alter table public.app_config             enable row level security;
alter table public.profiles               enable row level security;
alter table public.units                  enable row level security;
alter table public.questions              enable row level security;
alter table public.attempts               enable row level security;
alter table public.daily_activity         enable row level security;
alter table public.mistakes               enable row level security;
alter table public.tutor_sessions         enable row level security;
alter table public.tutor_usage            enable row level security;
alter table public.question_reports       enable row level security;
alter table public.top_three_applications enable row level security;
alter table public.parent_links           enable row level security;

revoke all on all tables in schema public from anon, authenticated;

grant select on public.units, public.questions_public to authenticated;
grant select on public.profiles, public.attempts, public.daily_activity, public.mistakes,
                public.tutor_sessions, public.top_three_applications, public.parent_links to authenticated;
-- 學生可自行修改的欄位（分數、連勝、付費欄位不在其中）
grant update (nickname, grade, textbook_version, tutor_persona) on public.profiles to authenticated;

drop policy if exists units_read on public.units;
create policy units_read on public.units for select to authenticated using (true);

drop policy if exists profiles_own on public.profiles;
create policy profiles_own on public.profiles for select to authenticated using (id = auth.uid());
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists attempts_own on public.attempts;
create policy attempts_own on public.attempts for select to authenticated using (user_id = auth.uid());
drop policy if exists daily_own on public.daily_activity;
create policy daily_own on public.daily_activity for select to authenticated using (user_id = auth.uid());
drop policy if exists mistakes_own on public.mistakes;
create policy mistakes_own on public.mistakes for select to authenticated using (user_id = auth.uid());
drop policy if exists tutor_sessions_own on public.tutor_sessions;
create policy tutor_sessions_own on public.tutor_sessions for select to authenticated using (user_id = auth.uid());
drop policy if exists top_three_own on public.top_three_applications;
create policy top_three_own on public.top_three_applications for select to authenticated using (user_id = auth.uid());
drop policy if exists parent_links_own on public.parent_links;
create policy parent_links_own on public.parent_links for select to authenticated
  using (parent_id = auth.uid() or student_id = auth.uid());

-- =====================================================================
-- RPC：App 呼叫的伺服器函式
-- =====================================================================

-- 作答：判斷對錯、記錄、更新 XP／連勝／錯題狀態，回傳解析
-- p_for_mistake：作答的是某題錯題的「相似驗收題」時，帶入原錯題 id
create or replace function public.submit_answer(
  p_question_id text,
  p_choice      text,
  p_context     text default 'practice',
  p_for_mistake text default null
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid       uuid := auth.uid();
  v_today     date := public.app_today();
  v_q         public.questions;
  v_correct   boolean;
  v_prof      public.profiles;
  v_day       public.daily_activity;
  v_goal      int  := public.cfg_int('daily_goal');
  v_xp        int  := 0;
  v_gap       int;
  v_streak_up boolean := false;
  v_target    text;
  v_m         public.mistakes;
  v_next      record;
  v_mstatus   text;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  if p_context not in ('practice', 'review', 'exam', 'tutor_check') then raise exception 'bad_context'; end if;

  select * into v_q from public.questions where id = p_question_id and active;
  if not found then raise exception 'question_not_found'; end if;
  if not exists (select 1 from jsonb_array_elements(v_q.options) o where o ->> 'key' = p_choice) then
    raise exception 'bad_choice';
  end if;

  select * into v_prof from public.profiles where id = v_uid for update;
  if not found then raise exception 'profile_missing'; end if;

  -- 免費版每日上限
  select * into v_day from public.daily_activity where user_id = v_uid and day = v_today;
  if not public.is_premium(v_uid)
     and coalesce(v_day.answered, 0) >= public.cfg_int('free_daily_questions') then
    raise exception 'daily_limit_reached';
  end if;

  v_correct := (p_choice = v_q.answer);

  insert into public.attempts (user_id, question_id, choice, correct, context, answered_day)
  values (v_uid, v_q.id, p_choice, v_correct, p_context, v_today);

  insert into public.daily_activity as d (user_id, day, answered, correct)
  values (v_uid, v_today, 1, case when v_correct then 1 else 0 end)
  on conflict (user_id, day) do update
    set answered = d.answered + 1, correct = d.correct + excluded.correct
  returning * into v_day;

  if v_correct then v_xp := v_xp + public.cfg_int('xp_correct'); end if;

  -- 連勝：當天第一次達到目標題數時計算
  if v_day.answered = v_goal and (v_prof.last_goal_date is distinct from v_today) then
    v_gap := case when v_prof.last_goal_date is null then null else v_today - v_prof.last_goal_date end;
    if v_gap = 1 then
      v_prof.current_streak := v_prof.current_streak + 1;
    elsif v_gap is not null and v_gap - 1 <= v_prof.freeze_cards and v_prof.current_streak > 0 then
      -- 中間漏掉的天數用保護卡補上
      insert into public.daily_activity (user_id, day, froze)
        select v_uid, g::date, true
        from generate_series(v_prof.last_goal_date + 1, v_today - 1, interval '1 day') g
      on conflict (user_id, day) do update set froze = true;
      v_prof.freeze_cards := v_prof.freeze_cards - (v_gap - 1);
      v_prof.current_streak := v_prof.current_streak + 1;
    else
      v_prof.current_streak := 1;
    end if;
    v_prof.last_goal_date := v_today;
    v_prof.longest_streak := greatest(v_prof.longest_streak, v_prof.current_streak);
    -- 每連勝 7 天送 1 張保護卡（最多 5 張）
    if v_prof.current_streak % 7 = 0 then
      v_prof.freeze_cards := least(v_prof.freeze_cards + 1, 5);
    end if;
    v_streak_up := true;
  end if;

  -- 錯題本
  v_target := coalesce(p_for_mistake, v_q.id);
  select * into v_m from public.mistakes where user_id = v_uid and question_id = v_target for update;

  if not v_correct and p_for_mistake is null then
    insert into public.mistakes as m (user_id, question_id, next_review)
    values (v_uid, v_q.id, v_today)
    on conflict (user_id, question_id) do update
      set status = 'pending', wrong_count = m.wrong_count + 1,
          next_review = v_today, graduated_at = null;
    v_mstatus := 'pending';
  elsif not v_correct and v_m.question_id is not null then
    -- 驗收題答錯：原錯題退回待講解
    update public.mistakes set status = 'pending', next_review = v_today, graduated_at = null
      where user_id = v_uid and question_id = v_target;
    v_mstatus := 'pending';
  elsif v_correct and v_m.question_id is not null and v_m.status <> 'graduated'
        and (v_m.next_review <= v_today or v_m.status = 'pending') then
    select * into v_next from public.next_mistake_state(v_m.status);
    update public.mistakes
      set status = v_next.new_status,
          next_review = v_today + v_next.wait_days,
          graduated_at = case when v_next.new_status = 'graduated' then now() end
      where user_id = v_uid and question_id = v_target;
    v_mstatus := v_next.new_status;
    if v_next.new_status = 'graduated' then
      v_xp := v_xp + public.cfg_int('xp_mistake_graduated');
    end if;
  else
    v_mstatus := v_m.status;
  end if;

  update public.profiles
    set xp = v_prof.xp + v_xp,
        current_streak = v_prof.current_streak,
        longest_streak = v_prof.longest_streak,
        last_goal_date = v_prof.last_goal_date,
        freeze_cards = v_prof.freeze_cards
    where id = v_uid;

  return jsonb_build_object(
    'correct',        v_correct,
    'answer',         v_q.answer,
    'explanation',    v_q.explanation,
    'wrong_reason',   case when v_correct then null else v_q.wrong_reasons ->> p_choice end,
    'xp_gained',      v_xp,
    'xp_total',       v_prof.xp + v_xp,
    'today_answered', v_day.answered,
    'daily_goal',     v_goal,
    'streak',         v_prof.current_streak,
    'streak_up',      v_streak_up,
    'freeze_cards',   v_prof.freeze_cards,
    'mistake_status', v_mstatus
  );
end $$;

-- 首頁資料
create or replace function public.get_home()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  v_uid   uuid := auth.uid();
  v_today date := public.app_today();
  v_prof  public.profiles;
  v_streak int;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  select * into v_prof from public.profiles where id = v_uid;
  -- 超過一天沒達標且保護卡不夠補，就顯示為 0（下次達標時才正式重算）
  v_streak := case
    when v_prof.last_goal_date is null then 0
    when v_today - v_prof.last_goal_date - 1 <= v_prof.freeze_cards then v_prof.current_streak
    else 0 end;
  return jsonb_build_object(
    'nickname',       v_prof.nickname,
    'grade',          v_prof.grade,
    'textbook',       v_prof.textbook_version,
    'persona',        v_prof.tutor_persona,
    'xp',             v_prof.xp,
    'streak',         v_streak,
    'longest_streak', v_prof.longest_streak,
    'freeze_cards',   v_prof.freeze_cards,
    'premium',        public.is_premium(v_uid),
    'premium_until',  v_prof.premium_until,
    'daily_goal',     public.cfg_int('daily_goal'),
    'today_answered', coalesce((select answered from public.daily_activity where user_id = v_uid and day = v_today), 0),
    'due_reviews',    (select count(*) from public.mistakes where user_id = v_uid and status <> 'graduated' and status <> 'pending' and next_review <= v_today),
    'pending_mistakes', (select count(*) from public.mistakes where user_id = v_uid and status = 'pending'),
    'week', (
      select jsonb_agg(jsonb_build_object(
               'day', d::date,
               'met', coalesce(a.answered, 0) >= public.cfg_int('daily_goal'),
               'froze', coalesce(a.froze, false)) order by d)
      from generate_series(v_today - 6, v_today, interval '1 day') d
      left join public.daily_activity a on a.user_id = v_uid and a.day = d::date
    ),
    'invite_code', v_prof.invite_code
  );
end $$;

-- 單元列表與進度
create or replace function public.get_units(p_subject text default 'math')
returns table (id text, semester text, seq smallint, title text, total int, mastered int, attempted int)
language sql stable security definer set search_path = public as $$
  select u.id, u.semester, u.seq, u.title,
    (select count(*)::int from public.questions q where q.unit_id = u.id and q.active),
    (select count(distinct a.question_id)::int from public.attempts a
       join public.questions q on q.id = a.question_id
       where q.unit_id = u.id and a.user_id = auth.uid() and a.correct
         and not exists (select 1 from public.mistakes m where m.user_id = auth.uid()
                           and m.question_id = a.question_id and m.status <> 'graduated')),
    (select count(distinct a.question_id)::int from public.attempts a
       join public.questions q on q.id = a.question_id
       where q.unit_id = u.id and a.user_id = auth.uid())
  from public.units u
  where u.subject = p_subject
  order by u.semester, u.seq
$$;

-- 取題：先出沒做過的，再出做錯過的，最後才重複
create or replace function public.next_questions(p_unit_ids text[], p_limit int default 5)
returns setof public.questions_public
language sql stable security definer set search_path = public as $$
  select qp.* from public.questions_public qp
  where qp.unit_id = any (p_unit_ids)
  order by
    (exists (select 1 from public.attempts a where a.user_id = auth.uid() and a.question_id = qp.id)),
    (not exists (select 1 from public.mistakes m where m.user_id = auth.uid() and m.question_id = qp.id and m.status <> 'graduated')),
    random()
  limit least(greatest(p_limit, 1), 50)
$$;

-- 今天到期要複習的錯題
create or replace function public.due_reviews(p_limit int default 10)
returns table (question jsonb, status text, error_type text, next_review date, wrong_count int)
language sql stable security definer set search_path = public as $$
  select to_jsonb(qp.*), m.status, m.error_type, m.next_review, m.wrong_count
  from public.mistakes m join public.questions_public qp on qp.id = m.question_id
  where m.user_id = auth.uid() and m.status in ('learning', 'consolidating', 'almost')
    and m.next_review <= public.app_today()
  order by m.next_review, m.created_at
  limit least(greatest(p_limit, 1), 50)
$$;

-- 錯題本清單
create or replace function public.list_mistakes(p_status text default null)
returns table (question jsonb, status text, error_type text, next_review date, wrong_count int, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select to_jsonb(qp.*), m.status, m.error_type, m.next_review, m.wrong_count, m.created_at
  from public.mistakes m join public.questions_public qp on qp.id = m.question_id
  where m.user_id = auth.uid() and (p_status is null or m.status = p_status)
  order by (m.status = 'graduated'), m.created_at desc
$$;

-- 相似驗收題：同觀念優先，其次同單元；避開最近做過的題目
create or replace function public.similar_question(p_question_id text)
returns setof public.questions_public
language sql stable security definer set search_path = public as $$
  select qp.* from public.questions_public qp, public.questions src
  where src.id = p_question_id and qp.unit_id = src.unit_id and qp.id <> src.id
  order by (qp.concept <> src.concept),
           (exists (select 1 from public.attempts a where a.user_id = auth.uid()
                      and a.question_id = qp.id and a.answered_at > now() - interval '3 days')),
           random()
  limit 1
$$;

-- 學生修改錯誤原因
create or replace function public.set_error_type(p_question_id text, p_error_type text)
returns void language sql security definer set search_path = public as $$
  update public.mistakes set error_type = p_error_type
  where user_id = auth.uid() and question_id = p_question_id
$$;

-- 回報題目或講解有誤
create or replace function public.report_question(p_question_id text, p_kind text, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  insert into public.question_reports (user_id, question_id, kind, note)
  values (auth.uid(), p_question_id, p_kind, left(p_note, 500));
  update public.questions set reported_count = reported_count + 1 where id = p_question_id;
end $$;

-- 前三名申請
create or replace function public.apply_top_three(
  p_school text, p_grade int, p_exam text, p_rank int, p_proof_path text, p_parent_consent boolean
) returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if p_proof_path not like auth.uid()::text || '/%' then raise exception 'bad_proof_path'; end if;
  if exists (select 1 from public.top_three_applications
             where user_id = auth.uid() and status = 'pending') then
    raise exception 'already_pending';
  end if;
  insert into public.top_three_applications (user_id, school, grade, exam, school_rank, proof_path, parent_consent)
  values (auth.uid(), p_school, p_grade, p_exam, p_rank, p_proof_path, p_parent_consent)
  returning id into v_id;
  return v_id;
end $$;

-- 管理員審核（只能用 service role 或在 Supabase 後台 SQL Editor 執行）
create or replace function public.review_top_three(p_id uuid, p_approve boolean, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
declare v_app public.top_three_applications;
begin
  select * into v_app from public.top_three_applications where id = p_id for update;
  if not found or v_app.status <> 'pending' then raise exception 'not_pending'; end if;
  update public.top_three_applications
    set status = case when p_approve then 'approved' else 'rejected' end,
        reviewer_note = p_note, reviewed_at = now()
    where id = p_id;
  if p_approve then
    update public.profiles
      set premium_until = greatest(coalesce(premium_until, public.app_today()), public.semester_end(public.app_today()))
      where id = v_app.user_id;
  end if;
end $$;

-- 家長用孩子的邀請碼綁定
create or replace function public.link_child(p_code text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_child public.profiles;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if (select role from public.profiles where id = auth.uid()) <> 'parent' then raise exception 'not_parent'; end if;
  select * into v_child from public.profiles where invite_code = upper(trim(p_code)) and role = 'student';
  if not found then raise exception 'code_not_found'; end if;
  insert into public.parent_links (parent_id, student_id) values (auth.uid(), v_child.id)
  on conflict do nothing;
  return jsonb_build_object('student_id', v_child.id, 'nickname', v_child.nickname);
end $$;

-- 家長看孩子本週摘要
create or replace function public.get_child_summary(p_student uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  v_today date := public.app_today();
  v_prof  public.profiles;
begin
  if not exists (select 1 from public.parent_links where parent_id = auth.uid() and student_id = p_student) then
    raise exception 'not_linked';
  end if;
  select * into v_prof from public.profiles where id = p_student;
  return jsonb_build_object(
    'nickname', v_prof.nickname,
    'grade',    v_prof.grade,
    'streak',   v_prof.current_streak,
    'days',     (select jsonb_agg(jsonb_build_object('day', d::date,
                    'answered', coalesce(a.answered, 0), 'correct', coalesce(a.correct, 0),
                    'froze', coalesce(a.froze, false)) order by d)
                 from generate_series(v_today - 6, v_today, interval '1 day') d
                 left join public.daily_activity a on a.user_id = p_student and a.day = d::date),
    'by_subject', (select jsonb_agg(jsonb_build_object('subject', s.subject, 'answered', s.n, 'correct', s.c))
                   from (select u.subject, count(*) n, count(*) filter (where a.correct) c
                         from public.attempts a
                         join public.questions q on q.id = a.question_id
                         join public.units u on u.id = q.unit_id
                         where a.user_id = p_student and a.answered_day > v_today - 7
                         group by u.subject) s),
    'weak_units', (select jsonb_agg(w) from (
                   select u.title, u.semester, count(*) answered,
                          round(100.0 * count(*) filter (where a.correct) / count(*)) as pct
                   from public.attempts a
                   join public.questions q on q.id = a.question_id
                   join public.units u on u.id = q.unit_id
                   where a.user_id = p_student and a.answered_day > v_today - 14
                   group by u.id, u.title, u.semester
                   having count(*) >= 3
                   order by pct asc limit 3) w),
    'graduated_this_week', (select count(*) from public.mistakes
                            where user_id = p_student and graduated_at > now() - interval '7 days'),
    'error_types', (select jsonb_object_agg(error_type, n) from (
                    select error_type, count(*) n from public.mistakes
                    where user_id = p_student and error_type is not null
                      and created_at > now() - interval '14 days'
                    group by error_type) e)
  );
end $$;

-- 函式執行權限：只開放給登入者；審核函式只給 service_role
revoke execute on all functions in schema public from public, anon;
grant execute on function
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
  public.link_child(text),
  public.get_child_summary(uuid),
  public.is_premium(uuid),
  public.app_today(),
  public.cfg_int(text)
to authenticated;
grant execute on function public.review_top_three(uuid, boolean, text) to service_role;

-- =====================================================================
-- 成績證明檔案（Storage，私有）：學生只能上傳／讀取自己資料夾
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('proofs', 'proofs', false)
on conflict (id) do nothing;

drop policy if exists proofs_insert_own on storage.objects;
create policy proofs_insert_own on storage.objects for insert to authenticated
  with check (bucket_id = 'proofs' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists proofs_read_own on storage.objects;
create policy proofs_read_own on storage.objects for select to authenticated
  using (bucket_id = 'proofs' and (storage.foldername(name))[1] = auth.uid()::text);
