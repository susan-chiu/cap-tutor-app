-- =====================================================================
-- 教科書版本（康軒／南一／翰林）：各版本的學期與章節對照
-- 題目各版本通用（會考不分版本），不同的是「在哪個學期、第幾章教」。
-- 國文依會考能力分單元，不分版本。
-- =====================================================================

create table if not exists public.unit_versions (
  unit_id       text not null references public.units (id) on delete cascade,
  version       text not null check (version in ('康軒', '南一', '翰林')),
  semester      text not null check (semester in ('7A', '7B', '8A', '8B', '9A', '9B')),
  chapter       text not null,        -- 該版本的章／課次，例如 "2"、"L3"、"地理 1~6"
  chapter_title text not null,        -- 該版本的章名（簡短事實性名稱）
  sort          int  not null default 0,
  confidence    text not null default 'medium' check (confidence in ('high', 'medium', 'low')),
  primary key (unit_id, version)
);
alter table public.unit_versions enable row level security;
revoke all on public.unit_versions from anon, authenticated;
grant select on public.unit_versions to authenticated;
drop policy if exists unit_versions_read on public.unit_versions;
create policy unit_versions_read on public.unit_versions for select to authenticated using (true);

-- 學生各科使用的版本，例如 {"math": "康軒", "english": "翰林"}；沒有設定的科目 = 不分版本
create or replace function public.valid_textbook_versions(p jsonb)
returns boolean language sql immutable as $$
  select jsonb_typeof(p) = 'object' and not exists (
    select 1 from jsonb_each(p) e
    where e.key not in ('math', 'english', 'science', 'social')
       or jsonb_typeof(e.value) <> 'string'
       or (e.value #>> '{}') not in ('康軒', '南一', '翰林')
  )
$$;

alter table public.profiles add column if not exists textbook_versions jsonb not null default '{}';
alter table public.profiles drop constraint if exists profiles_textbook_versions_check;
alter table public.profiles add constraint profiles_textbook_versions_check
  check (public.valid_textbook_versions(textbook_versions));
grant update (textbook_versions) on public.profiles to authenticated;

-- 已經選過單一版本的學生，套用到各科
update public.profiles
  set textbook_versions = jsonb_build_object('math', textbook_version, 'english', textbook_version,
                                             'science', textbook_version, 'social', textbook_version)
  where textbook_version is not null and textbook_versions = '{}';

-- 單元列表：可指定版本（學期、章節順序照該版本）
drop function if exists public.get_units(text);
create or replace function public.get_units(p_subject text default 'math', p_version text default null)
returns table (id text, semester text, seq int, title text, chapter text, chapter_title text,
               total int, mastered int, attempted int)
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
       where q.unit_id = u.id and a.user_id = auth.uid())
  from public.units u
  left join public.unit_versions v on v.unit_id = u.id and v.version = p_version
  where u.subject = p_subject
  order by 2, 3, u.id
$$;

revoke execute on function public.get_units(text, text), public.valid_textbook_versions(jsonb) from public, anon;
grant execute on function public.get_units(text, text) to authenticated;
-- check 限制式會以使用者身分執行這個函式
grant execute on function public.valid_textbook_versions(jsonb) to authenticated;
