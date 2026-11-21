// 世界地圖、金幣、魔物夥伴、大廳商店的資料庫測試（PGlite 執行正式 migration，不載入大題庫）
// 執行：cd tests && node world.test.mjs
import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const db = new PGlite();
await db.exec(read('tests/supabase_stub.sql'));
for (const f of readdirSync(new URL('supabase/migrations/', root)).sort()) await db.exec(read('supabase/migrations/' + f));

// 兩個數學單元（seq 1、5 → 同一種夥伴 math-1）和一個國文單元，每單元 12 題，答案都是 A
await db.exec(`
  insert into public.units values ('W-7A-1','math','7A',1,'整數'), ('W-7A-5','math','7A',5,'方程式'), ('WC-7A-1','chinese','7A',1,'字音');
  insert into public.questions (id, unit_id, concept, stem, options, answer, explanation, wrong_reasons)
  select u || '-' || g, u, 'c', u || ' 第' || g || '題',
         jsonb_build_array(jsonb_build_object('key','A','text','x'), jsonb_build_object('key','B','text','y')), 'A', '解析', '{"B":"錯"}'
  from unnest(array['W-7A-1','W-7A-5','WC-7A-1']) u, generate_series(1, 12) g;
  update public.questions set difficulty = 3 where unit_id = 'W-7A-5' and id in ('W-7A-5-10', 'W-7A-5-11', 'W-7A-5-12');
`);

let passed = 0;
const test = async (name, fn) => {
  try { await fn(); passed++; console.log('  ✓ ' + name); }
  catch (e) { console.error('  ✗ ' + name + '\n    ' + e.message + '\n' + (e.stack || '').split('\n').find((l) => l.includes('world.test'))); process.exitCode = 1; }
};
async function newUser(meta = {}) {
  return (await db.query(`insert into auth.users (raw_user_meta_data) values ($1) returning id`, [meta])).rows[0].id;
}
async function as(uid, fn) {
  await db.exec(`reset role; set request.jwt.claim.sub = '${uid}'; set role authenticated;`);
  try { return await fn(); } finally { await db.exec(`reset role; set request.jwt.claim.sub = '';`); }
}
const setToday = (d) => db.exec(`set app.today = '${d}'`);
const rpc = (uid, sql, args = []) => as(uid, async () => (await db.query(`select ${sql} r`, args)).rows[0].r);
const answer = (uid, q, c) => rpc(uid, `public.submit_answer($1,$2,'practice',null)`, [q, c]);
const state = (uid) => rpc(uid, `public.world_state()`);
const conquer = (uid, unit, ids) => rpc(uid, `public.conquer($1,$2)`, [unit, ids]);
const map = (uid) => as(uid, async () => (await db.query(`select * from public.world_map('7A')`)).rows);
async function expectError(p, msg) {
  let err; try { await p; } catch (e) { err = e; }
  assert.ok(err, '應該要失敗但沒有'); assert.match(err.message, new RegExp(msg));
}
const ids = (u, from, n = 3) => Array.from({ length: n }, (_, i) => `${u}-${from + i}`);
async function battle(uid, unit, from, choices = ['A', 'A', 'A']) {
  const q = ids(unit, from, choices.length);
  for (let i = 0; i < q.length; i++) await answer(uid, q[i], choices[i]);
  return conquer(uid, unit, q);
}

console.log('世界地圖與金幣測試');
await setToday('2026-11-16');
const u = await newUser({ nickname: '勇者', parent_consent: 'true' });

await test('答對 +5 金幣、答錯不給', async () => {
  await answer(u, 'W-7A-1-1', 'A');
  await answer(u, 'W-7A-1-2', 'B');
  const s = await state(u);
  assert.equal(s.gold, 5); assert.equal(s.gold_today, 5); assert.equal(s.total_correct, 1);
});

await test('領地戰答對不到 3 題：沒有佔領、沒有夥伴', async () => {
  const r = await conquer(u, 'W-7A-1', ['W-7A-1-1', 'W-7A-1-2', 'W-7A-1-3']);
  assert.equal(r.won, false); assert.equal(r.correct, 1);
  assert.equal((await map(u)).find((x) => x.unit_id === 'W-7A-1').won, false);
});

await test('打贏：佔領領地、收服夥伴、+30 金幣、自動成為出戰夥伴', async () => {
  const r = await battle(u, 'W-7A-1', 4);
  assert.equal(r.won, true); assert.equal(r.first, true); assert.equal(r.new_pal, true);
  assert.equal(r.species, 'math-1'); assert.equal(r.caught, 1); assert.equal(r.gold_gained, 30);
  const s = await state(u);
  assert.equal(s.gold, 5 + 15 + 30); assert.equal(s.team_pal, 'math-1'); assert.equal(s.territories, 1);
  assert.deepEqual(s.pals, [{ species: 'math-1', caught: 1, xp: 20, stage: 1 }]);
  assert.deepEqual(s.team, ['math-1']);
  assert.equal(r.pal_xp, 20); assert.equal(r.pal_xp_gained, 20);
});

await test('同一塊領地同一天再打贏：不重複給獎勵', async () => {
  const r = await battle(u, 'W-7A-1', 7);
  assert.equal(r.won, true); assert.equal(r.rewarded, false); assert.equal(r.gold_gained, 0); assert.equal(r.caught, 1);
});

await test('題目不屬於這個單元、或題數不對：拒絕', async () => {
  await expectError(conquer(u, 'W-7A-5', ['W-7A-1-4', 'W-7A-1-5', 'W-7A-1-6']), 'bad_battle');
  await expectError(conquer(u, 'W-7A-1', ['W-7A-1-4']), 'bad_battle');
});

await test('錯題到期：已佔領的領地顯示魔物入侵（due > 0），複習答對後解除', async () => {
  let m = (await map(u)).find((x) => x.unit_id === 'W-7A-1');
  assert.equal(m.won, true); assert.equal(m.due, 1);   // 一開始答錯的 W-7A-1-2
  assert.equal((await state(u)).invaded, 1);
  const qs = await as(u, async () => (await db.query(`select id from public.battle_questions('W-7A-1', 5)`)).rows);
  assert.equal(qs[0].id, 'W-7A-1-2', '領地戰先出該複習的錯題');
  await answer(u, 'W-7A-1-2', 'A');
  m = (await map(u)).find((x) => x.unit_id === 'W-7A-1');
  assert.equal(m.due, 0);
  assert.equal((await state(u)).invaded, 0);
});

await test('隔天再打贏同一塊：+20 金幣、夥伴收服 +1、經驗 +20；經驗到 60 進化成體', async () => {
  await setToday('2026-11-17');
  const xp0 = (await state(u)).pals.find((p) => p.species === 'math-1').xp;
  const r = await battle(u, 'W-7A-1', 10);
  assert.equal(r.rewarded, true); assert.equal(r.first, false); assert.equal(r.gold_gained, 20); assert.equal(r.caught, 2);
  // 3 題答對：隊伍裡的 math-1 每題助攻 +5，打贏再 +20
  assert.equal(r.pal_xp, xp0 + 15 + 20);
  await db.exec(`update public.companions set xp = 45 where species = 'math-1' and user_id = '${u}'`);
  const r2 = await battle(u, 'W-7A-5', 1);   // seq 5 也是 math-1
  assert.equal(r2.species, 'math-1'); assert.equal(r2.caught, 3);
  assert.equal(r2.stage_before, 2); assert.equal(r2.stage, 2);   // 45 + 15 助攻 = 60，結算前就已經進化
  assert.equal(r2.pal_xp, 80);
});

await test('商店：金幣不夠、條件沒到不能買；買了家具扣金幣、不能重複買', async () => {
  await expectError(rpc(u, `public.buy_item('weapon')`), 'item_locked');
  await expectError(rpc(u, `public.buy_item('bed')`), 'not_enough_gold');
  const before = (await state(u)).gold;
  const s = await rpc(u, `public.buy_item('plant')`);
  assert.equal(s.gold, before - 120); assert.deepEqual(s.owned, ['plant']);
  await expectError(rpc(u, `public.buy_item('plant')`), 'item_owned');
});

await test('熱湯：今天多 3 題，每天最多 2 碗', async () => {
  await db.exec(`update public.profiles set gold = 1000 where id = '${u}'`);
  const max0 = (await state(u)).energy_max;
  let s = await rpc(u, `public.buy_item('soup')`);
  assert.equal(s.energy_max, max0 + 3); assert.equal(s.soups_left, 1);
  await rpc(u, `public.buy_item('soup')`);
  await expectError(rpc(u, `public.buy_item('soup')`), 'soup_limit');
});

await test('床：買的當天 +5 題，隔天新的一天也自動 +5 題', async () => {
  const max0 = (await state(u)).energy_max;
  const s = await rpc(u, `public.buy_item('bed')`);
  assert.equal(s.energy_max, max0 + 5);
  await setToday('2026-11-18');
  assert.equal((await state(u)).energy_max, 35);
  await answer(u, 'WC-7A-1-1', 'A');
  assert.equal((await state(u)).energy_max, 35);
});

await test('每日金幣上限 300', async () => {
  await db.exec(`update public.daily_activity set gold = 298 where user_id = '${u}' and day = '2026-11-18'`);
  const g0 = (await state(u)).gold;
  await answer(u, 'WC-7A-1-2', 'A');
  const s = await state(u);
  assert.equal(s.gold, g0 + 2); assert.equal(s.gold_today, 300);
  await answer(u, 'WC-7A-1-3', 'A');
  assert.equal((await state(u)).gold, g0 + 2);
});

await test('出戰夥伴只能選已收服的', async () => {
  await expectError(rpc(u, `public.set_team_pal('social-2')`), 'pal_not_owned');
  await battle(u, 'WC-7A-1', 4);
  await rpc(u, `public.set_team_pal('chinese-1')`);
  assert.equal((await state(u)).team_pal, 'chinese-1');
});

await test('每日任務：進度照今天的作答算，完成才能領，領過不能再領', async () => {
  const q0 = await rpc(u, `public.daily_quests()`);
  assert.deepEqual(q0.map((x) => x.id), ['review', 'correct', 'conquer', 'answer']);
  const conquerQ = q0.find((x) => x.id === 'conquer');
  assert.equal(conquerQ.progress, 1); assert.equal(conquerQ.claimed, false);   // 今天打贏過 WC-7A-1
  assert.equal(q0.find((x) => x.id === 'correct').progress < 10, true);
  await expectError(rpc(u, `public.claim_quest('correct')`), 'quest_not_done');
  const g0 = (await state(u)).gold;
  const r = await rpc(u, `public.claim_quest('conquer')`);
  assert.equal(r.gold_gained, 40); assert.equal(r.gold, g0 + 40);   // 不受每日金幣上限限制
  assert.equal(r.quests.find((x) => x.id === 'conquer').claimed, true);
  await expectError(rpc(u, `public.claim_quest('conquer')`), 'quest_claimed');
  await expectError(rpc(u, `public.claim_quest('nope')`), 'quest_not_found');
  await setToday('2026-11-19');
  assert.equal((await rpc(u, `public.daily_quests()`)).find((x) => x.id === 'conquer').claimed, false);
  await setToday('2026-11-18');
});

await test('熟練度：同一塊領地在 3 個不同日子打贏就熟練，+50 金幣只給一次', async () => {
  // W-7A-1 已經在 11-16、11-17 打贏過
  let m = (await map(u)).find((x) => x.unit_id === 'W-7A-1');
  assert.equal(m.mastery, 2);
  await db.exec(`update public.daily_activity set gold = 0 where user_id = '${u}' and day = '2026-11-18'`);
  const r = await battle(u, 'W-7A-1', 1);
  assert.equal(r.days, 3); assert.equal(r.mastered, true); assert.equal(r.gold_gained, 20 + 50);
  assert.equal((await state(u)).mastered, 1);
  const r2 = await battle(u, 'W-7A-1', 4);
  assert.equal(r2.mastered, false); assert.equal(r2.days, 3);
});

await test('守護者：只能派已收服的夥伴守已佔領的領地，一隻只守一塊；隔天收回多 10 金幣', async () => {
  await expectError(rpc(u, `public.set_guard('W-7A-1', 'social-2')`), 'pal_not_owned');
  const other = await newUser({ nickname: '沒領地', parent_consent: 'true' });
  await expectError(rpc(other, `public.set_guard('W-7A-1', 'math-1')`), 'territory_not_owned');
  await rpc(u, `public.set_guard('W-7A-1', 'math-1')`);
  await rpc(u, `public.set_guard('W-7A-5', 'math-1')`);
  const m = await map(u);
  assert.equal(m.find((x) => x.unit_id === 'W-7A-1').guard, null);
  assert.equal(m.find((x) => x.unit_id === 'W-7A-5').guard, 'math-1');
  await setToday('2026-11-19');
  const r = await battle(u, 'W-7A-5', 4);
  assert.equal(r.guard_bonus, 10); assert.equal(r.gold_gained, 30);
  await rpc(u, `public.set_guard('W-7A-5', null)`);
  assert.equal((await map(u)).find((x) => x.unit_id === 'W-7A-5').guard, null);
});

await test('星晶：答對困難題掉 1 顆（每天上限 5），3 顆可以培養夥伴一次', async () => {
  assert.equal((await state(u)).gems, 0);
  await expectError(rpc(u, `public.feed_pal('math-1')`), 'not_enough_gems');
  for (const n of [10, 11, 12]) await answer(u, `W-7A-5-${n}`, 'A');
  await answer(u, 'W-7A-5-7', 'A');   // 不是困難題，不掉
  let s = await state(u);
  assert.equal(s.gems, 3); assert.equal(s.gems_today, 3);
  const before = s.pals.find((p) => p.species === 'math-1').xp;
  s = await rpc(u, `public.feed_pal('math-1')`);
  assert.equal(s.gems, 0); assert.equal(s.pals.find((p) => p.species === 'math-1').xp, before + 20);
  await db.exec(`update public.daily_activity set gems = 5 where user_id = '${u}' and day = '2026-11-19'`);
  await answer(u, 'W-7A-5-10', 'A');
  assert.equal((await state(u)).gems, 0);
  await setToday('2026-11-18');
});

await test('家長戰報：只有綁定的家長看得到孩子的領地與被入侵的單元', async () => {
  const parent = await newUser({ nickname: '家長', role: 'parent' });
  await expectError(rpc(parent, `public.child_world('${u}')`), 'not_linked');
  await db.exec(`insert into public.parent_links (parent_id, student_id) values ('${parent}', '${u}')`);
  await answer(u, 'W-7A-1-9', 'B');
  const r = await rpc(parent, `public.child_world('${u}')`);
  assert.equal(r.territories, 3); assert.equal(r.mastered, 1); assert.equal(r.pals >= 2, true);
  assert.deepEqual(r.invaded.map((x) => x.title), ['整數']);
});

const v = await newUser({ nickname: '夥伴測試', parent_consent: 'true' });
await test('夥伴助攻：隊伍裡有同科夥伴才助攻、拿經驗；小老師驗收題不算', async () => {
  await battle(v, 'W-7A-5', 4);
  const xp0 = (await state(v)).pals.find((p) => p.species === 'math-1').xp;
  const r = await answer(v, 'W-7A-1-2', 'A');
  assert.equal(r.assist_pal, 'math-1'); assert.equal(r.pal_xp.xp_gained, 5); assert.equal(r.pal_xp.xp, xp0 + 5);
  const c = await answer(v, 'WC-7A-1-12', 'A');            // 國文題，隊伍裡沒有國文夥伴
  assert.equal(c.assist_pal, null); assert.equal(c.pal_xp, null);
  const t = await rpc(v, `public.submit_answer('W-7A-1-3','A','tutor_check',null)`);
  assert.equal(t.assist_pal, 'math-1'); assert.equal(t.pal_xp, null);
  const w = await answer(v, 'W-7A-1-3', 'B');              // 答錯不給
  assert.equal(w.pal_xp, null);
});

await test('淨化：錯題畢業＝淨化野生魔物，收服這個單元的夥伴並加入隊伍', async () => {
  const before = await state(v);
  assert.equal(before.pals.some((p) => p.species === 'chinese-1'), false);
  await answer(v, 'WC-7A-1-11', 'B');                       // 答錯 → 野生魔物
  const list = await as(v, async () => (await db.query(`select species, status from public.list_mistakes(null) where question->>'id' = 'WC-7A-1-11'`)).rows);
  assert.deepEqual(list, [{ species: 'chinese-1', status: 'pending' }]);
  assert.equal((await state(v)).wild, before.wild + 1);
  // 直接把錯題推到最後一關（almost、今天到期），再答對就畢業
  await db.exec(`update public.mistakes set status = 'almost', next_review = '2000-01-01' where user_id = '${v}' and question_id = 'WC-7A-1-11'`);
  const r = await rpc(v, `public.submit_answer('WC-7A-1-11','A','review',null)`);
  assert.equal(r.mistake_status, 'graduated');
  assert.equal(r.purified.species, 'chinese-1'); assert.equal(r.purified.new_pal, true); assert.equal(r.purified.xp, 30);
  const s = await state(v);
  assert.equal(s.purified, before.purified + 1);
  assert.ok(s.team.includes('chinese-1'), '新收服的夥伴自動加入隊伍');
  assert.equal(s.pals.find((p) => p.species === 'chinese-1').caught, 1);
  // 每日任務「削弱野生魔物」：今天複習答對的錯題
  assert.equal((await rpc(v, `public.daily_quests()`)).find((x) => x.id === 'review').progress, 1);
});

await test('出戰隊伍：最多 3 隻、不能重複、都要收服過；隊長是第一隻', async () => {
  await expectError(rpc(u, `public.set_team(array['math-1','math-1'])`), 'bad_team');
  await expectError(rpc(u, `public.set_team(array['math-1','social-2'])`), 'pal_not_owned');
  await expectError(rpc(u, `public.set_team(array['math-1','chinese-1','english-1','science-1'])`), 'team_too_big');
  await rpc(u, `public.set_team(array['chinese-1','math-1'])`);
  let s = await state(u);
  assert.deepEqual(s.team, ['chinese-1', 'math-1']); assert.equal(s.team_pal, 'chinese-1');
  await rpc(u, `public.set_team_pal('math-1')`);
  s = await state(u);
  assert.deepEqual(s.team, ['math-1', 'chinese-1']); assert.equal(s.team_pal, 'math-1');
  await rpc(u, `public.set_team(array[]::text[])`);
  assert.deepEqual((await state(u)).team, []);
  await rpc(u, `public.set_team(array['math-1','chinese-1'])`);
});

await test('成就：錯題改叫淨化，新增夥伴系列', async () => {
  const a = await rpc(v, `public.achievements()`);
  const g = a.find((x) => x.id === 'grad-1');
  assert.equal(g.group, '淨化'); assert.equal(g.done, true);
  assert.equal(a.find((x) => x.id === 'pals-5').progress, 2);
  assert.ok(a.some((x) => x.id === 'awaken-1'));
});

await test('學生不能直接改金幣、不能呼叫內部函式、看不到別人的領地', async () => {
  await expectError(as(u, () => db.query(`update public.profiles set gold = 99999 where id = '${u}'`)), 'permission denied');
  await expectError(as(u, () => db.query(`select public.add_gold('${u}', 100)`)), 'permission denied');
  await expectError(as(u, () => db.query(`select public.grant_pal_xp('${u}', 'math-1', 999, true)`)), 'permission denied');
  await expectError(as(u, () => db.query(`update public.profiles set team = array['social-4'] where id = '${u}'`)), 'permission denied');
  // 資料表開了 RLS 又沒有政策：直接查表拿不到任何資料，也寫不進去
  for (const t of ['territories', 'companions', 'hall_items'])
    assert.equal((await as(u, () => db.query(`select * from public.${t}`))).rows.length, 0, t);
  await expectError(as(u, () => db.query(`insert into public.hall_items (user_id, item_id) values ('${u}', 'weapon')`)), 'row-level security|permission denied');
  const other = await newUser({ nickname: '路人', parent_consent: 'true' });
  assert.ok((await map(other)).every((x) => !x.won));
  assert.equal((await state(other)).gold, 0);
});

console.log(`\n${passed} 項通過`);
