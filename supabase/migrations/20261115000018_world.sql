-- 遊戲化第三批：金幣、世界地圖（領地）、魔物夥伴、勇者大廳商店
-- 原則：金幣只能靠作答取得（沒有任何用真錢買金幣的途徑），所有獎勵由伺服器依作答紀錄計算。

-- 1. 設定值（都可以在 app_config 調整）
insert into public.app_config (key, value) values
  ('gold_correct',     '5'),    -- 答對 1 題的金幣
  ('gold_conquer',     '30'),   -- 第一次佔領領地
  ('gold_reclaim',     '20'),   -- 已佔領的領地再打贏一次（每塊領地每天一次）
  ('gold_daily_max',   '300'),  -- 每天最多賺到的金幣（避免為了金幣一直刷）
  ('conquer_need',     '3'),    -- 一場領地戰要答對幾題才算贏
  ('pal_evolve_2',     '3'),    -- 同一種夥伴收服幾次進化成體
  ('pal_evolve_3',     '6'),    -- 收服幾次覺醒
  ('soup_questions',   '3'),    -- 一碗熱湯今天多練幾題
  ('soup_daily_max',   '2'),    -- 每天最多喝幾碗
  ('bed_questions',    '5')     -- 買了床，每天免費題數多幾題
on conflict (key) do nothing;

-- 2. 欄位
alter table public.profiles add column if not exists gold int not null default 0 check (gold >= 0);
alter table public.profiles add column if not exists team_pal text;
alter table public.daily_activity add column if not exists gold int not null default 0;
alter table public.daily_activity add column if not exists soups smallint not null default 0;
-- gold、team_pal 不開放 App 直接改（profiles 只開放指定欄位的 update），只能透過下面的函式

-- 3. 領地：每個單元一塊，打贏一場領地戰就佔領
create table if not exists public.territories (
  user_id     uuid not null references auth.users (id) on delete cascade,
  unit_id     text not null references public.units (id) on delete cascade,
  wins        int  not null default 1,
  won_at      timestamptz not null default now(),
  reward_day  date not null,
  primary key (user_id, unit_id)
);
alter table public.territories enable row level security;

-- 4. 魔物夥伴：五科各 4 種，共 20 種；species 例如 math-1
create table if not exists public.companions (
  user_id   uuid not null references auth.users (id) on delete cascade,
  species   text not null check (species ~ '^(math|chinese|english|science|social)-[1-4]$'),
  caught    int  not null default 1,
  first_at  timestamptz not null default now(),
  primary key (user_id, species)
);
alter table public.companions enable row level security;

-- 5. 商店商品與已買的東西
create table if not exists public.shop_items (
  id           text primary key,
  kind         text not null check (kind in ('furniture', 'consumable')),
  price        int  not null check (price > 0),
  need_correct int  not null default 0,   -- 累積答對幾題才能買
  need_pals    int  not null default 0,   -- 收服幾種夥伴才能買
  sort         smallint not null default 0,
  active       boolean not null default true
);
alter table public.shop_items enable row level security;

insert into public.shop_items (id, kind, price, need_correct, need_pals, sort) values
  ('soup',    'consumable',  20,   0, 0,  0),
  ('plant',   'furniture',  120,   0, 0,  1),
  ('rug',     'furniture',  150,   0, 0,  2),
  ('desk',    'furniture',  200,   0, 0,  3),
  ('window',  'furniture',  250,   0, 0,  4),
  ('bed',     'furniture',  300,   0, 0,  5),
  ('chest',   'furniture',  350,  50, 0,  6),
  ('picture', 'furniture',  400, 100, 0,  7),
  ('mirror',  'furniture',  450, 150, 0,  8),
  ('lamp',    'furniture',  500,   0, 3,  9),
  ('shelf',   'furniture',  600, 300, 0, 10),
  ('nest',    'furniture',  700,   0, 5, 11),
  ('weapon',  'furniture',  800,   0, 8, 12)
on conflict (id) do nothing;

create table if not exists public.hall_items (
  user_id   uuid not null references auth.users (id) on delete cascade,
  item_id   text not null references public.shop_items (id),
  bought_at timestamptz not null default now(),
  primary key (user_id, item_id)
);
alter table public.hall_items enable row level security;

-- 6. 加金幣（受每日上限限制），回傳實際加了多少
create or replace function public.add_gold(p_uid uuid, p_amount int)
returns int language plpgsql security definer set search_path = public as $$
declare
  v_today date := public.app_today();
  v_have  int;
  v_add   int;
begin
  if p_amount <= 0 then return 0; end if;
  select coalesce((select gold from public.daily_activity where user_id = p_uid and day = v_today), 0) into v_have;
  v_add := least(p_amount, greatest(public.cfg_int('gold_daily_max') - v_have, 0));
  if v_add <= 0 then return 0; end if;
  insert into public.daily_activity as d (user_id, day, gold) values (p_uid, v_today, v_add)
  on conflict (user_id, day) do update set gold = d.gold + excluded.gold;
  update public.profiles set gold = gold + v_add where id = p_uid;
  return v_add;
end $$;

-- 答對就給金幣（小老師驗收題不給，避免同一題拿兩次）
create or replace function public.gold_on_attempt()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.correct and new.context <> 'tutor_check' then
    perform public.add_gold(new.user_id, public.cfg_int('gold_correct'));
  end if;
  return new;
end $$;
drop trigger if exists attempts_gold on public.attempts;
create trigger attempts_gold after insert on public.attempts
  for each row execute function public.gold_on_attempt();

-- 買了床：每天的紀錄建立時，免費題數自動多幾題
create or replace function public.bed_bonus_on_day()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.day = public.app_today()
     and exists (select 1 from public.hall_items where user_id = new.user_id and item_id = 'bed') then
    update public.daily_activity set bonus_questions = bonus_questions + public.cfg_int('bed_questions')
      where user_id = new.user_id and day = new.day;
  end if;
  return null;
end $$;
drop trigger if exists daily_activity_bed on public.daily_activity;
create trigger daily_activity_bed after insert on public.daily_activity
  for each row execute function public.bed_bonus_on_day();

-- 7. 單元對應的夥伴種類：同科目依單元順序輪流 1～4
create or replace function public.unit_species(p_unit public.units)
returns text language sql immutable as $$
  select p_unit.subject || '-' || (1 + ((p_unit.seq - 1) % 4))::text
$$;

create or replace function public.pal_stage(p_caught int)
returns int language sql stable as $$
  select case when p_caught >= public.cfg_int('pal_evolve_3') then 3
              when p_caught >= public.cfg_int('pal_evolve_2') then 2
              when p_caught >= 1 then 1 else 0 end
$$;

-- 8. 世界地圖：某個學期所有單元的領地狀態
--    due＝這個單元裡到期該複習、或還沒弄懂的錯題數；已佔領又有 due 就是「魔物入侵」
create or replace function public.world_map(p_semester text)
returns table (unit_id text, subject text, seq int, title text, species text, won boolean, wins int, due int, rewarded_today boolean)
language sql stable security definer set search_path = public as $$
  select u.id, u.subject, u.seq::int, u.title, public.unit_species(u),
    t.unit_id is not null, coalesce(t.wins, 0),
    (select count(*)::int from public.mistakes m join public.questions q on q.id = m.question_id
       where m.user_id = auth.uid() and q.unit_id = u.id and m.status <> 'graduated'
         and (m.status = 'pending' or m.next_review <= public.app_today())),
    coalesce(t.reward_day = public.app_today(), false)
  from public.units u
  left join public.territories t on t.unit_id = u.id and t.user_id = auth.uid()
  where u.semester = p_semester
    and exists (select 1 from public.questions q where q.unit_id = u.id and q.active)
  order by u.seq, u.subject
$$;

-- 每個學期佔領了幾塊（地圖選單用）
create or replace function public.world_progress()
returns table (semester text, total int, won int)
language sql stable security definer set search_path = public as $$
  select u.semester, count(*)::int, count(t.unit_id)::int
  from public.units u
  left join public.territories t on t.unit_id = u.id and t.user_id = auth.uid()
  where exists (select 1 from public.questions q where q.unit_id = u.id and q.active)
  group by u.semester order by u.semester
$$;

-- 9. 領地戰出題：先出這個單元該複習的錯題，再出沒做過的，最後才是做過的
create or replace function public.battle_questions(p_unit_id text, p_limit int default 5)
returns table (id text, unit_id text, concept text, stem text, options jsonb, difficulty smallint, source text,
               subject text, semester text, unit_title text, listen_script text, seen boolean)
language sql volatile security definer set search_path = public as $$
  select qp.id, qp.unit_id, qp.concept, qp.stem, qp.options, qp.difficulty, qp.source, qp.subject, qp.semester, qp.unit_title,
    qp.listen_script,
    exists (select 1 from public.attempts a where a.user_id = auth.uid() and a.question_id = qp.id)
  from public.questions_public qp
  where qp.unit_id = p_unit_id
  order by
    (not exists (select 1 from public.mistakes m where m.user_id = auth.uid() and m.question_id = qp.id
                   and m.status <> 'graduated' and (m.status = 'pending' or m.next_review <= public.app_today()))),
    (exists (select 1 from public.attempts a where a.user_id = auth.uid() and a.question_id = qp.id)),
    random()
  limit least(greatest(p_limit, 3), 5)
$$;

-- 10. 領地戰結算：依「這些題目最近 1 小時內的作答」判定，不相信 App 傳來的結果
--     贏了就佔領；第一次佔領、或已佔領的領地每天第一次再打贏，會收服一隻夥伴並拿金幣
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
  select caught into v_before from public.companions where user_id = v_uid and species = v_species;
  v_before := coalesce(v_before, 0);
  v_caught := v_before;

  if v_correct >= v_need then
    select * into v_t from public.territories where user_id = v_uid and unit_id = p_unit_id for update;
    if not found then
      v_first := true; v_reward := true;
      insert into public.territories (user_id, unit_id, reward_day) values (v_uid, p_unit_id, v_today);
    else
      v_reward := v_t.reward_day < v_today;
      update public.territories set wins = wins + 1, reward_day = greatest(reward_day, v_today)
        where user_id = v_uid and unit_id = p_unit_id;
    end if;
    if v_reward then
      insert into public.companions as c (user_id, species) values (v_uid, v_species)
      on conflict (user_id, species) do update set caught = c.caught + 1
      returning caught into v_caught;
      v_gold := public.add_gold(v_uid, public.cfg_int(case when v_first then 'gold_conquer' else 'gold_reclaim' end));
      -- 第一隻夥伴自動成為出戰夥伴
      update public.profiles set team_pal = v_species where id = v_uid and team_pal is null;
    end if;
  end if;

  return jsonb_build_object(
    'won', v_correct >= v_need, 'correct', v_correct, 'total', v_n, 'need', v_need,
    'first', v_first, 'rewarded', v_reward, 'gold_gained', v_gold,
    'gold', (select gold from public.profiles where id = v_uid),
    'species', v_species, 'caught', v_caught,
    'new_pal', v_reward and v_before = 0,
    'stage_before', public.pal_stage(v_before), 'stage', public.pal_stage(v_caught));
end $$;

-- 11. 大廳狀態：金幣、夥伴、家具、商店、今天的體力
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
    'team_pal', v_prof.team_pal,
    'total_correct', v_correct,
    'territories', (select count(*)::int from public.territories where user_id = v_uid),
    'invaded', (select count(*)::int from public.territories t where t.user_id = v_uid and exists (
                  select 1 from public.mistakes m join public.questions q on q.id = m.question_id
                  where m.user_id = v_uid and q.unit_id = t.unit_id and m.status <> 'graduated'
                    and (m.status = 'pending' or m.next_review <= v_today))),
    'pals', coalesce((select jsonb_agg(jsonb_build_object('species', c.species, 'caught', c.caught,
                        'stage', public.pal_stage(c.caught)) order by c.first_at)
                      from public.companions c where c.user_id = v_uid), '[]'::jsonb),
    'evolve', jsonb_build_array(public.cfg_int('pal_evolve_2'), public.cfg_int('pal_evolve_3')),
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

-- 12. 買東西：家具只能買一次；熱湯每天有上限，喝了今天多練幾題
create or replace function public.buy_item(p_item text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid   uuid := auth.uid();
  v_today date := public.app_today();
  v_item  public.shop_items;
  v_prof  public.profiles;
  v_soups int;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  select * into v_item from public.shop_items where id = p_item and active;
  if not found then raise exception 'item_not_found'; end if;
  select * into v_prof from public.profiles where id = v_uid for update;

  if v_item.kind = 'furniture' and exists (select 1 from public.hall_items where user_id = v_uid and item_id = p_item) then
    raise exception 'item_owned';
  end if;
  if v_item.need_correct > 0
     and (select coalesce(sum(correct), 0) from public.daily_activity where user_id = v_uid) < v_item.need_correct then
    raise exception 'item_locked';
  end if;
  if v_item.need_pals > 0 and (select count(*) from public.companions where user_id = v_uid) < v_item.need_pals then
    raise exception 'item_locked';
  end if;
  if p_item = 'soup' then
    if public.is_premium(v_uid) then raise exception 'soup_not_needed'; end if;
    select coalesce((select soups from public.daily_activity where user_id = v_uid and day = v_today), 0) into v_soups;
    if v_soups >= public.cfg_int('soup_daily_max') then raise exception 'soup_limit'; end if;
  end if;
  if v_prof.gold < v_item.price then raise exception 'not_enough_gold'; end if;

  update public.profiles set gold = gold - v_item.price where id = v_uid;
  if p_item = 'soup' then
    insert into public.daily_activity as d (user_id, day, soups, bonus_questions)
    values (v_uid, v_today, 1, public.cfg_int('soup_questions'))
    on conflict (user_id, day) do update
      set soups = d.soups + 1, bonus_questions = d.bonus_questions + excluded.bonus_questions;
  else
    insert into public.hall_items (user_id, item_id) values (v_uid, p_item);
    -- 床：今天就生效（今天的紀錄已經存在時，建立紀錄的觸發器不會再跑）
    if p_item = 'bed' then
      insert into public.daily_activity (user_id, day) values (v_uid, v_today) on conflict (user_id, day) do nothing;
      if not found then
        update public.daily_activity set bonus_questions = bonus_questions + public.cfg_int('bed_questions')
          where user_id = v_uid and day = v_today;
      end if;
    end if;
  end if;
  return public.world_state();
end $$;

-- 13. 選出戰夥伴（顯示在大廳，跟在勇者旁邊）
create or replace function public.set_team_pal(p_species text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if not exists (select 1 from public.companions where user_id = auth.uid() and species = p_species) then
    raise exception 'pal_not_owned';
  end if;
  update public.profiles set team_pal = p_species where id = auth.uid();
end $$;

-- 14. 權限：只開放 App 需要的函式
revoke execute on function public.add_gold(uuid, int), public.gold_on_attempt(), public.bed_bonus_on_day(),
  public.unit_species(public.units), public.pal_stage(int), public.world_map(text), public.world_progress(),
  public.battle_questions(text, int), public.conquer(text, text[]), public.world_state(), public.buy_item(text),
  public.set_team_pal(text) from public, anon;
grant execute on function public.world_map(text), public.world_progress(), public.battle_questions(text, int),
  public.conquer(text, text[]), public.world_state(), public.buy_item(text), public.set_team_pal(text) to authenticated;
