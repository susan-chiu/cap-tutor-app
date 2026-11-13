-- 獎勵式廣告：統一的廣告獎勵入口（體力、XP 加倍、小老師），每天總次數與各位置次數都有上限
-- 設計：獎勵一律由伺服器發放；App 只在廣告「看完」後呼叫 grant_ad_reward。
insert into public.app_config (key, value) values
  ('ad_daily_max',        '5'),   -- 免費版每天最多看幾次廣告（所有位置加總）
  ('ad_energy_daily_max', '2'),   -- 「體力」位置：每天幾次
  ('ad_energy_questions', '10'),  -- 每次多幾題
  ('ad_xp2x_daily_max',   '2'),   -- 「XP 加倍」位置：每天幾次
  ('ad_xp2x_cap',         '60')   -- 每次最多補多少 XP
on conflict (key) do nothing;

alter table public.daily_activity add column if not exists bonus_questions int not null default 0;

create table if not exists public.ad_rewards (
  id         bigserial primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  day        date not null,
  placement  text not null check (placement in ('energy', 'xp2x', 'tutor')),
  amount     int  not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists ad_rewards_user_day_idx on public.ad_rewards (user_id, day);
alter table public.ad_rewards enable row level security;

-- 今天各位置看了幾次（給 App 顯示「還能看幾次」）
create or replace function public.ad_status()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_today date := public.app_today();
  v_total int; v_energy int; v_xp int; v_tutor int;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  select count(*), count(*) filter (where placement = 'energy'), count(*) filter (where placement = 'xp2x'),
         count(*) filter (where placement = 'tutor')
    into v_total, v_energy, v_xp, v_tutor
  from public.ad_rewards where user_id = v_uid and day = v_today;
  return jsonb_build_object(
    'enabled', (select value #>> '{}' from public.app_config where key = 'ads_enabled') = 'true' and not public.is_premium(v_uid),
    'total_left', greatest(public.cfg_int('ad_daily_max') - v_total, 0),
    'energy_left', least(greatest(public.cfg_int('ad_energy_daily_max') - v_energy, 0), greatest(public.cfg_int('ad_daily_max') - v_total, 0)),
    'xp2x_left',   least(greatest(public.cfg_int('ad_xp2x_daily_max') - v_xp, 0),   greatest(public.cfg_int('ad_daily_max') - v_total, 0)),
    'tutor_left',  least(greatest(public.cfg_int('ad_bonus_daily_max') - v_tutor, 0), greatest(public.cfg_int('ad_daily_max') - v_total, 0)),
    'energy_questions', public.cfg_int('ad_energy_questions')
  );
end $$;

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

-- 舊的小老師入口改走新函式（App 舊版本仍可用）
create or replace function public.grant_ad_bonus()
returns jsonb language sql security definer set search_path = public as $$
  select public.grant_ad_reward('tutor')
$$;

revoke execute on function public.ad_status(), public.grant_ad_reward(text) from public, anon;
grant execute on function public.ad_status(), public.grant_ad_reward(text) to authenticated;

-- 作答的每日上限改為「免費題數 + 看廣告加的題數」（其餘與原本相同）
create or replace function public.submit_answer(
  p_question_id text,
  p_choice      text,
  p_context     text default 'practice',
  p_for_mistake text default null
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid       uuid := auth.uid();
  v_today     date := public.app_today();
  v_q         public.questions;
  v_correct   boolean;
  v_prof      public.profiles;
  v_day       public.daily_activity;
  v_goal      int  := public.cfg_int('daily_goal');
  v_xp        int  := 0;
  v_gap       int;
  v_streak_up boolean := false;
  v_target    text;
  v_m         public.mistakes;
  v_next      record;
  v_mstatus   text;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  if p_context not in ('practice', 'review', 'exam', 'tutor_check') then raise exception 'bad_context'; end if;

  select * into v_q from public.questions where id = p_question_id and active;
  if not found then raise exception 'question_not_found'; end if;
  if not exists (select 1 from jsonb_array_elements(v_q.options) o where o ->> 'key' = p_choice) then
    raise exception 'bad_choice';
  end if;

  select * into v_prof from public.profiles where id = v_uid for update;
  if not found then raise exception 'profile_missing'; end if;

  -- 免費版每日上限
  select * into v_day from public.daily_activity where user_id = v_uid and day = v_today;
  if not public.is_premium(v_uid)
     and coalesce(v_day.answered, 0) >= public.cfg_int('free_daily_questions') + coalesce(v_day.bonus_questions, 0) then
    raise exception 'daily_limit_reached';
  end if;

  v_correct := (p_choice = v_q.answer);

  insert into public.attempts (user_id, question_id, choice, correct, context, answered_day)
  values (v_uid, v_q.id, p_choice, v_correct, p_context, v_today);

  insert into public.daily_activity as d (user_id, day, answered, correct)
  values (v_uid, v_today, 1, case when v_correct then 1 else 0 end)
  on conflict (user_id, day) do update
    set answered = d.answered + 1, correct = d.correct + excluded.correct
  returning * into v_day;

  if v_correct then v_xp := v_xp + public.cfg_int('xp_correct'); end if;

  -- 連勝：當天第一次達到目標題數時計算
  if v_day.answered = v_goal and (v_prof.last_goal_date is distinct from v_today) then
    v_gap := case when v_prof.last_goal_date is null then null else v_today - v_prof.last_goal_date end;
    if v_gap = 1 then
      v_prof.current_streak := v_prof.current_streak + 1;
    elsif v_gap is not null and v_gap - 1 <= v_prof.freeze_cards and v_prof.current_streak > 0 then
      -- 中間漏掉的天數用保護卡補上
      insert into public.daily_activity (user_id, day, froze)
        select v_uid, g::date, true
        from generate_series(v_prof.last_goal_date + 1, v_today - 1, interval '1 day') g
      on conflict (user_id, day) do update set froze = true;
      v_prof.freeze_cards := v_prof.freeze_cards - (v_gap - 1);
      v_prof.current_streak := v_prof.current_streak + 1;
    else
      v_prof.current_streak := 1;
    end if;
    v_prof.last_goal_date := v_today;
    v_prof.longest_streak := greatest(v_prof.longest_streak, v_prof.current_streak);
    -- 每連勝 7 天送 1 張保護卡（最多 5 張）
    if v_prof.current_streak % 7 = 0 then
      v_prof.freeze_cards := least(v_prof.freeze_cards + 1, 5);
    end if;
    v_streak_up := true;
  end if;

  -- 錯題本
  v_target := coalesce(p_for_mistake, v_q.id);
  select * into v_m from public.mistakes where user_id = v_uid and question_id = v_target for update;

  if not v_correct and p_for_mistake is null then
    insert into public.mistakes as m (user_id, question_id, next_review)
    values (v_uid, v_q.id, v_today)
    on conflict (user_id, question_id) do update
      set status = 'pending', wrong_count = m.wrong_count + 1,
          next_review = v_today, graduated_at = null;
    v_mstatus := 'pending';
  elsif not v_correct and v_m.question_id is not null then
    -- 驗收題答錯：原錯題退回待講解
    update public.mistakes set status = 'pending', next_review = v_today, graduated_at = null
      where user_id = v_uid and question_id = v_target;
    v_mstatus := 'pending';
  elsif v_correct and v_m.question_id is not null and v_m.status <> 'graduated'
        and (v_m.next_review <= v_today or v_m.status = 'pending') then
    select * into v_next from public.next_mistake_state(v_m.status);
    update public.mistakes
      set status = v_next.new_status,
          next_review = v_today + v_next.wait_days,
          graduated_at = case when v_next.new_status = 'graduated' then now() end
      where user_id = v_uid and question_id = v_target;
    v_mstatus := v_next.new_status;
    if v_next.new_status = 'graduated' then
      v_xp := v_xp + public.cfg_int('xp_mistake_graduated');
    end if;
  else
    v_mstatus := v_m.status;
  end if;

  update public.profiles
    set xp = v_prof.xp + v_xp,
        current_streak = v_prof.current_streak,
        longest_streak = v_prof.longest_streak,
        last_goal_date = v_prof.last_goal_date,
        freeze_cards = v_prof.freeze_cards
    where id = v_uid;

  return jsonb_build_object(
    'correct',        v_correct,
    'answer',         v_q.answer,
    'explanation',    v_q.explanation,
    'wrong_reason',   case when v_correct then null else v_q.wrong_reasons ->> p_choice end,
    'xp_gained',      v_xp,
    'xp_total',       v_prof.xp + v_xp,
    'today_answered', v_day.answered,
    'daily_goal',     v_goal,
    'streak',         v_prof.current_streak,
    'streak_up',      v_streak_up,
    'freeze_cards',   v_prof.freeze_cards,
    'mistake_status', v_mstatus
  );
end $$;
