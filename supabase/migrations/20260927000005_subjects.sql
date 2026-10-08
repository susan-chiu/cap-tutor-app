-- =====================================================================
-- 多科目：學生可選擇每日練習要包含哪些科目
-- =====================================================================
alter table public.profiles add column if not exists daily_subjects text[] not null
  default array['math', 'chinese', 'english', 'science', 'social'];

alter table public.profiles drop constraint if exists profiles_daily_subjects_check;
alter table public.profiles add constraint profiles_daily_subjects_check check (
  cardinality(daily_subjects) between 1 and 5
  and daily_subjects <@ array['math', 'chinese', 'english', 'science', 'social']
);

grant update (daily_subjects) on public.profiles to authenticated;
