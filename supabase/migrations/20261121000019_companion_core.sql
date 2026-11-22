-- 魔物夥伴主線（2026-11-21）
-- 把錯題魔物和魔物夥伴合成同一種魔物：
--   ・每道錯題都是那個單元的夥伴的「野生版」，錯題畢業＝淨化，淨化會收服或餵養那隻夥伴
--   ・夥伴有自己的經驗值，答對同科題、淨化、佔領領地、星晶都會加經驗，經驗夠了就進化
--   ・最多 3 隻夥伴一起出戰（profiles.team），題目和夥伴同科時夥伴助攻
-- 所有經驗值都由伺服器依作答紀錄計算。

-- 1. 設定值
insert into public.app_config (key, value) values
  ('pal_xp_correct', '5'),    -- 隊伍中同科夥伴：答對 1 題
  ('pal_xp_purify',  '30'),   -- 淨化 1 隻野生魔物（錯題畢業）
  ('pal_xp_conquer', '20'),   -- 佔領／每天第一次收回領地
  ('pal_xp_feed',    '20'),   -- 用星晶培養 1 次
  ('pal_xp_2',       '60'),   -- 經驗值多少進化成體
  ('pal_xp_3',       '200'),  -- 經驗值多少覺醒
  ('team_max',       '3')     -- 隊伍最多幾隻夥伴
on conflict (key) do nothing;

-- 2. 欄位：夥伴經驗值、出戰隊伍
alter table public.companions add column if not exists xp int not null default 0 check (xp >= 0);
-- 舊資料：照原本的收服次數換成同樣的階段（3 次成體、6 次覺醒）
update public.companions set xp = case when caught >= 6 then 200 when caught >= 3 then 60 else (caught - 1) * 20 end where xp = 0;
alter table public.profiles add column if not exists team text[] not null default '{}';
update public.profiles set team = array[team_pal] where team_pal is not null and cardinality(team) = 0;
-- team 不開放 App 直接改，只能透過 set_team

create or replace function public.pal_stage_xp(p_xp int)
returns int language sql stable as $$
  select case when p_xp >= public.cfg_int('pal_xp_3') then 3 when p_xp >= public.cfg_int('pal_xp_2') then 2 else 1 end
$$;

-- 3. 給夥伴經驗值。p_capture＝這次算收服（沒有這隻就收服牠、收服次數 +1）；不是收服又還沒有這隻就什麼都不做
--    新收服的夥伴，隊伍沒滿就自動加入隊伍
create or replace function public.grant_pal_xp(p_uid uuid, p_species text, p_amount int, p_capture boolean)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_before int;
  v_after  int;
  v_new    boolean;
begin
  if p_species is null then return null; end if;
  select xp into v_before from public.companions where user_id = p_uid and species = p_species for update;
  v_new := not found;
  if v_new and not p_capture then return null; end if;
  if v_new then
    insert into public.companions (user_id, species, caught, xp) values (p_uid, p_species, 1, greatest(p_amount, 0));
    v_before := 0; v_after := greatest(p_amount, 0);
    update public.profiles set team = team || p_species where id = p_uid and cardinality(team) < public.cfg_int('team_max');
    update public.profiles set team_pal = team[1] where id = p_uid;
  else
    update public.companions set xp = xp + greatest(p_amount, 0), caught = caught + case when p_capture then 1 else 0 end
      where user_id = p_uid and species = p_species returning xp into v_after;
  end if;
  return jsonb_build_object('species', p_species, 'xp_gained', v_after - v_before, 'xp', v_after, 'new_pal', v_new,
    'stage_before', case when v_new then 0 else public.pal_stage_xp(v_before) end, 'stage', public.pal_stage_xp(v_after));
end $$;

-- 4. 作答：答對時隊伍裡的同科夥伴助攻並拿經驗；錯題畢業＝淨化野生魔物（其餘規則與 20261113000016 相同）
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
  v_unit      public.units;
  v_assist    text;
  v_teamxp    jsonb;
  v_purified  jsonb;
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

  -- 夥伴助攻：隊伍裡和這題同科的夥伴（第一隻）一起作戰，拿夥伴經驗值
  select * into v_unit from public.units where id = v_q.unit_id;
  select s into v_assist from unnest(v_prof.team) with ordinality t(s, o)
    where split_part(s, '-', 1) = v_unit.subject order by o limit 1;
  if v_correct and v_assist is not null and p_context <> 'tutor_check' then
    v_teamxp := public.grant_pal_xp(v_uid, v_assist, public.cfg_int('pal_xp_correct'), false);
  end if;

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
      -- 淨化：錯題畢業＝野生魔物被淨化，變成（或餵養）這個單元的夥伴
      v_purified := public.grant_pal_xp(v_uid,
        (select public.unit_species(u) from public.questions q join public.units u on u.id = q.unit_id where q.id = v_target),
        public.cfg_int('pal_xp_purify'), true);
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
    'mistake_status', v_mstatus,
    'assist_pal',     v_assist,
    'pal_xp',         v_teamxp,
    'purified',       v_purified
  );
end $$;

-- 5. 領地戰結算：收服改成給夥伴經驗值（其餘規則與 20261115000018 相同）
create or replace function public.conquer(p_unit_id text, p_question_ids text[])
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid     uuid := auth.uid();
  v_today   date := public.app_today();
  v_unit    public.units;
  v_n       int := coalesce(array_length(p_question_ids, 1), 0);
  v_correct int;
  v_need    int := public.cfg_int('conquer_need');
  v_t       public.territories;
  v_first   boolean := false;
  v_reward  boolean := false;
  v_species text;
  v_before  int := 0;
  v_caught  int := 0;
  v_gold    int := 0;
  v_days    int := 0;
  v_master  boolean := false;
  v_guard   int := 0;
  v_pal     jsonb;
  v_xp_before int := 0;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  select * into v_unit from public.units where id = p_unit_id;
  if not found then raise exception 'unit_not_found'; end if;
  if v_n < v_need or v_n > 5 then raise exception 'bad_battle'; end if;
  if exists (select 1 from unnest(p_question_ids) x
             where not exists (select 1 from public.questions q where q.id = x and q.unit_id = p_unit_id)) then
    raise exception 'bad_battle';
  end if;

  select count(*) filter (where last_ok) into v_correct from (
    select distinct on (a.question_id) a.correct as last_ok
    from public.attempts a
    where a.user_id = v_uid and a.question_id = any (p_question_ids)
      and a.answered_at > now() - interval '1 hour'
    order by a.question_id, a.answered_at desc) x;

  v_species := public.unit_species(v_unit);
  select caught, xp into v_before, v_xp_before from public.companions where user_id = v_uid and species = v_species;
  v_before := coalesce(v_before, 0);
  v_xp_before := coalesce(v_xp_before, 0);
  v_caught := v_before;

  if v_correct >= v_need then
    select * into v_t from public.territories where user_id = v_uid and unit_id = p_unit_id for update;
    if not found then
      v_first := true; v_reward := true; v_days := 1;
      insert into public.territories (user_id, unit_id, reward_day) values (v_uid, p_unit_id, v_today);
    else
      v_reward := v_t.reward_day < v_today;
      v_days := v_t.days + case when v_reward then 1 else 0 end;
      update public.territories set wins = wins + 1, days = v_days, reward_day = greatest(reward_day, v_today)
        where user_id = v_uid and unit_id = p_unit_id;
      -- 第 N 個不同的日子打贏：領地熟練（金旗），只給一次
      v_master := v_reward and v_days = public.cfg_int('master_days');
    end if;
    if v_reward then
      v_pal := public.grant_pal_xp(v_uid, v_species, public.cfg_int('pal_xp_conquer'), true);
      v_caught := v_before + 1;
      v_gold := public.add_gold(v_uid, public.cfg_int(case when v_first then 'gold_conquer' else 'gold_reclaim' end));
      if v_master then v_gold := v_gold + public.add_gold(v_uid, public.cfg_int('gold_master')); end if;
      -- 有守護者駐守的領地，收回時多一點金幣
      if not v_first and v_t.guard is not null then
        v_guard := public.add_gold(v_uid, public.cfg_int('gold_guard')); v_gold := v_gold + v_guard;
      end if;
    end if;
  end if;

  return jsonb_build_object(
    'won', v_correct >= v_need, 'correct', v_correct, 'total', v_n, 'need', v_need,
    'first', v_first, 'rewarded', v_reward, 'gold_gained', v_gold,
    'days', v_days, 'master_days', public.cfg_int('master_days'), 'mastered', v_master, 'guard_bonus', v_guard,
    'gold', (select gold from public.profiles where id = v_uid),
    'species', v_species, 'caught', v_caught,
    'new_pal', v_reward and v_before = 0,
    'pal_xp', coalesce((v_pal ->> 'xp')::int, v_xp_before), 'pal_xp_gained', coalesce((v_pal ->> 'xp_gained')::int, 0),
    'stage_before', case when v_before = 0 then 0 else public.pal_stage_xp(v_xp_before) end,
    'stage', case when v_caught = 0 then 0 else public.pal_stage_xp(coalesce((v_pal ->> 'xp')::int, v_xp_before)) end);
end $$;

-- 6. 大廳狀態：加上隊伍、夥伴經驗值、野生魔物數
create or replace function public.world_state()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  v_uid   uuid := auth.uid();
  v_today date := public.app_today();
  v_prof  public.profiles;
  v_day   public.daily_activity;
  v_correct int;
  v_pals  int;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  select * into v_prof from public.profiles where id = v_uid;
  select * into v_day from public.daily_activity where user_id = v_uid and day = v_today;
  select coalesce(sum(correct), 0)::int into v_correct from public.daily_activity where user_id = v_uid;
  select count(*)::int into v_pals from public.companions where user_id = v_uid;
  return jsonb_build_object(
    'gold', v_prof.gold,
    'gold_today', coalesce(v_day.gold, 0),
    'gold_daily_max', public.cfg_int('gold_daily_max'),
    'gold_correct', public.cfg_int('gold_correct'),
    'gems', v_prof.gems, 'gems_today', coalesce(v_day.gems, 0), 'gem_daily_max', public.cfg_int('gem_daily_max'),
    'gem_feed_cost', public.cfg_int('gem_feed_cost'), 'master_days', public.cfg_int('master_days'),
    'mastered', (select count(*)::int from public.territories where user_id = v_uid and days >= public.cfg_int('master_days')),
    'team_pal', v_prof.team_pal,
    'team', to_jsonb(v_prof.team),
    'team_max', public.cfg_int('team_max'),
    'wild', (select count(*)::int from public.mistakes where user_id = v_uid and status <> 'graduated'),
    -- 今天可以複習（已經弄懂、到期）的野生魔物；還沒弄懂的（pending）要先找小老師
    'wild_due', (select count(*)::int from public.mistakes where user_id = v_uid
                   and status in ('learning', 'consolidating', 'almost') and next_review <= v_today),
    'purified', (select count(*)::int from public.mistakes where user_id = v_uid and status = 'graduated'),
    'total_correct', v_correct,
    'territories', (select count(*)::int from public.territories where user_id = v_uid),
    'invaded', (select count(*)::int from public.territories t where t.user_id = v_uid and exists (
                  select 1 from public.mistakes m join public.questions q on q.id = m.question_id
                  where m.user_id = v_uid and q.unit_id = t.unit_id and m.status <> 'graduated'
                    and (m.status = 'pending' or m.next_review <= v_today))),
    'pals', coalesce((select jsonb_agg(jsonb_build_object('species', c.species, 'caught', c.caught, 'xp', c.xp,
                        'stage', public.pal_stage_xp(c.xp)) order by c.first_at)
                      from public.companions c where c.user_id = v_uid), '[]'::jsonb),
    'evolve', jsonb_build_array(public.cfg_int('pal_xp_2'), public.cfg_int('pal_xp_3')),
    'pal_xp', jsonb_build_object('correct', public.cfg_int('pal_xp_correct'), 'purify', public.cfg_int('pal_xp_purify'),
                                 'conquer', public.cfg_int('pal_xp_conquer'), 'feed', public.cfg_int('pal_xp_feed')),
    'owned', coalesce((select jsonb_agg(h.item_id order by h.bought_at) from public.hall_items h where h.user_id = v_uid), '[]'::jsonb),
    'shop', (select jsonb_agg(jsonb_build_object('id', s.id, 'kind', s.kind, 'price', s.price,
                 'need_correct', s.need_correct, 'need_pals', s.need_pals) order by s.sort)
               from public.shop_items s where s.active),
    'premium', public.is_premium(v_uid),
    'energy_max', public.cfg_int('free_daily_questions') + coalesce(v_day.bonus_questions, 0)
       + case when v_day.user_id is null and exists (select 1 from public.hall_items where user_id = v_uid and item_id = 'bed')
              then public.cfg_int('bed_questions') else 0 end,
    'today_answered', coalesce(v_day.answered, 0),
    'soups_left', greatest(public.cfg_int('soup_daily_max') - coalesce(v_day.soups, 0), 0),
    'soup_questions', public.cfg_int('soup_questions'),
    'bed_questions', public.cfg_int('bed_questions'));
end $$;

-- 7. 星晶培養：改成加夥伴經驗值
create or replace function public.feed_pal(p_species text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid  uuid := auth.uid();
  v_cost int := public.cfg_int('gem_feed_cost');
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  if not exists (select 1 from public.companions where user_id = v_uid and species = p_species) then raise exception 'pal_not_owned'; end if;
  update public.profiles set gems = gems - v_cost where id = v_uid and gems >= v_cost;
  if not found then raise exception 'not_enough_gems'; end if;
  perform public.grant_pal_xp(v_uid, p_species, public.cfg_int('pal_xp_feed'), false);
  return public.world_state();
end $$;

-- 8. 每日任務：加上「削弱野生魔物」（今天複習答對幾題錯題），排在第一個
insert into public.app_config (key, value) values ('quest_review_goal', '2'), ('quest_review_gold', '30') on conflict (key) do nothing;
alter table public.quest_claims drop constraint if exists quest_claims_quest_check;
alter table public.quest_claims add constraint quest_claims_quest_check check (quest in ('answer', 'correct', 'conquer', 'review'));

create or replace function public.quest_progress(p_uid uuid, p_quest text)
returns int language sql stable security definer set search_path = public as $$
  select case p_quest
    when 'answer'  then coalesce((select answered from public.daily_activity where user_id = p_uid and day = public.app_today()), 0)
    when 'correct' then coalesce((select correct  from public.daily_activity where user_id = p_uid and day = public.app_today()), 0)
    when 'conquer' then (select count(*) from public.territories where user_id = p_uid and reward_day = public.app_today())
    when 'review'  then (select count(*) from public.attempts where user_id = p_uid and answered_day = public.app_today()
                           and context = 'review' and correct)
  end::int
$$;

create or replace function public.daily_quests()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_agg(jsonb_build_object(
    'id', q, 'goal', public.cfg_int('quest_' || q || '_goal'), 'gold', public.cfg_int('quest_' || q || '_gold'),
    'progress', least(public.quest_progress(auth.uid(), q), public.cfg_int('quest_' || q || '_goal')),
    'claimed', exists (select 1 from public.quest_claims c where c.user_id = auth.uid() and c.day = public.app_today() and c.quest = q))
    order by ord)
  from unnest(array['review', 'correct', 'conquer', 'answer']) with ordinality as t(q, ord)
$$;

create or replace function public.claim_quest(p_quest text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid  uuid := auth.uid();
  v_gold int;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  if p_quest not in ('answer', 'correct', 'conquer', 'review') then raise exception 'quest_not_found'; end if;
  if public.quest_progress(v_uid, p_quest) < public.cfg_int('quest_' || p_quest || '_goal') then raise exception 'quest_not_done'; end if;
  v_gold := public.cfg_int('quest_' || p_quest || '_gold');
  begin
    insert into public.quest_claims (user_id, day, quest, gold) values (v_uid, public.app_today(), p_quest, v_gold);
  exception when unique_violation then raise exception 'quest_claimed';
  end;
  update public.profiles set gold = gold + v_gold where id = v_uid;
  return jsonb_build_object('gold_gained', v_gold, 'gold', (select gold from public.profiles where id = v_uid), 'quests', public.daily_quests());
end $$;

-- 9. 家長戰報：加上野生魔物（還沒弄懂的錯題）與這週淨化數
create or replace function public.child_world(p_student uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not exists (select 1 from public.parent_links where parent_id = auth.uid() and student_id = p_student) then
    raise exception 'not_linked';
  end if;
  return jsonb_build_object(
    'territories', (select count(*)::int from public.territories where user_id = p_student),
    'mastered', (select count(*)::int from public.territories where user_id = p_student and days >= public.cfg_int('master_days')),
    'pals', (select count(*)::int from public.companions where user_id = p_student),
    'awakened', (select count(*)::int from public.companions where user_id = p_student and public.pal_stage_xp(xp) = 3),
    'wild', (select count(*)::int from public.mistakes where user_id = p_student and status <> 'graduated'),
    'purified_this_week', (select count(*)::int from public.mistakes where user_id = p_student and status = 'graduated'
                             and graduated_at > now() - interval '7 days'),
    'won_this_week', (select count(*)::int from public.territories where user_id = p_student and reward_day > public.app_today() - 7),
    'invaded', coalesce((select jsonb_agg(jsonb_build_object('title', x.title, 'subject', x.subject, 'due', x.due) order by x.due desc)
      from (select u.title, u.subject, count(*)::int as due
            from public.territories t
            join public.units u on u.id = t.unit_id
            join public.questions q on q.unit_id = u.id
            join public.mistakes m on m.question_id = q.id and m.user_id = p_student
            where t.user_id = p_student and m.status <> 'graduated' and (m.status = 'pending' or m.next_review <= public.app_today())
            group by u.id, u.title, u.subject order by count(*) desc limit 8) x), '[]'::jsonb));
end $$;

-- 10. 成就：錯題改叫淨化、花園改叫熟練，新增夥伴系列
create or replace function public.achievements()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  p public.profiles;
  v_correct int; v_grad int; v_bloom int; v_gold int; v_boss3 int; v_full_subject int; v_level int; v_pals int; v_awake int;
begin
  select * into p from public.profiles where id = auth.uid();
  if p.id is null then raise exception 'not_authenticated'; end if;
  select count(*) into v_correct from public.attempts where user_id = p.id and correct;
  select count(*) into v_grad from public.mistakes where user_id = p.id and status = 'graduated';
  select count(*) filter (where total > 0 and mastered >= ceil(total * 0.85)),
         count(*) filter (where total > 0 and mastered >= ceil(total * 0.85) and hard_mastered = hard_total and hard_total > 0)
    into v_bloom, v_gold from public.garden();
  select count(*) into v_full_subject from (
    select subject from public.garden() group by subject
    having bool_and(total > 0 and mastered >= ceil(total * 0.85))) t;
  select count(*) into v_boss3 from public.boss_results where user_id = p.id and best_stars = 3;
  v_level := public.xp_level(p.xp);
  select count(*), count(*) filter (where public.pal_stage_xp(xp) = 3) into v_pals, v_awake from public.companions where user_id = p.id;

  return (
    select jsonb_agg(jsonb_build_object('id', id, 'group', grp, 'title', title, 'desc', descr,
                                        'progress', least(prog, goal), 'goal', goal, 'done', prog >= goal) order by ord)
    from (values
      (1,  'streak-3',   '連勝', '起步三天',   '連續 3 天完成每日目標',        p.longest_streak, 3),
      (2,  'streak-7',   '連勝', '一週不間斷', '連續 7 天完成每日目標',        p.longest_streak, 7),
      (3,  'streak-30',  '連勝', '月月如一',   '連續 30 天完成每日目標',       p.longest_streak, 30),
      (4,  'correct-100','答題', '百題斬',     '累積答對 100 題',              v_correct, 100),
      (5,  'correct-500','答題', '五百勇士',   '累積答對 500 題',              v_correct, 500),
      (6,  'correct-2000','答題','題海霸主',   '累積答對 2000 題',             v_correct, 2000),
      (7,  'grad-1',     '淨化', '第一次淨化', '淨化第一隻野生魔物（錯題畢業）',               v_grad, 1),
      (8,  'grad-20',    '淨化', '淨化師',     '淨化 20 隻野生魔物',                v_grad, 20),
      (9,  'grad-100',   '淨化', '淨化大師',   '淨化 100 隻野生魔物',               v_grad, 100),
      (10, 'bloom-1',    '熟練', '第一個熟練單元', '一個單元熟練 85% 的題目', v_bloom, 1),
      (11, 'bloom-10',   '熟練', '十個熟練單元',   '10 個單元熟練 85% 的題目',             v_bloom, 10),
      (12, 'gold-1',     '熟練', '金色奇蹟',       '一個單元熟練，而且困難題全部答對', v_gold, 1),
      (13, 'subject-full','熟練','一科全通',       '某一科這個學制的所有單元都熟練',          v_full_subject, 1),
      (14, 'boss-1',     '魔王', '初次討伐',   '第一次用三顆星打敗魔王',       v_boss3, 1),
      (15, 'boss-5',     '魔王', '魔王剋星',   '5 個魔王拿到三顆星',           v_boss3, 5),
      (16, 'level-5',    '等級', '小樹苗',     '升到 Lv 5',                    v_level, 5),
      (17, 'level-10',   '等級', '勤學綠葉',   '升到 Lv 10',                   v_level, 10),
      (18, 'level-20',   '等級', '學習大樹',   '升到 Lv 20',                   v_level, 20),
      (19, 'pals-5',     '夥伴', '小隊成形',   '收服 5 種夥伴',                v_pals, 5),
      (20, 'pals-10',    '夥伴', '夥伴軍團',   '收服 10 種夥伴',               v_pals, 10),
      (21, 'pals-20',    '夥伴', '圖鑑全收集', '收服全部 20 種夥伴',           v_pals, 20),
      (22, 'awaken-1',   '夥伴', '第一次覺醒', '讓一隻夥伴覺醒',               v_awake, 1)
    ) as a(ord, id, grp, title, descr, prog, goal));
end $$;

-- 11. 出戰隊伍：最多 3 隻、不能重複、都要是已收服的；第一隻是隊長（大廳站在勇者旁邊）
create or replace function public.set_team(p_species text[])
returns void language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  if cardinality(p_species) > public.cfg_int('team_max') then raise exception 'team_too_big'; end if;
  if (select count(distinct s) from unnest(p_species) s) <> cardinality(p_species) then raise exception 'bad_team'; end if;
  if exists (select 1 from unnest(p_species) s
             where not exists (select 1 from public.companions c where c.user_id = v_uid and c.species = s)) then
    raise exception 'pal_not_owned';
  end if;
  update public.profiles set team = p_species, team_pal = p_species[1] where id = v_uid;
end $$;

-- 舊的「選出戰夥伴」改成：把這隻排到隊長（不在隊伍就換掉最後一隻）
create or replace function public.set_team_pal(p_species text)
returns void language plpgsql security definer set search_path = public as $$
declare v_team text[];
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if not exists (select 1 from public.companions where user_id = auth.uid() and species = p_species) then
    raise exception 'pal_not_owned';
  end if;
  select array_remove(team, p_species) into v_team from public.profiles where id = auth.uid();
  v_team := (array[p_species] || v_team)[1:public.cfg_int('team_max')];
  update public.profiles set team = v_team, team_pal = p_species where id = auth.uid();
end $$;

-- 12. 錯題清單：加上這道錯題是哪一種野生魔物
drop function if exists public.list_mistakes(text);
create or replace function public.list_mistakes(p_status text default null)
returns table (question jsonb, status text, error_type text, next_review date, wrong_count int, created_at timestamptz, species text)
language sql stable security definer set search_path = public as $$
  select to_jsonb(qp.*), m.status, m.error_type, m.next_review, m.wrong_count, m.created_at, public.unit_species(u)
  from public.mistakes m
  join public.questions_public qp on qp.id = m.question_id
  join public.units u on u.id = qp.unit_id
  where m.user_id = auth.uid() and (p_status is null or m.status = p_status)
  order by (m.status = 'graduated'), m.created_at desc
$$;

-- 13. 權限
revoke execute on function public.grant_pal_xp(uuid, text, int, boolean) from public, anon, authenticated;
revoke execute on function public.set_team(text[]), public.list_mistakes(text) from public, anon;
grant execute on function public.set_team(text[]), public.list_mistakes(text) to authenticated;
