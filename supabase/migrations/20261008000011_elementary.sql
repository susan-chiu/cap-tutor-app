-- 國小高年級（五、六年級）：國語、數學題庫
-- 1. 年級可以是 5～9；學期多了 5A～6B
alter table public.profiles drop constraint if exists profiles_grade_check;
alter table public.profiles add constraint profiles_grade_check check (grade between 5 and 9);
alter table public.top_three_applications drop constraint if exists top_three_applications_grade_check;
alter table public.top_three_applications add constraint top_three_applications_grade_check check (grade between 5 and 9);
alter table public.units drop constraint if exists units_semester_check;
alter table public.units add constraint units_semester_check
  check (semester in ('5A', '5B', '6A', '6B', '7A', '7B', '8A', '8B', '9A', '9B'));

-- 2. 每日 5 題不跨學制：國小生（五、六年級）只出國小單元，國中生只出國中單元
create or replace function public.daily_questions(p_subjects text[], p_max_sem text default null, p_limit int default 5)
returns table (id text, unit_id text, concept text, stem text, options jsonb, difficulty smallint, source text,
               subject text, semester text, unit_title text, listen_script text, seen boolean)
language sql volatile security definer set search_path = public as $$
  with prof as (
    select coalesce(textbook_versions, '{}'::jsonb) tv, coalesce(grade, 7) <= 6 as elementary
    from public.profiles where id = auth.uid()
  ),
  units_ok as (
    select u.id
    from public.units u
    left join public.unit_versions v on v.unit_id = u.id and v.version = ((select tv from prof) ->> u.subject)
    where u.subject = any (p_subjects)
      and (left(u.semester, 1) in ('5', '6')) = coalesce((select elementary from prof), false)
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

revoke execute on function public.daily_questions(text[], text, int) from public, anon;
grant execute on function public.daily_questions(text[], text, int) to authenticated;
