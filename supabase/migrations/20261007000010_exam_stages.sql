-- 段考分階段複習、難度選擇、完整詳解
-- 1. get_units 多回傳每個單元的作答次數與答對次數（算段考範圍的答對率、找出弱點）
drop function if exists public.get_units(text, text);
create or replace function public.get_units(p_subject text default 'math', p_version text default null)
returns table (id text, semester text, seq int, title text, chapter text, chapter_title text,
               total int, mastered int, attempted int, answered int, correct int)
language sql stable security definer set search_path = public as $$
  select u.id,
    coalesce(v.semester, u.semester),
    coalesce(v.sort, u.seq)::int,
    u.title, v.chapter, v.chapter_title,
    (select count(*)::int from public.questions q where q.unit_id = u.id and q.active),
    (select count(distinct a.question_id)::int from public.attempts a
       join public.questions q on q.id = a.question_id
       where q.unit_id = u.id and a.user_id = auth.uid() and a.correct
         and not exists (select 1 from public.mistakes m where m.user_id = auth.uid()
                           and m.question_id = a.question_id and m.status <> 'graduated')),
    (select count(distinct a.question_id)::int from public.attempts a
       join public.questions q on q.id = a.question_id
       where q.unit_id = u.id and a.user_id = auth.uid()),
    (select count(*)::int from public.attempts a join public.questions q on q.id = a.question_id
       where q.unit_id = u.id and a.user_id = auth.uid()),
    (select count(*)::int from public.attempts a join public.questions q on q.id = a.question_id
       where q.unit_id = u.id and a.user_id = auth.uid() and a.correct)
  from public.units u
  left join public.unit_versions v on v.unit_id = u.id and v.version = p_version
  where u.subject = p_subject
  order by 2, 3, u.id
$$;

-- 2. 練習出題可以指定難度（1 簡單、2 中等、3 困難；不指定 = 混合）
drop function if exists public.practice_questions(text[], int);
create or replace function public.practice_questions(p_unit_ids text[], p_limit int default 5, p_difficulty smallint default null)
returns table (id text, unit_id text, concept text, stem text, options jsonb, difficulty smallint, source text,
               subject text, semester text, unit_title text, listen_script text, seen boolean)
language sql volatile security definer set search_path = public as $$
  select qp.id, qp.unit_id, qp.concept, qp.stem, qp.options, qp.difficulty, qp.source, qp.subject, qp.semester, qp.unit_title,
    qp.listen_script,
    exists (select 1 from public.attempts a where a.user_id = auth.uid() and a.question_id = qp.id)
  from public.questions_public qp
  where qp.unit_id = any (p_unit_ids)
    and (p_difficulty is null or qp.difficulty = p_difficulty)
  order by
    (exists (select 1 from public.attempts a where a.user_id = auth.uid() and a.question_id = qp.id)),
    (not exists (select 1 from public.mistakes m where m.user_id = auth.uid() and m.question_id = qp.id and m.status <> 'graduated')),
    random()
  limit least(greatest(p_limit, 1), 60)
$$;

-- 3. 完整詳解：答案、解析、解題步驟、每個錯誤選項的原因。只有作答過這題的人看得到（避免先偷看答案）
create or replace function public.question_solution(p_question_id text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_q public.questions;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if not exists (select 1 from public.attempts where user_id = auth.uid() and question_id = p_question_id) then
    raise exception 'not_answered';
  end if;
  select * into v_q from public.questions where id = p_question_id;
  if not found then raise exception 'question_not_found'; end if;
  return jsonb_build_object('answer', v_q.answer, 'explanation', v_q.explanation, 'hints', v_q.hints,
                            'wrong_reasons', v_q.wrong_reasons, 'options', v_q.options);
end $$;

revoke execute on function public.get_units(text, text), public.practice_questions(text[], int, smallint),
  public.question_solution(text) from public, anon;
grant execute on function public.get_units(text, text), public.practice_questions(text[], int, smallint),
  public.question_solution(text) to authenticated;
