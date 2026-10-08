-- =====================================================================
-- 管理後台：管理員名單、審核與題目回報處理
-- 設定管理員（在 SQL Editor 執行，換成你的 Email）：
--   insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';
-- =====================================================================

create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;

alter table public.question_reports add column if not exists resolved boolean not null default false;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid())
$$;

create or replace function public.assert_admin()
returns void language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
end $$;

-- 總覽數字
create or replace function public.admin_stats()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_today date := public.app_today();
begin
  perform public.assert_admin();
  return jsonb_build_object(
    'students',          (select count(*) from public.profiles where role = 'student'),
    'parents',           (select count(*) from public.profiles where role = 'parent'),
    'active_today',      (select count(*) from public.daily_activity where day = v_today and answered > 0),
    'active_7d',         (select count(distinct user_id) from public.daily_activity where day > v_today - 7 and answered > 0),
    'answers_today',     (select coalesce(sum(answered), 0) from public.daily_activity where day = v_today),
    'subscribers',       (select count(*) from public.profiles where subscription_until > now()),
    'top_three_active',  (select count(*) from public.profiles where premium_until >= v_today),
    'pending_top_three', (select count(*) from public.top_three_applications where status = 'pending'),
    'open_reports',      (select count(*) from public.question_reports where not resolved),
    'tutor_today',       (select coalesce(sum(count), 0) from public.tutor_usage where day = v_today)
  );
end $$;

-- 待審核的前三名申請
create or replace function public.admin_pending_applications()
returns table (id uuid, user_id uuid, nickname text, school text, grade smallint, exam text,
               school_rank smallint, proof_path text, created_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public.assert_admin();
  return query
    select a.id, a.user_id, p.nickname, a.school, a.grade, a.exam, a.school_rank, a.proof_path, a.created_at
    from public.top_three_applications a join public.profiles p on p.id = a.user_id
    where a.status = 'pending' order by a.created_at;
end $$;

-- 審核（回傳證明檔路徑，後台接著刪除照片）
create or replace function public.admin_review_top_three(p_id uuid, p_approve boolean, p_note text default null)
returns text language plpgsql security definer set search_path = public as $$
declare v_path text;
begin
  perform public.assert_admin();
  select proof_path into v_path from public.top_three_applications where id = p_id;
  perform public.review_top_three(p_id, p_approve, left(p_note, 200));
  return v_path;
end $$;

-- 題目回報
create or replace function public.admin_reports(p_include_resolved boolean default false)
returns table (report_id bigint, created_at timestamptz, kind text, note text, resolved boolean,
               question_id text, unit_title text, stem text, options jsonb, answer text,
               explanation text, active boolean, reported_count int)
language plpgsql stable security definer set search_path = public as $$
begin
  perform public.assert_admin();
  return query
    select r.id, r.created_at, r.kind, r.note, r.resolved, q.id, u.title, q.stem, q.options, q.answer,
           q.explanation, q.active, q.reported_count
    from public.question_reports r
    join public.questions q on q.id = r.question_id
    join public.units u on u.id = q.unit_id
    where p_include_resolved or not r.resolved
    order by r.created_at desc limit 200;
end $$;

create or replace function public.admin_resolve_report(p_report_id bigint)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.assert_admin();
  update public.question_reports set resolved = true where id = p_report_id;
end $$;

create or replace function public.admin_set_question_active(p_question_id text, p_active boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.assert_admin();
  update public.questions set active = p_active where id = p_question_id;
end $$;

revoke execute on function public.is_admin(), public.assert_admin(), public.admin_stats(),
  public.admin_pending_applications(), public.admin_review_top_three(uuid, boolean, text),
  public.admin_reports(boolean), public.admin_resolve_report(bigint),
  public.admin_set_question_active(text, boolean) from public, anon;
grant execute on function public.is_admin(), public.admin_stats(),
  public.admin_pending_applications(), public.admin_review_top_three(uuid, boolean, text),
  public.admin_reports(boolean), public.admin_resolve_report(bigint),
  public.admin_set_question_active(text, boolean) to authenticated;

-- 管理員可以看、刪成績證明照片
drop policy if exists proofs_admin_read on storage.objects;
create policy proofs_admin_read on storage.objects for select to authenticated
  using (bucket_id = 'proofs' and public.is_admin());
drop policy if exists proofs_admin_delete on storage.objects;
create policy proofs_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'proofs' and public.is_admin());
