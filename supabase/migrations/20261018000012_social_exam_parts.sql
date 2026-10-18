-- 社會科段考範圍：每次段考都考地理、歷史、公民各一部分
-- 1. 題目多一欄 exam_part（1～3＝第幾次段考的範圍；其他科目為 null，整個單元一起考）
alter table public.questions add column if not exists exam_part smallint
  check (exam_part is null or exam_part between 1 and 3);
create index if not exists questions_unit_part_idx on public.questions (unit_id, exam_part);

-- 2. 每個單元在各次段考範圍的題數與學習進度（算法和 get_units 相同，只是多分 exam_part）
create or replace function public.get_unit_parts(p_subject text default 'social')
returns table (unit_id text, part smallint, total int, mastered int, attempted int, answered int, correct int)
language sql stable security definer set search_path = public as $$
  select q.unit_id, q.exam_part,
    count(*)::int,
    count(*) filter (where exists (select 1 from public.attempts a where a.user_id = auth.uid() and a.question_id = q.id and a.correct)
                       and not exists (select 1 from public.mistakes m where m.user_id = auth.uid()
                                         and m.question_id = q.id and m.status <> 'graduated'))::int,
    count(*) filter (where exists (select 1 from public.attempts a where a.user_id = auth.uid() and a.question_id = q.id))::int,
    coalesce(sum((select count(*) from public.attempts a where a.user_id = auth.uid() and a.question_id = q.id)), 0)::int,
    coalesce(sum((select count(*) from public.attempts a where a.user_id = auth.uid() and a.question_id = q.id and a.correct)), 0)::int
  from public.questions q
  join public.units u on u.id = q.unit_id
  where u.subject = p_subject and q.active and q.exam_part is not null
  group by q.unit_id, q.exam_part
  order by 1, 2
$$;

-- 3. 練習出題可以只出某次段考的範圍（p_part；不指定＝整個單元）
drop function if exists public.practice_questions(text[], int, smallint);
create or replace function public.practice_questions(p_unit_ids text[], p_limit int default 5,
  p_difficulty smallint default null, p_part smallint default null)
returns table (id text, unit_id text, concept text, stem text, options jsonb, difficulty smallint, source text,
               subject text, semester text, unit_title text, listen_script text, seen boolean)
language sql volatile security definer set search_path = public as $$
  select qp.id, qp.unit_id, qp.concept, qp.stem, qp.options, qp.difficulty, qp.source, qp.subject, qp.semester, qp.unit_title,
    qp.listen_script,
    exists (select 1 from public.attempts a where a.user_id = auth.uid() and a.question_id = qp.id)
  from public.questions_public qp
  where qp.unit_id = any (p_unit_ids)
    and (p_difficulty is null or qp.difficulty = p_difficulty)
    and (p_part is null or exists (select 1 from public.questions q where q.id = qp.id and q.exam_part = p_part))
  order by
    (exists (select 1 from public.attempts a where a.user_id = auth.uid() and a.question_id = qp.id)),
    (not exists (select 1 from public.mistakes m where m.user_id = auth.uid() and m.question_id = qp.id and m.status <> 'graduated')),
    random()
  limit least(greatest(p_limit, 1), 60)
$$;

revoke execute on function public.get_unit_parts(text), public.practice_questions(text[], int, smallint, smallint) from public, anon;
grant execute on function public.get_unit_parts(text), public.practice_questions(text[], int, smallint, smallint) to authenticated;
