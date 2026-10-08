-- =====================================================================
-- 1. 會考模擬考成績紀錄（伺服器依實際作答計分，學生不能自己改分數）
-- 2. 家長看孩子的模擬考成績
-- 3. 英語聽力：題目附「聽力原文」，App 用手機語音朗讀
-- =====================================================================

-- ---------- 模擬考成績 ----------
create table if not exists public.mock_exams (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  -- english_listening = 英語聽力（會考聽力與閱讀分開計分）
  subject      text not null check (subject in ('math', 'chinese', 'english', 'english_listening', 'science', 'social')),
  full_length  boolean not null,
  total        int not null check (total between 1 and 60),
  correct      int not null,
  unanswered   int not null,
  score        int not null check (score between 0 and 100),
  duration_sec int not null default 0,
  by_unit      jsonb not null default '[]',
  created_at   timestamptz not null default now()
);
create index if not exists mock_exams_user_idx on public.mock_exams (user_id, subject, created_at desc);
alter table public.mock_exams enable row level security;
revoke all on public.mock_exams from anon, authenticated;
grant select on public.mock_exams to authenticated;
drop policy if exists mock_exams_own on public.mock_exams;
create policy mock_exams_own on public.mock_exams for select to authenticated using (user_id = auth.uid());

-- 交卷後呼叫：依這次考卷的題目，讀取剛剛送出的作答（3 小時內、context = exam）計分
create or replace function public.save_mock_exam(p_subject text, p_full boolean, p_question_ids text[], p_duration_sec int)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_total    int := coalesce(array_length(p_question_ids, 1), 0);
  v_correct  int;
  v_answered int;
  v_score    int;
  v_by       jsonb;
  v_prev     int;
  v_id       uuid;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if p_subject not in ('math', 'chinese', 'english', 'english_listening', 'science', 'social') then raise exception 'bad_subject'; end if;
  if v_total = 0 or v_total > 60 then raise exception 'bad_exam'; end if;
  -- 同一份考卷 1 分鐘內重複送出，回傳原本那筆
  select id, score into v_id, v_score from public.mock_exams
    where user_id = auth.uid() and subject = p_subject and created_at > now() - interval '1 minute' and total = v_total
    order by created_at desc limit 1;
  if v_id is not null then
    return jsonb_build_object('id', v_id, 'score', v_score, 'duplicate', true);
  end if;

  with last as (
    select distinct on (a.question_id) a.question_id, a.correct
    from public.attempts a
    where a.user_id = auth.uid() and a.context = 'exam' and a.question_id = any (p_question_ids)
      and a.answered_at > now() - interval '3 hours'
    order by a.question_id, a.answered_at desc
  )
  select count(*) filter (where correct), count(*) into v_correct, v_answered from last;

  with last as (
    select distinct on (a.question_id) a.question_id, a.correct
    from public.attempts a
    where a.user_id = auth.uid() and a.context = 'exam' and a.question_id = any (p_question_ids)
      and a.answered_at > now() - interval '3 hours'
    order by a.question_id, a.answered_at desc
  ), per as (
    select q.unit_id, u.title, count(*)::int n, count(*) filter (where l.correct)::int ok
    from unnest(p_question_ids) as t(qid)
    join public.questions q on q.id = t.qid
    join public.units u on u.id = q.unit_id
    left join last l on l.question_id = q.id
    group by q.unit_id, u.title
  )
  select coalesce(jsonb_agg(jsonb_build_object('unit_id', unit_id, 'title', title, 'n', n, 'ok', ok) order by ok::float / n, unit_id), '[]')
    into v_by from per;

  v_score := round(v_correct * 100.0 / v_total);
  select score into v_prev from public.mock_exams
    where user_id = auth.uid() and subject = p_subject and full_length = p_full
    order by created_at desc limit 1;

  insert into public.mock_exams (user_id, subject, full_length, total, correct, unanswered, score, duration_sec, by_unit)
  values (auth.uid(), p_subject, p_full, v_total, v_correct, v_total - v_answered, v_score,
          greatest(least(coalesce(p_duration_sec, 0), 6 * 3600), 0), v_by)
  returning id into v_id;

  return jsonb_build_object('id', v_id, 'score', v_score, 'correct', v_correct, 'total', v_total,
                            'previous_score', v_prev);
end $$;

-- 自己的歷次成績（新到舊）
create or replace function public.my_mock_exams(p_subject text default null, p_limit int default 30)
returns setof public.mock_exams
language sql stable security definer set search_path = public as $$
  select * from public.mock_exams
  where user_id = auth.uid() and (p_subject is null or subject = p_subject)
  order by created_at desc
  limit least(greatest(p_limit, 1), 100)
$$;

-- 家長看孩子的歷次成績（需已綁定）
create or replace function public.child_mock_exams(p_student uuid, p_limit int default 30)
returns setof public.mock_exams
language plpgsql stable security definer set search_path = public as $$
begin
  if not exists (select 1 from public.parent_links where parent_id = auth.uid() and student_id = p_student) then
    raise exception 'not_linked';
  end if;
  return query select * from public.mock_exams where user_id = p_student
    order by created_at desc limit least(greatest(p_limit, 1), 100);
end $$;

-- ---------- 英語聽力 ----------
alter table public.questions add column if not exists listen_script text;

create or replace view public.questions_public as
  select q.id, q.unit_id, q.concept, q.stem, q.options, q.difficulty, q.source,
         u.subject, u.semester, u.title as unit_title, q.listen_script
  from public.questions q join public.units u on u.id = q.unit_id
  where q.active;
grant select on public.questions_public to authenticated;

drop function if exists public.daily_questions(text[], text, int);
create or replace function public.daily_questions(p_subjects text[], p_max_sem text default null, p_limit int default 5)
returns table (id text, unit_id text, concept text, stem text, options jsonb, difficulty smallint, source text,
               subject text, semester text, unit_title text, listen_script text, seen boolean)
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
  select r.id, r.unit_id, r.concept, r.stem, r.options, r.difficulty, r.source, r.subject, r.semester, r.unit_title,
         r.listen_script, r.seen
  from ranked r
  order by r.rn, random()
  limit least(greatest(p_limit, 1), 50)
$$;

drop function if exists public.practice_questions(text[], int);
create or replace function public.practice_questions(p_unit_ids text[], p_limit int default 5)
returns table (id text, unit_id text, concept text, stem text, options jsonb, difficulty smallint, source text,
               subject text, semester text, unit_title text, listen_script text, seen boolean)
language sql volatile security definer set search_path = public as $$
  select qp.id, qp.unit_id, qp.concept, qp.stem, qp.options, qp.difficulty, qp.source, qp.subject, qp.semester, qp.unit_title,
    qp.listen_script,
    exists (select 1 from public.attempts a where a.user_id = auth.uid() and a.question_id = qp.id)
  from public.questions_public qp
  where qp.unit_id = any (p_unit_ids)
  order by
    (exists (select 1 from public.attempts a where a.user_id = auth.uid() and a.question_id = qp.id)),
    (not exists (select 1 from public.mistakes m where m.user_id = auth.uid() and m.question_id = qp.id and m.status <> 'graduated')),
    random()
  limit least(greatest(p_limit, 1), 60)
$$;

revoke execute on function public.save_mock_exam(text, boolean, text[], int), public.my_mock_exams(text, int),
  public.child_mock_exams(uuid, int), public.daily_questions(text[], text, int), public.practice_questions(text[], int)
  from public, anon;
grant execute on function public.save_mock_exam(text, boolean, text[], int), public.my_mock_exams(text, int),
  public.child_mock_exams(uuid, int), public.daily_questions(text[], text, int), public.practice_questions(text[], int)
  to authenticated;
