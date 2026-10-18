// 資料庫邏輯測試：用 PGlite（WASM 版 PostgreSQL）執行正式 migration 與題庫種子資料
// 執行：cd tests && npm install && node db.test.mjs
import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');

const db = new PGlite();
await db.exec(read('tests/supabase_stub.sql'));
for (const f of readdirSync(new URL('supabase/migrations/', root)).sort()) {
  await db.exec(read('supabase/migrations/' + f));
}
const seedPath = 'supabase/seed.sql';
const hasSeed = existsSync(new URL(seedPath, root));
if (hasSeed) await db.exec(read(seedPath));

// 測試用小題庫（獨立於正式題庫）
await db.exec(`
  insert into public.units values ('T-7A-1','math','7A',1,'測試單元');
  insert into public.questions (id, unit_id, concept, stem, options, answer, explanation, wrong_reasons)
  select 'T' || g, 'T-7A-1', case when g % 2 = 0 then 'even' else 'odd' end, '1+' || g || '=?',
         jsonb_build_array(jsonb_build_object('key','A','text','x'), jsonb_build_object('key','B','text','y')),
         'A', '解析' || g, '{"B":"常見錯誤"}'
  from generate_series(1, 60) g;
`);

let passed = 0;
const test = async (name, fn) => {
  try { await fn(); passed++; console.log('  ✓ ' + name); }
  catch (e) { console.error('  ✗ ' + name + '\n    ' + e.message); process.exitCode = 1; }
};

async function newUser(meta = {}) {
  const r = await db.query(`insert into auth.users (raw_user_meta_data) values ($1) returning id`, [meta]);
  return r.rows[0].id;
}
async function as(uid, fn) {
  await db.exec(`reset role; set request.jwt.claim.sub = '${uid}'; set role authenticated;`);
  try { return await fn(); } finally { await db.exec(`reset role; set request.jwt.claim.sub = '';`); }
}
const setToday = (d) => db.exec(`set app.today = '${d}'`);
const answer = (uid, q, c, ctx = 'practice', forM = null) =>
  as(uid, async () => (await db.query(`select public.submit_answer($1,$2,$3,$4) r`, [q, c, ctx, forM])).rows[0].r);
const home = (uid) => as(uid, async () => (await db.query(`select public.get_home() r`)).rows[0].r);
async function expectError(p, msg) {
  let err;
  try { await p; } catch (e) { err = e; }
  assert.ok(err, '應該要失敗但沒有');
  if (msg) assert.match(err.message, new RegExp(msg));
}

console.log('資料庫測試');
const s1 = await newUser({ nickname: '小安', parent_consent: 'true' });

await test('註冊自動建立 profile，給 2 張保護卡並記錄家長同意', async () => {
  const r = await db.query(`select * from public.profiles where id = $1`, [s1]);
  assert.equal(r.rows[0].nickname, '小安');
  assert.equal(r.rows[0].freeze_cards, 2);
  assert.ok(r.rows[0].parent_consent_at);
});

await test('學生讀不到答案：questions 表禁止讀取，公開檢視沒有 answer 欄位', async () => {
  await expectError(as(s1, () => db.query(`select answer from public.questions limit 1`)), 'permission denied');
  const r = await as(s1, () => db.query(`select * from public.questions_public limit 1`));
  assert.ok(!('answer' in r.rows[0]));
  assert.ok(!('explanation' in r.rows[0]));
});

await test('學生不能直接改 XP 或連勝，只能改暱稱等欄位', async () => {
  await expectError(as(s1, () => db.query(`update public.profiles set xp = 99999 where id = $1`, [s1])), 'permission denied');
  await as(s1, () => db.query(`update public.profiles set nickname = '安安', grade = 8 where id = $1`, [s1]));
  const r = await db.query(`select nickname, grade from public.profiles where id = $1`, [s1]);
  assert.equal(r.rows[0].nickname, '安安');
});

await test('答錯：收進錯題本（待講解），回傳正確答案與錯誤原因', async () => {
  await setToday('2026-09-01');
  const r = await answer(s1, 'T1', 'B');
  assert.equal(r.correct, false);
  assert.equal(r.answer, 'A');
  assert.equal(r.wrong_reason, '常見錯誤');
  assert.equal(r.mistake_status, 'pending');
  assert.equal(r.xp_gained, 0);
});

await test('答對 +10 XP；非法選項被拒絕', async () => {
  const r = await answer(s1, 'T2', 'A');
  assert.equal(r.correct, true);
  assert.equal(r.xp_gained, 10);
  await expectError(answer(s1, 'T2', 'Z'), 'bad_choice');
});

await test('當天第 5 題達標 → 連勝 1 天', async () => {
  await answer(s1, 'T3', 'A'); await answer(s1, 'T4', 'A');
  const r = await answer(s1, 'T5', 'A');
  assert.equal(r.today_answered, 5);
  assert.equal(r.streak, 1);
  assert.equal(r.streak_up, true);
  const again = await answer(s1, 'T6', 'A');
  assert.equal(again.streak_up, false, '同一天不重複加');
});

const doFive = async (uid, day, start) => {
  await setToday(day);
  let r;
  for (let i = 0; i < 5; i++) r = await answer(uid, 'T' + (start + i), 'A');
  return r;
};

await test('隔天再達標 → 連勝 2 天', async () => {
  const r = await doFive(s1, '2026-09-02', 10);
  assert.equal(r.streak, 2);
});

await test('漏 1 天：自動用 1 張保護卡，連勝不中斷', async () => {
  const r = await doFive(s1, '2026-09-04', 20);
  assert.equal(r.streak, 3);
  assert.equal(r.freeze_cards, 1);
  const f = await db.query(`select froze from public.daily_activity where user_id=$1 and day='2026-09-03'`, [s1]);
  assert.equal(f.rows[0].froze, true);
});

await test('首頁在斷掉後顯示 0；漏太多天（保護卡不夠）連勝重算為 1', async () => {
  await setToday('2026-09-08');
  assert.equal((await home(s1)).streak, 0);
  const r = await doFive(s1, '2026-09-08', 30);
  assert.equal(r.streak, 1);
  assert.equal(r.freeze_cards, 1, '不夠補時不扣卡');
});

await test('錯題流程：驗收答對→學習中；未到期不前進；依 1/3/7 天前進到畢業並加 30 XP', async () => {
  await setToday('2026-09-10');
  await answer(s1, 'T41', 'B');                                   // 答錯
  let r = await answer(s1, 'T43', 'A', 'tutor_check', 'T41');     // 相似題驗收答對
  assert.equal(r.mistake_status, 'learning');
  r = await answer(s1, 'T41', 'A', 'review');                     // 同一天：還沒到期
  assert.equal(r.mistake_status, 'learning');
  await setToday('2026-09-11');
  r = await answer(s1, 'T41', 'A', 'review');
  assert.equal(r.mistake_status, 'consolidating');
  await setToday('2026-09-14');
  r = await answer(s1, 'T41', 'A', 'review');
  assert.equal(r.mistake_status, 'almost');
  await setToday('2026-09-21');
  r = await answer(s1, 'T41', 'A', 'review');
  assert.equal(r.mistake_status, 'graduated');
  assert.equal(r.xp_gained, 40);
});

await test('複習答錯 → 退回待講解', async () => {
  await setToday('2026-09-22');
  await answer(s1, 'T45', 'B');
  await answer(s1, 'T47', 'A', 'tutor_check', 'T45');
  await setToday('2026-09-23');
  const r = await answer(s1, 'T45', 'B', 'review');
  assert.equal(r.mistake_status, 'pending');
});

await test('到期複習清單與錯題本清單只列出自己的題目', async () => {
  await setToday('2026-09-24');
  await answer(s1, 'T49', 'B');
  await answer(s1, 'T51', 'A', 'tutor_check', 'T49');
  await setToday('2026-09-25');
  const due = await as(s1, () => db.query(`select * from public.due_reviews(10)`));
  assert.ok(due.rows.some((x) => x.question.id === 'T49'));
  assert.ok(!('answer' in due.rows[0].question));
  const s2 = await newUser();
  const other = await as(s2, () => db.query(`select * from public.list_mistakes(null)`));
  assert.equal(other.rows.length, 0);
  const direct = await as(s2, () => db.query(`select * from public.mistakes`));
  assert.equal(direct.rows.length, 0, 'RLS 擋住別人的錯題');
});

await test('相似題：同單元、不同題、優先同觀念', async () => {
  const r = await as(s1, () => db.query(`select * from public.similar_question('T2')`));
  assert.equal(r.rows.length, 1);
  assert.notEqual(r.rows[0].id, 'T2');
  assert.equal(r.rows[0].concept, 'even');
});

await test('取題優先出沒做過的題目', async () => {
  const r = await as(s1, () => db.query(`select id from public.next_questions(array['T-7A-1'], 5)`));
  const done = await db.query(`select distinct question_id from public.attempts where user_id=$1`, [s1]);
  const doneSet = new Set(done.rows.map((x) => x.question_id));
  assert.ok(r.rows.every((x) => !doneSet.has(x.id)));
});

await test('免費版每日 30 題上限；前三名通過後不受限', async () => {
  const s3 = await newUser();
  await setToday('2026-10-01');
  for (let i = 1; i <= 30; i++) await answer(s3, 'T' + i, 'A');
  await expectError(answer(s3, 'T31', 'A'), 'daily_limit_reached');

  // 前三名申請
  await expectError(as(s3, () => db.query(
    `select public.apply_top_three('測試國中', 8, '第一次段考', 1, 'someone-else/a.jpg', true)`)), 'bad_proof_path');
  const app = await as(s3, () => db.query(
    `select public.apply_top_three('測試國中', 8, '第一次段考', 1, $1, true) id`, [s3 + '/proof.jpg']));
  await expectError(as(s3, () => db.query(
    `select public.apply_top_three('測試國中', 8, '第一次段考', 1, $1, true)`, [s3 + '/p2.jpg'])), 'already_pending');
  await expectError(as(s3, () => db.query(`select public.review_top_three($1, true)`, [app.rows[0].id])), 'permission denied');
  await db.query(`select public.review_top_three($1, true, 'ok')`, [app.rows[0].id]);  // 管理員
  const p = await db.query(`select premium_until from public.profiles where id=$1`, [s3]);
  assert.equal(p.rows[0].premium_until.toISOString().slice(0, 10), '2027-01-31');
  const r = await answer(s3, 'T31', 'A');
  assert.equal(r.correct, true);
});

await test('學期結束日計算', async () => {
  const r = await db.query(`select public.semester_end('2026-03-10')::text a, public.semester_end('2026-09-10')::text b, public.semester_end('2027-01-05')::text c`);
  assert.deepEqual(r.rows[0], { a: '2026-07-31', b: '2027-01-31', c: '2027-01-31' });
});

await test('家長用邀請碼綁定後可看摘要；未綁定看不到', async () => {
  const parent = await newUser({ role: 'parent', nickname: '媽媽' });
  const code = (await db.query(`select invite_code from public.profiles where id=$1`, [s1])).rows[0].invite_code;
  await expectError(as(parent, () => db.query(`select public.get_child_summary($1)`, [s1])), 'not_linked');
  await expectError(as(s1, () => db.query(`select public.link_child($1)`, [code])), 'not_parent');
  await as(parent, () => db.query(`select public.link_child($1)`, [code.toLowerCase()]));
  await setToday('2026-09-25');
  const r = await as(parent, () => db.query(`select public.get_child_summary($1) s`, [s1]));
  assert.equal(r.rows[0].s.nickname, '安安');
  assert.equal(r.rows[0].s.days.length, 7);
});

await test('未登入不能作答', async () => {
  await db.exec(`reset role; set request.jwt.claim.sub = ''; set role anon;`);
  let err; try { await db.query(`select public.submit_answer('T1','A')`); } catch (e) { err = e; }
  await db.exec(`reset role;`);
  assert.ok(err);
});

await test('Storage：成績證明只能放在自己的資料夾', async () => {
  await as(s1, () => db.query(`insert into storage.objects (bucket_id, name) values ('proofs', $1)`, [s1 + '/a.jpg']));
  await expectError(as(s1, () => db.query(`insert into storage.objects (bucket_id, name) values ('proofs', 'x/a.jpg')`)), 'row-level security');
});

await test('訂閱：只有伺服器能寫入到期日；有效訂閱＝完整版，過期就恢復免費', async () => {
  const s4 = await newUser();
  await setToday('2026-10-02');
  await expectError(as(s4, () => db.query(`select public.set_subscription($1, now() + interval '30 days')`, [s4])), 'permission denied');
  await expectError(as(s4, () => db.query(`update public.profiles set subscription_until = now() + interval '1 year' where id = $1`, [s4])), 'permission denied');
  await db.query(`select public.set_subscription($1, now() + interval '30 days')`, [s4]);   // 伺服器
  let h = await home(s4);
  assert.equal(h.premium, true);
  assert.equal(h.subscribed, true);
  assert.equal(h.tutor_limit_today, 50);
  await db.query(`select public.set_subscription($1, now() - interval '1 day')`, [s4]);
  h = await home(s4);
  assert.equal(h.premium, false);
  assert.equal(h.tutor_limit_today, 3);
});

await test('看廣告換小老師：每次 +1、20 秒內不能連續領、每天最多 2 次、完整版不能領', async () => {
  const s5 = await newUser();
  await setToday('2026-10-03');
  const grant = () => as(s5, async () => (await db.query(`select public.grant_ad_bonus() r`)).rows[0].r);
  const r1 = await grant();
  assert.equal(r1.bonus_left, 1);
  await expectError(grant(), 'ad_bonus_too_fast');
  await db.query(`update public.tutor_usage set last_bonus_at = now() - interval '1 minute' where user_id = $1`, [s5]);
  await grant();
  await db.query(`update public.tutor_usage set last_bonus_at = now() - interval '1 minute' where user_id = $1`, [s5]);
  await expectError(grant(), 'ad_bonus_limit');
  assert.equal((await home(s5)).tutor_limit_today, 5);
  await db.query(`select public.set_subscription($1, now() + interval '30 days')`, [s5]);
  await expectError(grant(), 'already_premium');
  await db.query(`update public.app_config set value = 'false' where key = 'ads_enabled'`);
  const s6 = await newUser();
  await expectError(as(s6, () => db.query(`select public.grant_ad_bonus()`)), 'ads_disabled');
  await db.query(`update public.app_config set value = 'true' where key = 'ads_enabled'`);
});

await test('管理後台：一般使用者全部被擋；管理員可以看總覽、審核（開通完整版）、處理回報、下架題目、刪證明照片', async () => {
  const student = await newUser();
  const admin = await newUser();
  await db.query(`insert into public.admins (user_id) values ($1)`, [admin]);
  await setToday('2026-10-05');
  // 學生送出申請與回報
  const path = student + '/p.jpg';
  await as(student, () => db.query(`insert into storage.objects (bucket_id, name) values ('proofs', $1)`, [path]));
  const appId = (await as(student, () => db.query(`select public.apply_top_three('測試國中', 9, '期中考', 2, $1, true) id`, [path]))).rows[0].id;
  await as(student, () => db.query(`select public.report_question('T3', 'question_wrong', '答案好像錯了')`));

  for (const fn of [`select public.admin_stats()`, `select * from public.admin_pending_applications()`, `select * from public.admin_reports()`]) {
    await expectError(as(student, () => db.query(fn)), 'not_admin');
  }
  await expectError(as(student, () => db.query(`select public.admin_review_top_three($1, true)`, [appId])), 'not_admin');
  await expectError(as(student, () => db.query(`select * from public.admins`)), 'permission denied');

  const stats = (await as(admin, () => db.query(`select public.admin_stats() s`))).rows[0].s;
  assert.ok(stats.pending_top_three >= 1);
  assert.ok(stats.open_reports >= 1);
  const pending = await as(admin, () => db.query(`select * from public.admin_pending_applications()`));
  assert.ok(pending.rows.some((r) => r.id === appId));
  const back = await as(admin, () => db.query(`select public.admin_review_top_three($1, true, '恭喜') p`, [appId]));
  assert.equal(back.rows[0].p, path);
  const prof = await db.query(`select premium_until::text from public.profiles where id = $1`, [student]);
  assert.equal(prof.rows[0].premium_until, '2027-01-31');

  const reps = await as(admin, () => db.query(`select * from public.admin_reports()`));
  const rep = reps.rows.find((r) => r.question_id === 'T3');
  assert.ok(rep && rep.answer === 'A', '管理員看得到答案以便檢查');
  await as(admin, () => db.query(`select public.admin_set_question_active('T3', false)`));
  await as(admin, () => db.query(`select public.admin_resolve_report($1)`, [rep.report_id]));
  assert.equal((await db.query(`select active from public.questions where id = 'T3'`)).rows[0].active, false);
  assert.equal((await as(admin, () => db.query(`select * from public.admin_reports()`))).rows.filter((r) => r.question_id === 'T3').length, 0);
  await db.query(`update public.questions set active = true where id = 'T3'`);

  // 照片：管理員看得到、刪得掉；其他學生看不到
  const other = await newUser();
  assert.equal((await as(other, () => db.query(`select * from storage.objects where name = $1`, [path]))).rows.length, 0);
  assert.equal((await as(admin, () => db.query(`select * from storage.objects where name = $1`, [path]))).rows.length, 1);
  await as(admin, () => db.query(`delete from storage.objects where name = $1`, [path]));
  assert.equal((await db.query(`select count(*)::int n from storage.objects where name = $1`, [path])).rows[0].n, 0);
});

await test('函式權限白名單：學生不能呼叫內部函式（審核、訂閱、計次、查別人是否付費）', async () => {
  const s = await newUser({ nickname: '白名單' });
  for (const sql of [
    `select public.review_top_three(gen_random_uuid(), true, 'x')`,
    `select public.set_subscription('${s}', now() + interval '1 year')`,
    `select public.tutor_consume('${s}', true, 999, 999)`,
    `select public.tutor_refund('${s}', true)`,
    `select public.is_premium('${s}')`,
    `select public.premium_until_of('${s}')`,
    `select public.next_mistake_state('pending')`,
    `select public.gen_invite_code()`,
  ]) {
    await expectError(as(s, () => db.query(sql)), 'permission denied');
  }
  // App 會用到的仍然可以呼叫
  await as(s, () => db.query(`select public.get_home()`));
});

await test('小老師計次：原子扣次、講解次數與回覆則數上限、全站上限、失敗退回', async () => {
  const u = await newUser({ nickname: '計次' });
  const consume = async (start, sl = 2, cl = 3) =>
    (await db.query(`select public.tutor_consume($1, $2, $3, $4) r`, [u, start, sl, cl])).rows[0].r;
  assert.equal(await consume(true), 'ok');
  assert.equal(await consume(true), 'ok');
  assert.equal(await consume(true), 'daily_tutor_limit');   // 講解次數 2 次用完
  assert.equal(await consume(false), 'ok');                 // 同一段對話的回覆還可以
  assert.equal(await consume(false), 'daily_call_limit');   // 回覆則數 3 則用完
  await db.query(`select public.tutor_refund($1, false)`, [u]);
  assert.equal(await consume(false), 'ok');                 // 退回後可以再用
  const g = (await db.query(`select calls from public.tutor_global_usage where day = public.app_today()`)).rows[0].calls;
  await db.query(`update public.app_config set value = $1 where key = 'global_daily_tutor_calls'`, [String(g)]);
  const u2 = await newUser({ nickname: '計次2' });
  assert.equal((await db.query(`select public.tutor_consume($1, true, 5, 5) r`, [u2])).rows[0].r, 'global_limit');
  await db.query(`update public.app_config set value = '20000' where key = 'global_daily_tutor_calls'`);
});

await test('邀請碼 8 碼；家長輸錯 10 次後當天鎖住；學生可查看、解除綁定、換新碼', async () => {
  const kid = await newUser({ nickname: '小孩' });
  const mom = await newUser({ nickname: '媽媽', role: 'parent' });
  const code = (await db.query(`select invite_code from public.profiles where id = $1`, [kid])).rows[0].invite_code;
  assert.match(code, /^[A-HJ-NP-Z2-9]{8}$/);
  const link = async (c) => (await as(mom, () => db.query(`select public.link_child($1) r`, [c]))).rows[0].r;
  for (let i = 0; i < 10; i++) assert.equal((await link('ZZZZZZZZ')).error, 'code_not_found');
  assert.equal((await link(code)).error, 'too_many_attempts', '猜太多次，連正確的碼也先擋下');
  await db.query(`delete from public.link_attempts where parent_id = $1`, [mom]);
  assert.equal((await link(code.slice(0, 4) + ' ' + code.slice(4).toLowerCase())).nickname, '小孩', '空白與小寫都可以');
  const ps = await as(kid, () => db.query(`select * from public.my_parents()`));
  assert.equal(ps.rows.length, 1);
  assert.equal(ps.rows[0].nickname, '媽媽');
  await as(kid, () => db.query(`select public.unlink_parent($1)`, [mom]));
  await expectError(as(mom, () => db.query(`select public.get_child_summary($1)`, [kid])), 'not_linked');
  const newCode = (await as(kid, () => db.query(`select public.rotate_invite_code() c`))).rows[0].c;
  assert.notEqual(newCode, code);
  assert.equal((await link(code)).error, 'code_not_found', '舊碼失效');
});

await test('家長端：列出已綁定的孩子、自己解除綁定；不能解除別人的綁定', async () => {
  const kid = await newUser({ nickname: '阿明' });
  const dad = await newUser({ nickname: '爸爸', role: 'parent' });
  const other = await newUser({ nickname: '路人', role: 'parent' });
  const code = (await db.query(`select invite_code from public.profiles where id = $1`, [kid])).rows[0].invite_code;
  await as(dad, () => db.query(`select public.link_child($1)`, [code]));
  await as(other, () => db.query(`select public.link_child($1)`, [code]));
  const ks = await as(dad, () => db.query(`select * from public.my_children()`));
  assert.deepEqual(ks.rows.map((r) => r.nickname), ['阿明']);
  // 路人家長呼叫 unlink_child 只會刪到自己的綁定
  await as(other, () => db.query(`select public.unlink_child($1)`, [kid]));
  assert.equal((await as(dad, () => db.query(`select * from public.my_children()`))).rows.length, 1, '別人解除不影響爸爸');
  await as(dad, () => db.query(`select public.unlink_child($1)`, [kid]));
  assert.equal((await as(dad, () => db.query(`select * from public.my_children()`))).rows.length, 0);
  await expectError(as(dad, () => db.query(`select public.get_child_summary($1)`, [kid])), 'not_linked');
  assert.equal((await as(kid, () => db.query(`select * from public.my_parents()`))).rows.length, 0, '孩子那邊也看不到了');
});

await test('題目回報：同一人重複回報只算一次；可回報小老師內容不恰當；AI 同意', async () => {
  const u = await newUser({ nickname: '回報' });
  const before = (await db.query(`select reported_count from public.questions where id = 'T4'`)).rows[0].reported_count;
  for (let i = 0; i < 3; i++) await as(u, () => db.query(`select public.report_question('T4', 'tutor_inappropriate')`));
  const after = (await db.query(`select reported_count from public.questions where id = 'T4'`)).rows[0].reported_count;
  assert.equal(after - before, 1);
  await as(u, () => db.query(`select public.give_ai_consent()`));
  const c = await db.query(`select ai_consent_at from public.profiles where id = $1`, [u]);
  assert.ok(c.rows[0].ai_consent_at);
  await expectError(as(u, () => db.query(`update public.profiles set ai_consent_at = null where id = auth.uid()`)), 'permission denied');
});

await test('多科目：學生可設定每日練習科目（至少 1 科、只能是 5 科之一）', async () => {
  const u = await newUser({ nickname: '選科' });
  const def = (await db.query(`select daily_subjects from public.profiles where id = $1`, [u])).rows[0].daily_subjects;
  assert.equal(def.length, 5);
  await as(u, () => db.query(`update public.profiles set daily_subjects = '{english,science}' where id = auth.uid()`));
  await expectError(as(u, () => db.query(`update public.profiles set daily_subjects = '{}' where id = auth.uid()`)), 'check');
  await expectError(as(u, () => db.query(`update public.profiles set daily_subjects = '{art}' where id = auth.uid()`)), 'check');
});

if (hasSeed) {
  await test('教科書版本：依版本回傳學期與章節；不分版本用三家多數安排；版本設定只能是三家之一', async () => {
    const u = await newUser({ nickname: '版本' });
    const rows = async (subj, v) => (await as(u, () => db.query(`select * from public.get_units($1, $2)`, [subj, v]))).rows;
    const plain = await rows('math', null);
    const fn = plain.find((x) => x.id === 'M-7B-4');
    assert.equal(fn.semester, '8B', '函數：三家都在八下，不分版本也放八下');
    assert.equal(fn.chapter, null);
    const kx = await rows('math', '康軒');
    assert.ok(kx.find((x) => x.id === 'M-8A-2').chapter, '選了版本就有章節');
    assert.equal(kx.filter((x) => /^M-[789]/.test(x.id)).length, 23);
    const n = await db.query(`select version, count(*)::int c from public.unit_versions group by version order by version`);
    assert.deepEqual(n.rows.map((r) => r.c), [71, 71, 71]);
    // 國文不分版本
    assert.ok((await rows('chinese', '康軒')).every((x) => x.chapter === null));
    await as(u, () => db.query(`update public.profiles set textbook_versions = '{"math":"翰林","english":"康軒"}' where id = auth.uid()`));
    await expectError(as(u, () => db.query(`update public.profiles set textbook_versions = '{"math":"亂填"}' where id = auth.uid()`)), 'check');
    await expectError(as(u, () => db.query(`update public.profiles set textbook_versions = '{"art":"康軒"}' where id = auth.uid()`)), 'check');
  });

  await test('每日出題：五科平均輪流、照版本學期、題數不足自動補滿；回傳是否做過', async () => {
    const u = await newUser({ nickname: '每日', terms_accepted: 'true', terms_version: '2026-10' });
    const pr = (await db.query(`select terms_accepted_at, terms_version from public.profiles where id = $1`, [u])).rows[0];
    assert.ok(pr.terms_accepted_at, '記錄條款同意時間');
    assert.equal(pr.terms_version, '2026-10');
    const daily = async (subj, sem, n = 5) =>
      (await as(u, () => db.query(`select * from public.daily_questions($1, $2, $3)`, [subj, sem, n]))).rows;
    const five = await daily(['math', 'chinese', 'english', 'science', 'social'], '7A');
    assert.equal(five.length, 5);
    assert.equal(new Set(five.map((q) => q.subject)).size, 5, '五科各一題');
    assert.ok(five.every((q) => q.seen === false));
    assert.ok(!five.some((q) => 'answer' in q), '不回傳答案');
    // 只選兩科：還是補滿 5 題
    const two = await daily(['english', 'social'], '7A');
    assert.equal(two.length, 5);
    assert.ok(two.every((q) => ['english', 'social'].includes(q.subject)));
    // 學期範圍：七上學生不會拿到函數（三家都在八下）
    const m = await daily(['math'], '7A', 50);
    assert.ok(m.every((q) => /-7A-/.test(q.unit_id)), m.map((q) => q.unit_id).join(','));
    // 做過的題目標記 seen，排在後面
    const ex = await as(u, () => db.query(`select * from public.practice_questions(array['EN-7A-1'], 50)`));
    const first = ex.rows[0];
    const ans = (await db.query(`select answer from public.questions where id = $1`, [first.id])).rows[0].answer;
    await answer(u, first.id, ans);
    const again = (await as(u, () => db.query(`select * from public.practice_questions(array['EN-7A-1'], 50)`))).rows;
    assert.equal(again.at(-1).id, first.id, '做過的排最後');
    assert.equal(again.at(-1).seen, true);
  });

  await test('社會科段考範圍：每題都有第幾次段考，依範圍出題並分段統計進度', async () => {
    const u = await newUser({ nickname: '社會段考' });
    const miss = (await db.query(`select count(*)::int n from public.questions where unit_id like 'SO-%' and exam_part is null`)).rows[0].n;
    assert.equal(miss, 0, '社會題都有段考範圍');
    const other = (await db.query(`select count(*)::int n from public.questions where unit_id not like 'SO-%' and exam_part is not null`)).rows[0].n;
    assert.equal(other, 0, '其他科不分段');
    const parts = (await as(u, () => db.query(`select * from public.get_unit_parts('social')`))).rows;
    assert.equal(parts.length, 54, '18 單元 × 3 次段考');
    assert.ok(parts.every((r) => r.total >= 5), parts.filter((r) => r.total < 5).map((r) => r.unit_id + '#' + r.part).join(','));
    const ids = ['SO-7A-1', 'SO-7A-2', 'SO-7A-3'];
    const qs = (await as(u, () => db.query(`select * from public.practice_questions($1, 60, null, 2::smallint)`, [ids]))).rows;
    const want = parts.filter((r) => ids.includes(r.unit_id) && r.part === 2).reduce((a, r) => a + r.total, 0);
    assert.equal(qs.length, want, '只出第二次段考範圍');
    assert.deepEqual([...new Set(qs.map((q) => q.unit_id))].sort(), ids, '地理、歷史、公民都有');
    const q = qs[0];
    await answer(u, q.id, (await db.query(`select answer from public.questions where id = $1`, [q.id])).rows[0].answer);
    const after = (await as(u, () => db.query(`select * from public.get_unit_parts('social')`))).rows
      .find((r) => r.unit_id === q.unit_id && r.part === 2);
    assert.deepEqual([after.mastered, after.attempted, after.answered, after.correct], [1, 1, 1, 1]);
    const all = (await as(u, () => db.query(`select * from public.practice_questions($1, 60)`, [['SO-7A-1']]))).rows;
    assert.equal(all.length, 30, '不指定範圍就整個單元');
  });

  await test('段考複習：難度篩選、單元答對率、作答後才看得到完整詳解', async () => {
    const u = await newUser({ nickname: '難度' });
    for (const d of [1, 2, 3]) {
      const qs = (await as(u, () => db.query(`select * from public.practice_questions(array['M-8A-1'], 60, $1::smallint)`, [d]))).rows;
      assert.ok(qs.length > 0, `難度 ${d} 有題目`);
      assert.ok(qs.every((q) => q.difficulty === d), `只出難度 ${d}`);
    }
    const mixed = (await as(u, () => db.query(`select * from public.practice_questions(array['M-8A-1'], 60)`))).rows;
    assert.ok(new Set(mixed.map((q) => q.difficulty)).size > 1, '不指定難度就混合');
    const q = mixed[0];
    await expectError(as(u, () => db.query(`select public.question_solution($1)`, [q.id])), 'not_answered');
    const ans = (await db.query(`select answer from public.questions where id = $1`, [q.id])).rows[0].answer;
    const wrong = ['A', 'B', 'C', 'D'].find((k) => k !== ans);
    await answer(u, q.id, wrong);
    await answer(u, mixed[1].id, (await db.query(`select answer from public.questions where id = $1`, [mixed[1].id])).rows[0].answer);
    const sol = (await as(u, () => db.query(`select public.question_solution($1) s`, [q.id]))).rows[0].s;
    assert.equal(sol.answer, ans);
    assert.ok(sol.explanation.length > 0 && sol.hints.length > 0, '有解析與步驟');
    const unit = (await as(u, () => db.query(`select * from public.get_units('math', '康軒')`))).rows.find((r) => r.id === 'M-8A-1');
    assert.equal(unit.answered, 2);
    assert.equal(unit.correct, 1);
  });

  await test('年級確認：改年級（即使數字一樣）會更新確認時間；學生不能直接改確認時間', async () => {
    const u = await newUser({ nickname: '升級' });
    await as(u, () => db.query(`update public.profiles set grade = 7 where id = auth.uid()`));
    const t1 = (await db.query(`select grade_confirmed_at from public.profiles where id = $1`, [u])).rows[0].grade_confirmed_at;
    assert.ok(t1);
    await new Promise((r) => setTimeout(r, 20));
    await as(u, () => db.query(`update public.profiles set grade = 7 where id = auth.uid()`));
    const t2 = (await db.query(`select grade_confirmed_at from public.profiles where id = $1`, [u])).rows[0].grade_confirmed_at;
    assert.ok(t2 > t1);
    await expectError(as(u, () => db.query(`update public.profiles set grade_confirmed_at = now() where id = auth.uid()`)), 'permission denied');
    const lim = (await as(u, () => db.query(`select public.get_limits() l`))).rows[0].l;
    assert.equal(lim.free_daily_questions, 30);
  });

  await test('模擬考成績：伺服器依實際作答計分、重複送出不重複記錄、只看得到自己的；家長須綁定；聽力題帶原文', async () => {
    const kid = await newUser({ nickname: '模考' });
    const other = await newUser({ nickname: '別人' });
    const mom = await newUser({ nickname: '模考媽', role: 'parent' });
    const qs = (await as(kid, () => db.query(`select * from public.practice_questions(array['M-9B-2'], 10)`))).rows;
    assert.equal(qs.length, 10);
    // 答對 6 題、答錯 2 題、2 題沒作答
    for (let i = 0; i < 8; i++) {
      const ans = (await db.query(`select answer from public.questions where id = $1`, [qs[i].id])).rows[0].answer;
      const choice = i < 6 ? ans : 'ABCD'.split('').find((k) => k !== ans);
      await as(kid, () => db.query(`select public.submit_answer($1, $2, 'exam', null)`, [qs[i].id, choice]));
    }
    const ids = qs.map((q) => q.id);
    const r = (await as(kid, () => db.query(`select public.save_mock_exam('math', false, $1, 600) r`, [ids]))).rows[0].r;
    assert.equal(r.score, 60);
    assert.equal(r.correct, 6);
    assert.equal(r.previous_score, null);
    const again = (await as(kid, () => db.query(`select public.save_mock_exam('math', false, $1, 600) r`, [ids]))).rows[0].r;
    assert.equal(again.duplicate, true, '1 分鐘內重複送出回傳同一筆');
    const mine = (await as(kid, () => db.query(`select * from public.my_mock_exams('math', 10)`))).rows;
    assert.equal(mine.length, 1);
    assert.equal(mine[0].unanswered, 2);
    assert.ok(mine[0].by_unit.length >= 1 && mine[0].by_unit[0].n === 10);
    assert.equal((await as(other, () => db.query(`select * from public.my_mock_exams(null, 10)`))).rows.length, 0);
    assert.equal((await as(other, () => db.query(`select * from public.mock_exams`))).rows.length, 0, 'RLS：看不到別人的');
    await expectError(as(kid, () => db.query(`insert into public.mock_exams (user_id, subject, full_length, total, correct, unanswered, score) values (auth.uid(), 'math', true, 10, 10, 0, 100)`)), 'permission denied');
    await expectError(as(kid, () => db.query(`select public.save_mock_exam('art', false, $1, 1)`, [ids])), 'bad_subject');
    // 家長：綁定前看不到、綁定後看得到
    await expectError(as(mom, () => db.query(`select * from public.child_mock_exams($1, 10)`, [kid])), 'not_linked');
    const code = (await db.query(`select invite_code from public.profiles where id = $1`, [kid])).rows[0].invite_code;
    await as(mom, () => db.query(`select public.link_child($1)`, [code]));
    assert.equal((await as(mom, () => db.query(`select * from public.child_mock_exams($1, 10)`, [kid]))).rows[0].score, 60);
    // 聽力題：公開資料有原文、沒有答案
    const lq = (await as(kid, () => db.query(`select * from public.practice_questions(array['EN-7L-1'], 3)`))).rows;
    assert.equal(lq.length, 3);
    assert.ok(lq.every((q) => /^(M|W|N):/m.test(q.listen_script)), '聽力題有原文');
    assert.ok(!('answer' in lq[0]));
  });

  await test('正式題庫：國中五科、國小國語數學都有單元與題目；國中每單元 30 題、國小每單元 15 題；國中非聽力單元至少 8 題困難題', async () => {
    const r = await db.query(`
      select u.subject, left(u.semester, 1) in ('5', '6') as elem, count(distinct u.id)::int units, count(q.id)::int qs, min(c.n)::int min_per_unit
      from public.units u left join public.questions q on q.unit_id = u.id
      join lateral (select count(*) n from public.questions q2 where q2.unit_id = u.id) c on true
      where u.id not like 'T-%' group by 1, 2 order by 1, 2`);
    const jr = Object.fromEntries(r.rows.filter((x) => !x.elem).map((x) => [x.subject, x]));
    const el = Object.fromEntries(r.rows.filter((x) => x.elem).map((x) => [x.subject, x]));
    assert.deepEqual(Object.keys(jr).sort(), ['chinese', 'english', 'math', 'science', 'social']);
    assert.deepEqual(Object.keys(el).sort(), ['chinese', 'math'], '國小只有國語、數學');
    for (const x of Object.values(jr)) assert.equal(x.min_per_unit, 30, x.subject + ' 每單元 30 題');
    const hard = (await db.query(`select u.id, count(q.id) filter (where q.difficulty = 3)::int n from public.units u
      join public.questions q on q.unit_id = u.id where u.id !~ '-[56][AB]-' and u.id !~ '-[789]L-' and u.id not like 'T-%' group by u.id`)).rows;
    assert.ok(hard.length >= 83 && hard.every((r) => r.n >= 8), hard.filter((r) => r.n < 8).map((r) => r.id + ':' + r.n).join(','));
    assert.equal(el.math.units, 16); assert.equal(el.chinese.units, 12);
    for (const x of Object.values(el)) assert.equal(x.min_per_unit, 15, '國小每單元 15 題');
    const d = (await db.query(`select difficulty, count(*)::int n from public.questions where unit_id ~ '^(M|CH)-[56]' group by 1 order by 1`)).rows;
    assert.deepEqual(d.map((x) => x.difficulty), [1, 2, 3], '國小簡單、中等、困難都有');
  });

  await test('國小生：可以選五、六年級；每日練習只出國小題，國中生不會拿到國小題', async () => {
    const kid = await newUser({ nickname: '五年級' });
    await as(kid, () => db.query(`update public.profiles set grade = 5 where id = auth.uid()`));
    await expectError(as(kid, () => db.query(`update public.profiles set grade = 4 where id = auth.uid()`)), 'profiles_grade_check');
    const qs = (await as(kid, () => db.query(`select * from public.daily_questions(array['math','chinese','english'], '5A', 20)`))).rows;
    assert.ok(qs.length >= 5);
    assert.ok(qs.every((q) => /^(M|CH)-5A-/.test(q.unit_id)), qs.map((q) => q.unit_id).join(','));
    const jr = await newUser({ nickname: '七年級' });
    await as(jr, () => db.query(`update public.profiles set grade = 7 where id = auth.uid()`));
    const jq = (await as(jr, () => db.query(`select * from public.daily_questions(array['math','chinese'], null, 50)`))).rows;
    assert.ok(jq.length > 0 && jq.every((q) => !/-[56][AB]-/.test(q.unit_id)), '國中生不會拿到國小題');
  });

  await test('正式題庫：每題答案都在選項內、都有解析與提示', async () => {
    const r = await db.query(`
      select id from public.questions q
      where source <> 'test' and unit_id not like 'T-%' and (
        not exists (select 1 from jsonb_array_elements(q.options) o where o->>'key' = q.answer)
        or length(explanation) < 10 or jsonb_array_length(hints) < 2)`);
    assert.equal(r.rows.length, 0, '有問題的題目：' + r.rows.map((x) => x.id).join(','));
  });
}

console.log(`\n${passed} 項通過${process.exitCode ? '，有失敗項目' : ''}`);
