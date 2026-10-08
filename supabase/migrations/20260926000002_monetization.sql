-- =====================================================================
-- 收費與廣告：訂閱到期日（RevenueCat 同步）、看廣告換小老師次數
-- =====================================================================

insert into public.app_config (key, value) values
  ('ad_bonus_daily_max', '2'),     -- 免費版每天最多看幾次廣告換小老師
  ('ads_enabled',        'true')
on conflict (key) do nothing;

-- 訂閱到期時間（由伺服器依 RevenueCat 資料寫入，學生不能改）
alter table public.profiles add column if not exists subscription_until timestamptz;

-- 看廣告獲得的額外小老師次數
alter table public.tutor_usage add column if not exists bonus int not null default 0;
alter table public.tutor_usage add column if not exists last_bonus_at timestamptz;

-- 完整版 = 前三名審核通過（premium_until）或 訂閱有效（subscription_until）
create or replace function public.is_premium(p_user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((
    select (premium_until >= public.app_today()) or (subscription_until > now())
    from public.profiles where id = p_user
  ), false)
$$;

-- 完整版到期日（兩種來源取較晚者），給首頁顯示
create or replace function public.premium_until_of(p_user uuid)
returns date language sql stable security definer set search_path = public as $$
  select nullif(greatest(
    coalesce(premium_until, '1900-01-01'::date),
    coalesce((subscription_until at time zone 'Asia/Taipei')::date, '1900-01-01'::date)
  ), '1900-01-01'::date)
  from public.profiles where id = p_user
$$;

-- 首頁：沿用原本內容，改用新的完整版判斷
create or replace function public.get_home()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  v_uid   uuid := auth.uid();
  v_today date := public.app_today();
  v_prof  public.profiles;
  v_streak int;
  v_usage public.tutor_usage;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  select * into v_prof from public.profiles where id = v_uid;
  select * into v_usage from public.tutor_usage where user_id = v_uid and day = v_today;
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
    'premium_until',  public.premium_until_of(v_uid),
    'subscribed',     coalesce(v_prof.subscription_until > now(), false),
    'daily_goal',     public.cfg_int('daily_goal'),
    'today_answered', coalesce((select answered from public.daily_activity where user_id = v_uid and day = v_today), 0),
    'tutor_used_today', coalesce(v_usage.count, 0),
    'tutor_limit_today', case when public.is_premium(v_uid) then public.cfg_int('premium_daily_tutor')
                              else public.cfg_int('free_daily_tutor') + coalesce(v_usage.bonus, 0) end,
    'due_reviews',    (select count(*) from public.mistakes where user_id = v_uid and status not in ('graduated', 'pending') and next_review <= v_today),
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

-- 看完獎勵式廣告：多 1 次小老師（每天上限、兩次間隔至少 20 秒）
create or replace function public.grant_ad_bonus()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid   uuid := auth.uid();
  v_today date := public.app_today();
  v_row   public.tutor_usage;
  v_max   int := public.cfg_int('ad_bonus_daily_max');
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  if (select value #>> '{}' from public.app_config where key = 'ads_enabled') <> 'true' then
    raise exception 'ads_disabled';
  end if;
  if public.is_premium(v_uid) then raise exception 'already_premium'; end if;

  insert into public.tutor_usage (user_id, day) values (v_uid, v_today)
  on conflict (user_id, day) do nothing;
  select * into v_row from public.tutor_usage where user_id = v_uid and day = v_today for update;

  if v_row.bonus >= v_max then raise exception 'ad_bonus_limit'; end if;
  if v_row.last_bonus_at is not null and v_row.last_bonus_at > now() - interval '20 seconds' then
    raise exception 'ad_bonus_too_fast';
  end if;

  update public.tutor_usage set bonus = bonus + 1, last_bonus_at = now()
  where user_id = v_uid and day = v_today;

  return jsonb_build_object('bonus', v_row.bonus + 1, 'bonus_left', v_max - v_row.bonus - 1);
end $$;

-- 伺服器（Edge Function）寫入訂閱到期日
create or replace function public.set_subscription(p_user uuid, p_until timestamptz)
returns void language sql security definer set search_path = public as $$
  update public.profiles set subscription_until = p_until where id = p_user
$$;

revoke execute on function public.set_subscription(uuid, timestamptz) from public, anon, authenticated;
revoke execute on function public.premium_until_of(uuid) from public, anon;
revoke execute on function public.grant_ad_bonus() from public, anon;
grant execute on function public.grant_ad_bonus() to authenticated;
grant execute on function public.premium_until_of(uuid) to authenticated;
grant execute on function public.set_subscription(uuid, timestamptz) to service_role;
grant select on public.tutor_usage to authenticated;

drop policy if exists tutor_usage_own on public.tutor_usage;
create policy tutor_usage_own on public.tutor_usage for select to authenticated using (user_id = auth.uid());
