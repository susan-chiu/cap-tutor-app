-- 遊戲化：每週經驗值、匿名週排行、學習花園
-- 1. 每天得到的經驗值（profiles.xp 增加時自動記一筆，週排行用）
create table if not exists public.xp_daily (
  user_id uuid not null references auth.users (id) on delete cascade,
  day     date not null,
  xp      int  not null default 0,
  primary key (user_id, day)
);
alter table public.xp_daily enable row level security;
-- 只能透過下面的函式讀取，不開放直接查表

create or replace function public.log_xp_daily()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.xp > old.xp then
    insert into public.xp_daily (user_id, day, xp) values (new.id, public.app_today(), new.xp - old.xp)
    on conflict (user_id, day) do update set xp = public.xp_daily.xp + excluded.xp;
  end if;
  return new;
end $$;
drop trigger if exists profiles_xp_daily on public.profiles;
create trigger profiles_xp_daily after update of xp on public.profiles
  for each row execute function public.log_xp_daily();

-- 2. 排行榜設定：可以選擇不出現在排行榜
alter table public.profiles add column if not exists leaderboard_hidden boolean not null default false;

-- 等級：第 L 級需要 50 × L × (L − 1) 經驗值（Lv2 100、Lv3 300、Lv5 1000、Lv10 4500）
create or replace function public.xp_level(p_xp int)
returns int language sql immutable as $$
  select greatest(1, floor((1 + sqrt(1 + 0.08 * greatest(p_xp, 0))) / 2)::int)
$$;

-- 匿名代號：植物名＋四位數字，由帳號 id 算出來，不會露出暱稱
create or replace function public.game_alias(p_id uuid)
returns text language sql immutable as $$
  select (array['向日葵','蒲公英','含羞草','鬱金香','薄荷','仙人掌','百合','櫻花','楓葉','綠竹','蘭花','茉莉',
                '桂花','牽牛花','薰衣草','銀杏'])[1 + (abs(hashtext(p_id::text)) % 16)]
         || lpad((abs(hashtext('n' || p_id::text)) % 10000)::text, 4, '0')
$$;

-- 本週一（台灣時間）
create or replace function public.game_week_start()
returns date language sql stable as $$
  select public.app_today() - (extract(isodow from public.app_today())::int - 1)
$$;

-- 3. 匿名週排行：國中、國小分開排；只列學生、不列隱藏的人；只回傳代號與等級
create or replace function public.weekly_leaderboard(p_limit int default 20)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  v_me public.profiles;
  v_week date := public.game_week_start();
  v_elem boolean;
  v_rows jsonb;
  v_my_xp int;
  v_my_rank int;
begin
  select * into v_me from public.profiles where id = auth.uid();
  if v_me.id is null then raise exception 'not_authenticated'; end if;
  v_elem := coalesce(v_me.grade, 7) <= 6;

  with weekly as (
    select p.id, p.xp as total_xp, coalesce(sum(d.xp), 0)::int as week_xp
    from public.profiles p
    left join public.xp_daily d on d.user_id = p.id and d.day >= v_week
    where p.role = 'student' and not p.leaderboard_hidden
      and (coalesce(p.grade, 7) <= 6) = v_elem
    group by p.id, p.xp
  ), ranked as (
    select *, rank() over (order by week_xp desc) as rnk from weekly where week_xp > 0
  )
  select coalesce(jsonb_agg(jsonb_build_object(
           'rank', rnk, 'alias', public.game_alias(id), 'level', public.xp_level(total_xp),
           'xp', week_xp, 'me', id = v_me.id) order by rnk, id), '[]'::jsonb)
    into v_rows
  from (select * from ranked order by rnk, id limit least(greatest(p_limit, 1), 50)) t;

  select coalesce(sum(xp), 0)::int into v_my_xp from public.xp_daily where user_id = v_me.id and day >= v_week;
  if not v_me.leaderboard_hidden and v_my_xp > 0 then
    select count(*) + 1 into v_my_rank from (
      select p.id, coalesce(sum(d.xp), 0) as wx from public.profiles p
      join public.xp_daily d on d.user_id = p.id and d.day >= v_week
      where p.role = 'student' and not p.leaderboard_hidden and (coalesce(p.grade, 7) <= 6) = v_elem
      group by p.id) t where t.wx > v_my_xp;
  end if;

  return jsonb_build_object(
    'week_start', v_week, 'school', case when v_elem then 'elementary' else 'junior' end,
    'top', v_rows,
    'me', jsonb_build_object('alias', public.game_alias(v_me.id), 'level', public.xp_level(v_me.xp),
                             'xp', v_my_xp, 'rank', v_my_rank, 'hidden', v_me.leaderboard_hidden));
end $$;

create or replace function public.set_leaderboard_hidden(p_hidden boolean)
returns void language sql security definer set search_path = public as $$
  update public.profiles set leaderboard_hidden = p_hidden where id = auth.uid()
$$;

-- 4. 學習花園：使用者這個學段（國中／國小）每個單元的熟練進度
create or replace function public.garden()
returns table (unit_id text, subject text, semester text, seq int, title text, total int, mastered int, attempted int)
language sql stable security definer set search_path = public as $$
  with me as (select coalesce(grade, 7) <= 6 as elem from public.profiles where id = auth.uid()),
  qs as (select q.id, q.unit_id from public.questions q where q.active),
  mine as (
    select a.question_id, bool_or(a.correct) as ok from public.attempts a
    where a.user_id = auth.uid() group by a.question_id),
  open_m as (select question_id from public.mistakes where user_id = auth.uid() and status <> 'graduated')
  select u.id, u.subject, u.semester, u.seq, u.title,
    count(qs.id)::int,
    count(qs.id) filter (where mine.ok and not exists (select 1 from open_m o where o.question_id = qs.id))::int,
    count(mine.question_id)::int
  from public.units u
  cross join me
  left join qs on qs.unit_id = u.id
  left join mine on mine.question_id = qs.id
  where (u.semester in ('5A', '5B', '6A', '6B')) = me.elem
  group by u.id, u.subject, u.semester, u.seq, u.title
  order by u.semester, u.subject, u.seq
$$;

revoke execute on function public.weekly_leaderboard(int), public.set_leaderboard_hidden(boolean), public.garden(),
  public.log_xp_daily() from public, anon;
grant execute on function public.weekly_leaderboard(int), public.set_leaderboard_hidden(boolean), public.garden()
  to authenticated;
