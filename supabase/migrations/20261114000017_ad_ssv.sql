-- 獎勵式廣告：伺服器端驗證（SSV）、各位置獨立廣告單元
-- AdMob 看完廣告會呼叫 Edge Function admob-ssv，驗過簽章後寫進 ad_views；
-- ad_ssv_required 打開後，grant_ad_reward 要先有這筆紀錄才發獎勵（避免 App 被動手腳）。
-- 預設關閉：等 AdMob 後台填好回呼網址、確認收得到通知後，再把它改成 true。
insert into public.app_config (key, value) values ('ad_ssv_required', 'false') on conflict (key) do nothing;

create table if not exists public.ad_views (
  id             bigserial primary key,
  transaction_id text not null unique,
  user_id        uuid not null references auth.users (id) on delete cascade,
  placement      text not null check (placement in ('energy', 'xp2x', 'tutor')),
  ad_unit        text,
  ad_network     text,
  created_at     timestamptz not null default now(),
  used_at        timestamptz
);
create index if not exists ad_views_user_idx on public.ad_views (user_id, placement, created_at desc);
alter table public.ad_views enable row level security;
-- 只有 Edge Function（service role）寫入，學生不能讀寫

-- 看完廣告後發獎勵。p_placement：energy（今天多 N 題）、xp2x（把最近 15 分鐘賺到的 XP 再給一次）、tutor（多 1 次小老師）
create or replace function public.grant_ad_reward(p_placement text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid   uuid := auth.uid();
  v_today date := public.app_today();
  v_total int; v_here int; v_last timestamptz;
  v_max_here int;
  v_amount int := 0;
  v_xp int;
  v_row public.tutor_usage;
  v_view bigint;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  if p_placement not in ('energy', 'xp2x', 'tutor') then raise exception 'bad_placement'; end if;
  if (select value #>> '{}' from public.app_config where key = 'ads_enabled') <> 'true' then raise exception 'ads_disabled'; end if;
  if public.is_premium(v_uid) then raise exception 'already_premium'; end if;

  -- 鎖住這個使用者今天的列，避免同時按兩次
  perform pg_advisory_xact_lock(hashtext(v_uid::text || v_today::text));
  select count(*), count(*) filter (where placement = p_placement), max(created_at)
    into v_total, v_here, v_last
  from public.ad_rewards where user_id = v_uid and day = v_today;
  if v_total >= public.cfg_int('ad_daily_max') then raise exception 'ad_daily_limit'; end if;
  v_max_here := case p_placement when 'energy' then public.cfg_int('ad_energy_daily_max')
                                 when 'xp2x'   then public.cfg_int('ad_xp2x_daily_max')
                                 else public.cfg_int('ad_bonus_daily_max') end;
  if v_here >= v_max_here then raise exception 'ad_bonus_limit'; end if;
  if v_last is not null and v_last > now() - interval '20 seconds' then raise exception 'ad_bonus_too_fast'; end if;

  -- 伺服器驗證：有開的話，要先收到 AdMob 的回呼（10 分鐘內、同位置、還沒用過的）才發
  if (select value #>> '{}' from public.app_config where key = 'ad_ssv_required') = 'true' then
    select id into v_view from public.ad_views
    where user_id = v_uid and placement = p_placement and used_at is null and created_at > now() - interval '10 minutes'
    order by created_at desc limit 1 for update skip locked;
    if v_view is null then raise exception 'ad_not_verified'; end if;
    update public.ad_views set used_at = now() where id = v_view;
  end if;

  if p_placement = 'energy' then
    v_amount := public.cfg_int('ad_energy_questions');
    insert into public.daily_activity (user_id, day, answered, correct, bonus_questions)
    values (v_uid, v_today, 0, 0, v_amount)
    on conflict (user_id, day) do update set bonus_questions = public.daily_activity.bonus_questions + excluded.bonus_questions;
  elsif p_placement = 'xp2x' then
    -- 最近 15 分鐘答題賺到的 XP（含心眼獎勵）再給一次；沒有就不發
    select coalesce(sum(xp), 0) into v_amount from (
      select public.cfg_int('xp_correct') as xp
      from public.attempts where user_id = v_uid and correct and answered_at > now() - interval '15 minutes'
      union all
      select 3 from public.retry_bonuses where user_id = v_uid and correct and created_at > now() - interval '15 minutes'
    ) s;
    v_amount := least(v_amount, public.cfg_int('ad_xp2x_cap'));
    if v_amount <= 0 then raise exception 'ad_nothing_to_double'; end if;
    update public.profiles set xp = xp + v_amount where id = v_uid returning xp into v_xp;
  else
    insert into public.tutor_usage (user_id, day) values (v_uid, v_today) on conflict (user_id, day) do nothing;
    update public.tutor_usage set bonus = bonus + 1, last_bonus_at = now() where user_id = v_uid and day = v_today
      returning * into v_row;
    v_amount := 1;
  end if;

  insert into public.ad_rewards (user_id, day, placement, amount) values (v_uid, v_today, p_placement, v_amount);
  return jsonb_build_object('placement', p_placement, 'amount', v_amount, 'xp_total', v_xp,
    'bonus', v_row.bonus, 'bonus_left', case when v_row.bonus is null then null else public.cfg_int('ad_bonus_daily_max') - v_row.bonus end)
    || public.ad_status();
end $$;

