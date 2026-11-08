-- 遊戲化第二批：魔王戰紀錄與獎勵、成就徽章、學習花園的金色稀有花
-- 1. 魔王戰紀錄：每個魔王（學期＋科目＋階段）記最好的星數
create table if not exists public.boss_results (
  user_id    uuid not null references auth.users (id) on delete cascade,
  boss_key   text not null check (length(boss_key) between 1 and 80),
  best_stars smallint not null check (best_stars between 0 and 3),
  clears     int not null default 1,
  rewarded_day date,
  updated_at timestamptz not null default now(),
  primary key (user_id, boss_key)
);
alter table public.boss_results enable row level security;
-- 只透過下面的函式讀寫

-- 結算魔王戰：星數由伺服器依「這些題目最近 3 小時內的作答紀錄」計算，不相信 App 傳來的分數
-- 第一次拿到三顆星送 1 張保護卡（上限 5 張；每天最多送 1 張）
create or replace function public.record_boss(p_boss_key text, p_question_ids text[])
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_total int := coalesce(array_length(p_question_ids, 1), 0);
  v_correct int;
  v_stars smallint;
  v_prev smallint;
  v_reward boolean := false;
  v_cards int;
  v_today date := public.app_today();
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  if v_total < 5 or v_total > 60 then raise exception 'bad_boss'; end if;

  -- 每題取最近 3 小時內最後一次作答
  select count(*) filter (where last_ok) into v_correct from (
    select distinct on (a.question_id) a.correct as last_ok
    from public.attempts a
    where a.user_id = auth.uid() and a.question_id = any (p_question_ids)
      and a.answered_at > now() - interval '3 hours'
    order by a.question_id, a.answered_at desc) t;

  v_stars := case when v_correct >= ceil(v_total * 0.9) then 3 when v_correct >= ceil(v_total * 0.7) then 2
                  when v_correct >= ceil(v_total * 0.5) then 1 else 0 end;

  select best_stars into v_prev from public.boss_results where user_id = auth.uid() and boss_key = p_boss_key;
  insert into public.boss_results (user_id, boss_key, best_stars) values (auth.uid(), p_boss_key, v_stars)
  on conflict (user_id, boss_key) do update
    set best_stars = greatest(public.boss_results.best_stars, excluded.best_stars),
        clears = public.boss_results.clears + 1, updated_at = now();

  if v_stars = 3 and coalesce(v_prev, 0) < 3 and not exists (
       select 1 from public.boss_results where user_id = auth.uid() and rewarded_day = v_today) then
    update public.profiles set freeze_cards = least(freeze_cards + 1, 5) where id = auth.uid()
      and freeze_cards < 5 returning freeze_cards into v_cards;
    v_reward := v_cards is not null;
    if v_reward then
      update public.boss_results set rewarded_day = v_today where user_id = auth.uid() and boss_key = p_boss_key;
    end if;
  end if;
  select freeze_cards into v_cards from public.profiles where id = auth.uid();

  return jsonb_build_object('stars', v_stars, 'correct', v_correct, 'total', v_total,
    'best', greatest(coalesce(v_prev, 0), v_stars), 'first_three', v_stars = 3 and coalesce(v_prev, 0) < 3,
    'freeze_reward', v_reward, 'freeze_cards', v_cards);
end $$;

create or replace function public.boss_bests()
returns table (boss_key text, best_stars smallint, clears int)
language sql stable security definer set search_path = public as $$
  select boss_key, best_stars, clears from public.boss_results where user_id = auth.uid()
$$;

-- 2. 學習花園加上「困難題」的熟練數（困難題全部熟練＋開花＝金色稀有花）
drop function if exists public.garden();
create or replace function public.garden()
returns table (unit_id text, subject text, semester text, seq int, title text, total int, mastered int, attempted int,
               hard_total int, hard_mastered int)
language sql stable security definer set search_path = public as $$
  with me as (select coalesce(grade, 7) <= 6 as elem from public.profiles where id = auth.uid()),
  qs as (select q.id, q.unit_id, q.difficulty from public.questions q where q.active),
  mine as (
    select a.question_id, bool_or(a.correct) as ok from public.attempts a
    where a.user_id = auth.uid() group by a.question_id),
  open_m as (select question_id from public.mistakes where user_id = auth.uid() and status <> 'graduated'),
  st as (
    select qs.id, qs.unit_id, qs.difficulty, mine.question_id is not null as tried,
      coalesce(mine.ok, false) and not exists (select 1 from open_m o where o.question_id = qs.id) as ok
    from qs left join mine on mine.question_id = qs.id)
  select u.id, u.subject, u.semester, u.seq, u.title,
    count(st.id)::int,
    count(st.id) filter (where st.ok)::int,
    count(st.id) filter (where st.tried)::int,
    count(st.id) filter (where st.difficulty = 3)::int,
    count(st.id) filter (where st.difficulty = 3 and st.ok)::int
  from public.units u
  cross join me
  left join st on st.unit_id = u.id
  where (u.semester in ('5A', '5B', '6A', '6B')) = me.elem
  group by u.id, u.subject, u.semester, u.seq, u.title
  order by u.semester, u.subject, u.seq
$$;

-- 3. 成就徽章：全部由現有紀錄算出來（不用另外存）
create or replace function public.achievements()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  p public.profiles;
  v_correct int; v_grad int; v_bloom int; v_gold int; v_boss3 int; v_full_subject int; v_level int;
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
      (7,  'grad-1',     '錯題', '知錯能改',   '第一題錯題畢業',               v_grad, 1),
      (8,  'grad-20',    '錯題', '錯題剋星',   '20 題錯題畢業',                v_grad, 20),
      (9,  'grad-100',   '錯題', '錯題終結者', '100 題錯題畢業',               v_grad, 100),
      (10, 'bloom-1',    '花園', '第一朵花',   '花園開出第一朵花（單元熟練 85%）', v_bloom, 1),
      (11, 'bloom-10',   '花園', '小花圃',     '花園開出 10 朵花',             v_bloom, 10),
      (12, 'gold-1',     '花園', '金色奇蹟',   '種出第一朵金色稀有花（開花＋困難題全部熟練）', v_gold, 1),
      (13, 'subject-full','花園','一科滿開',   '某一科所有單元都開花',          v_full_subject, 1),
      (14, 'boss-1',     '魔王', '初次討伐',   '第一次用三顆星打敗魔王',       v_boss3, 1),
      (15, 'boss-5',     '魔王', '魔王剋星',   '5 個魔王拿到三顆星',           v_boss3, 5),
      (16, 'level-5',    '等級', '小樹苗',     '升到 Lv 5',                    v_level, 5),
      (17, 'level-10',   '等級', '勤學綠葉',   '升到 Lv 10',                   v_level, 10),
      (18, 'level-20',   '等級', '學習大樹',   '升到 Lv 20',                   v_level, 20)
    ) as a(ord, id, grp, title, descr, prog, goal));
end $$;

revoke execute on function public.record_boss(text, text[]), public.boss_bests(), public.garden(), public.achievements() from public, anon;
grant execute on function public.record_boss(text, text[]), public.boss_bests(), public.garden(), public.achievements() to authenticated;
