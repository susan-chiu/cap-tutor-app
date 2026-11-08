-- 勇者風改版：心眼重答獎勵、許願池（孩子許願、家長核准與兌現）

-- 1. 心眼重答：剛答錯的題目可以再選一次，答對加 3 XP（錯題紀錄不變）
create table if not exists public.retry_bonuses (
  attempt_id bigint primary key references public.attempts (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  correct    boolean not null,
  created_at timestamptz not null default now()
);
alter table public.retry_bonuses enable row level security;

create or replace function public.retry_bonus(p_question_id text, p_choice text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_att public.attempts;
  v_ok boolean;
  v_xp int;
  v_gain int := 0;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  -- 只能重答「15 分鐘內最後一次答錯」的那一題，每次答錯只能重答一次
  select * into v_att from public.attempts
  where user_id = auth.uid() and question_id = p_question_id and answered_at > now() - interval '15 minutes'
  order by answered_at desc, id desc limit 1;
  if v_att.id is null or v_att.correct then raise exception 'no_retry'; end if;
  if p_choice = v_att.choice then raise exception 'same_choice'; end if;
  select p_choice = q.answer into v_ok from public.questions q where q.id = p_question_id;
  insert into public.retry_bonuses (attempt_id, user_id, correct) values (v_att.id, auth.uid(), coalesce(v_ok, false))
  on conflict (attempt_id) do nothing;
  if not found then raise exception 'already_retried'; end if;
  if v_ok then
    v_gain := 3;
    update public.profiles set xp = xp + v_gain where id = auth.uid() returning xp into v_xp;
  else
    select xp into v_xp from public.profiles where id = auth.uid();
  end if;
  return jsonb_build_object('correct', coalesce(v_ok, false), 'xp_gained', v_gain, 'xp_total', v_xp);
end $$;

-- 2. 許願池：孩子許願（例如「答對 50 題 → 週末多玩 1 小時手機」），家長核准後開始計算進度，達成後家長兌現
create table if not exists public.wishes (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references auth.users (id) on delete cascade,
  title        text not null check (length(btrim(title)) between 1 and 40),
  goal_type    text not null check (goal_type in ('correct', 'days', 'graduated')),
  goal         int  not null check (goal between 1 and 1000),
  status       text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'fulfilled')),
  reviewed_by  uuid references auth.users (id) on delete set null,
  approved_at  timestamptz,
  fulfilled_at timestamptz,
  created_at   timestamptz not null default now()
);
create index if not exists wishes_student_idx on public.wishes (student_id, created_at desc);
alter table public.wishes enable row level security;
-- 只透過下面的函式讀寫

-- 核准之後才開始算：答對題數、達成每日目標的天數、錯題畢業數
create or replace function public.wish_progress(w public.wishes)
returns int language sql stable security definer set search_path = public as $$
  select case
    when w.approved_at is null then 0
    when w.goal_type = 'correct' then (select count(*)::int from public.attempts
      where user_id = w.student_id and correct and answered_at >= w.approved_at)
    when w.goal_type = 'days' then (select count(*)::int from public.daily_activity
      where user_id = w.student_id and day >= (w.approved_at at time zone 'Asia/Taipei')::date
        and answered >= public.cfg_int('daily_goal'))
    else (select count(*)::int from public.mistakes
      where user_id = w.student_id and status = 'graduated' and graduated_at >= w.approved_at)
  end
$$;

create or replace function public.wish_json(w public.wishes)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('id', w.id, 'title', w.title, 'goal_type', w.goal_type, 'goal', w.goal, 'status', w.status,
    'progress', least(public.wish_progress(w), w.goal), 'reached', public.wish_progress(w) >= w.goal,
    'approved_at', w.approved_at, 'fulfilled_at', w.fulfilled_at, 'created_at', w.created_at)
$$;

create or replace function public.make_wish(p_title text, p_goal_type text, p_goal int)
returns jsonb language plpgsql security definer set search_path = public as $$
declare w public.wishes;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if (select role from public.profiles where id = auth.uid()) <> 'student' then raise exception 'not_student'; end if;
  if (select count(*) from public.wishes where student_id = auth.uid() and status in ('pending', 'approved')) >= 3 then
    raise exception 'too_many_wishes';
  end if;
  insert into public.wishes (student_id, title, goal_type, goal) values (auth.uid(), btrim(p_title), p_goal_type, p_goal)
  returning * into w;
  return public.wish_json(w);
end $$;

create or replace function public.my_wishes()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(public.wish_json(w) order by (w.status = 'fulfilled'), w.created_at desc), '[]'::jsonb)
  from public.wishes w where w.student_id = auth.uid() and w.created_at > now() - interval '120 days'
$$;

create or replace function public.cancel_wish(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.wishes where id = p_id and student_id = auth.uid() and status <> 'fulfilled';
end $$;

create or replace function public.child_wishes(p_student uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not exists (select 1 from public.parent_links where parent_id = auth.uid() and student_id = p_student) then
    raise exception 'not_linked';
  end if;
  return (select coalesce(jsonb_agg(public.wish_json(w) order by (w.status = 'fulfilled'), w.created_at desc), '[]'::jsonb)
    from public.wishes w where w.student_id = p_student and w.created_at > now() - interval '120 days');
end $$;

-- 家長核准或拒絕（只能處理待審核的）
create or replace function public.review_wish(p_id uuid, p_approve boolean)
returns jsonb language plpgsql security definer set search_path = public as $$
declare w public.wishes;
begin
  select * into w from public.wishes where id = p_id;
  if w.id is null or not exists (select 1 from public.parent_links where parent_id = auth.uid() and student_id = w.student_id) then
    raise exception 'not_linked';
  end if;
  if w.status <> 'pending' then raise exception 'wish_not_pending'; end if;
  update public.wishes set status = case when p_approve then 'approved' else 'rejected' end, reviewed_by = auth.uid(),
    approved_at = case when p_approve then now() end
  where id = p_id returning * into w;
  return public.wish_json(w);
end $$;

-- 家長兌現（孩子要先達成目標）
create or replace function public.fulfill_wish(p_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare w public.wishes;
begin
  select * into w from public.wishes where id = p_id;
  if w.id is null or not exists (select 1 from public.parent_links where parent_id = auth.uid() and student_id = w.student_id) then
    raise exception 'not_linked';
  end if;
  if w.status <> 'approved' then raise exception 'wish_not_approved'; end if;
  if public.wish_progress(w) < w.goal then raise exception 'wish_not_reached'; end if;
  update public.wishes set status = 'fulfilled', fulfilled_at = now() where id = p_id returning * into w;
  return public.wish_json(w);
end $$;

revoke execute on function public.retry_bonus(text, text), public.wish_progress(public.wishes), public.wish_json(public.wishes),
  public.make_wish(text, text, int), public.my_wishes(), public.cancel_wish(uuid), public.child_wishes(uuid),
  public.review_wish(uuid, boolean), public.fulfill_wish(uuid) from public, anon;
grant execute on function public.retry_bonus(text, text), public.make_wish(text, text, int), public.my_wishes(),
  public.cancel_wish(uuid), public.child_wishes(uuid), public.review_wish(uuid, boolean), public.fulfill_wish(uuid) to authenticated;
