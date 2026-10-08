// 整合測試（API 層）：用 App 同一套 supabase-js 客戶端，對真實 PostgreSQL 與真實 Edge Functions 操作
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import pg from 'pg';
import { API, PUBLISHABLE_KEY, WEBHOOK_AUTH, claudeLog, rcState, startStack, stopStack } from './stack.mjs';

const require = createRequire(new URL('../../app/package.json', import.meta.url));
const { createClient } = require('@supabase/supabase-js');
const db = new pg.Pool({ connectionString: process.env.DATABASE_URL ?? 'postgres://postgres@127.0.0.1:55432/capapp' });

let passed = 0;
const test = async (name, fn) => {
  try { await fn(); passed++; console.log('  ✓ ' + name); }
  catch (e) { console.error('  ✗ ' + name + '\n    ' + (e.stack ?? e.message).split('\n').slice(0, 3).join('\n    ')); process.exitCode = 1; }
};
const client = () => createClient(API, PUBLISHABLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const stamp = Date.now();

await startStack();
console.log('整合測試（真實 PostgreSQL＋Edge Functions）');

const stu = client();
let stuId;
await test('學生註冊：自動建立 profile（暱稱、家長同意、2 張保護卡）', async () => {
  const { data, error } = await stu.auth.signUp({ email: `stu${stamp}@test.tw`, password: 'password123',
    options: { data: { nickname: '小安', role: 'student', parent_consent: 'true' } } });
  assert.ifError(error);
  stuId = data.user.id;
  const { data: p, error: e2 } = await stu.from('profiles').select('id, role, nickname, grade, freeze_cards, invite_code').eq('id', stuId).single();
  assert.ifError(e2);
  assert.equal(p.nickname, '小安');
  assert.equal(p.freeze_cards, 2);
  assert.equal(p.grade, null);
});

await test('首次設定：更新年級與小老師；不能改 XP', async () => {
  const { error } = await stu.from('profiles').update({ grade: 8, tutor_persona: 'funny' }).eq('id', stuId);
  assert.ifError(error);
  const { error: bad } = await stu.from('profiles').update({ xp: 9999 }).eq('id', stuId);
  assert.ok(bad, '改 XP 應該被擋');
  assert.match(bad.message, /permission denied/);
});

await test('題庫：學生看得到題目但看不到答案', async () => {
  const { data: units } = await stu.rpc('get_units', { p_subject: 'math' });
  assert.equal(units.filter((u) => !/^[56]/.test(u.semester)).length, 23, '國中數學 23 單元');
  assert.equal(units.filter((u) => /^[56]/.test(u.semester)).length, 16, '國小數學 16 單元');
  const { data: qs } = await stu.rpc('next_questions', { p_unit_ids: ['M-8A-2'], p_limit: 5 });
  assert.equal(qs.length, 5);
  assert.ok(!('answer' in qs[0]));
  const { error } = await stu.from('questions').select('answer').limit(1);
  assert.ok(error, 'questions 表應該讀不到');
});

let wrongQ;
await test('作答 5 題（第 1 題故意答錯）：錯題收錄、XP、連勝 1 天', async () => {
  const { data: qs } = await stu.rpc('next_questions', { p_unit_ids: ['M-8A-2'], p_limit: 5 });
  const ans = new Map((await db.query(`select id, answer from questions where id = any($1)`, [qs.map((q) => q.id)])).rows.map((r) => [r.id, r.answer]));
  let last;
  for (const [i, q] of qs.entries()) {
    const choice = i === 0 ? 'ABCD'.split('').find((k) => k !== ans.get(q.id)) : ans.get(q.id);
    const { data, error } = await stu.rpc('submit_answer', { p_question_id: q.id, p_choice: choice, p_context: 'practice', p_for_mistake: null });
    assert.ifError(error);
    if (i === 0) { assert.equal(data.correct, false); assert.ok(data.wrong_reason); wrongQ = q; }
    last = data;
  }
  assert.equal(last.today_answered, 5);
  assert.equal(last.streak, 1);
  assert.equal(last.streak_up, true);
  const { data: home } = await stu.rpc('get_home');
  assert.equal(home.xp, 40);
  assert.equal(home.pending_mistakes, 1);
});

let sessionId;
await test('小老師：還沒同意 AI 資料使用前會被擋（不呼叫 AI、不扣次數）', async () => {
  const before = claudeLog.length;
  const { error } = await stu.functions.invoke('tutor', { body: { action: 'start', question_id: wrongQ.id, student_choice: 'A' } });
  assert.ok(error);
  assert.equal((await error.context.json()).error, 'ai_consent_required');
  assert.equal(claudeLog.length, before);
  const { error: e2 } = await stu.rpc('give_ai_consent');
  assert.ifError(e2);
});

await test('錯題小老師（真實 Edge Function）：開始、回覆、提示、錯誤原因寫入', async () => {
  let { data, error } = await stu.functions.invoke('tutor', { body: { action: 'start', question_id: wrongQ.id, student_choice: 'A' } });
  assert.ifError(error);
  assert.match(data.reply, /差一點點/);
  sessionId = data.session_id;
  const sys = claudeLog.at(-1).system;
  assert.match(sys, /幽默的學長/, '使用學生選的小老師角色');
  assert.match(sys, /絕對不可以說出最終答案/);
  assert.ok(sys.includes(wrongQ.stem), '提示詞包含題目');
  assert.equal(claudeLog.at(-1).key, 'sk-ant-test');
  ({ data, error } = await stu.functions.invoke('tutor', { body: { action: 'reply', question_id: wrongQ.id, session_id: sessionId, message: '算到一半卡住' } }));
  assert.ifError(error);
  ({ data, error } = await stu.functions.invoke('tutor', { body: { action: 'hint', question_id: wrongQ.id, session_id: sessionId } }));
  assert.ifError(error);
  assert.equal(data.hint_level, 1);
  const m = await db.query(`select error_type from mistakes where user_id = $1 and question_id = $2`, [stuId, wrongQ.id]);
  assert.equal(m.rows[0].error_type, 'calculation');
});

await test('小老師防洩漏：模型在第 1 層就說出答案時，伺服器改寫回覆', async () => {
  const { data } = await stu.functions.invoke('tutor', { body: { action: 'reply', question_id: wrongQ.id, session_id: sessionId, message: '告訴我答案' } });
  assert.ok(!/答案是 C/.test(data.reply), '不應該把答案傳給學生：' + data.reply);
  assert.match(data.reply, /先別急著看答案/);
});

await test('小老師：同一題今天再打開會接續原本的對話，不另外扣次數', async () => {
  const before = (await db.query(`select count from tutor_usage where user_id = $1`, [stuId])).rows[0].count;
  const calls = claudeLog.length;
  const { data, error } = await stu.functions.invoke('tutor', { body: { action: 'start', question_id: wrongQ.id } });
  assert.ifError(error);
  assert.equal(data.resumed, true);
  assert.equal(data.session_id, sessionId);
  assert.ok(data.history.some((m) => m.from === 'me' && m.text === '算到一半卡住'), '顯示學生說過的話');
  assert.ok(data.history.some((m) => m.from === 'me' && m.text === '給我一個提示'), '系統訊息換成按鈕文字');
  assert.ok(!data.history.some((m) => m.text.startsWith('（系統')), '不顯示系統指令');
  assert.equal(claudeLog.length, calls, '不呼叫 AI');
  assert.equal((await db.query(`select count from tutor_usage where user_id = $1`, [stuId])).rows[0].count, before);
});

await test('小老師安全機制：偵測到情緒危機字詞，停止講解並給求助專線（不呼叫 AI）', async () => {
  const before = claudeLog.length;
  const { data } = await stu.functions.invoke('tutor', { body: { action: 'reply', question_id: wrongQ.id, session_id: sessionId, message: '我好想死' } });
  assert.equal(data.safety, true);
  assert.match(data.reply, /1925/);
  assert.equal(claudeLog.length, before);
});

await test('相似題驗收答對 → 錯題變「學習中」', async () => {
  const { data: sim } = await stu.rpc('similar_question', { p_question_id: wrongQ.id });
  assert.equal(sim.length, 1);
  const a = (await db.query(`select answer from questions where id = $1`, [sim[0].id])).rows[0].answer;
  const { data } = await stu.rpc('submit_answer', { p_question_id: sim[0].id, p_choice: a, p_context: 'tutor_check', p_for_mistake: wrongQ.id });
  assert.equal(data.mistake_status, 'learning');
});

const otherQs = (await db.query(`select id from questions where id <> $1 and active order by id limit 30`, [wrongQ.id])).rows.map((r) => r.id);

await test('小老師每日次數：免費 3 次用完被擋；看廣告換 1 次後可再開始', async () => {
  for (let i = 0; i < 2; i++) {
    const { error } = await stu.functions.invoke('tutor', { body: { action: 'start', question_id: otherQs[i] } });
    assert.ifError(error);
  }
  const { error } = await stu.functions.invoke('tutor', { body: { action: 'start', question_id: otherQs[2] } });
  assert.ok(error, '第 4 次應該被擋');
  const code = (await error.context.json()).error;
  assert.equal(code, 'daily_tutor_limit');
  const { error: e2 } = await stu.rpc('grant_ad_bonus');
  assert.ifError(e2);
  const { error: e3 } = await stu.functions.invoke('tutor', { body: { action: 'start', question_id: otherQs[3] } });
  assert.ifError(e3);
});

await test('小老師防並發：同時送 20 個「開始」只會成功 3 次；同一段對話同時送出不會互相覆蓋', async () => {
  const email = `race-${Date.now()}@test.tw`;
  const r = client();
  await r.auth.signUp({ email, password: 'Race12345', options: { data: { nickname: '並發' } } });
  await r.rpc('give_ai_consent');
  const results = await Promise.all(Array.from({ length: 20 }, (_, i) =>
    r.functions.invoke('tutor', { body: { action: 'start', question_id: otherQs[i] } })));
  const ok = results.filter((x) => !x.error).length;
  assert.equal(ok, 3, `應該只成功 3 次，實際 ${ok} 次`);
  // 同一段對話同時送 10 則回覆：只會存進去 1 則，其餘回 busy_retry，不會超過每日則數
  const okIdx = results.findIndex((x) => !x.error);
  const sid = results[okIdx].data.session_id, sidQ = otherQs[okIdx];
  const replies = await Promise.all(Array.from({ length: 10 }, (_, i) =>
    r.functions.invoke('tutor', { body: { action: 'reply', question_id: sidQ, session_id: sid, message: '想一下' + i } })));
  const saved = replies.filter((x) => !x.error).length;
  assert.ok(saved >= 1, '至少要有一則成功');
  const uid = (await r.auth.getUser()).data.user.id;
  const usage = (await db.query(`select count, calls from tutor_usage where user_id = $1`, [uid])).rows[0];
  assert.equal(usage.count, 3);
  assert.ok(usage.calls <= 3 + 10);
  const sess = (await db.query(`select jsonb_array_length(messages) n from tutor_sessions where id = $1`, [sid])).rows[0].n;
  assert.equal(sess, 2 + saved * 2, '對話紀錄沒有被互相覆蓋');
});

await test('前三名：上傳證明到自己的資料夾、不能上傳到別人資料夾、送出申請', async () => {
  const path = `${stuId}/proof.jpg`;
  const up = await stu.storage.from('proofs').upload(path, Buffer.from('fake-jpeg'), { contentType: 'image/jpeg' });
  assert.ifError(up.error);
  const bad = await stu.storage.from('proofs').upload(`someone-else/x.jpg`, Buffer.from('x'), { contentType: 'image/jpeg' });
  assert.ok(bad.error, '上傳到別人資料夾應該失敗');
  const { error } = await stu.rpc('apply_top_three', { p_school: '測試國中', p_grade: 8, p_exam: '第一次段考', p_rank: 1, p_proof_path: path, p_parent_consent: true });
  assert.ifError(error);
});

const adm = client();
await test('管理員：審核通過 → 完整版開通；照片可讀、可刪', async () => {
  const { data } = await adm.auth.signUp({ email: `admin${stamp}@test.tw`, password: 'password123' });
  await db.query(`insert into admins (user_id) values ($1)`, [data.user.id]);
  const { data: isAdmin } = await adm.rpc('is_admin');
  assert.equal(isAdmin, true);
  const { data: apps } = await adm.rpc('admin_pending_applications');
  const app = apps.find((a) => a.user_id === stuId);
  assert.ok(app);
  const signed = await adm.storage.from('proofs').createSignedUrl(app.proof_path, 60);
  assert.ifError(signed.error);
  const img = await fetch(signed.data.signedUrl);
  assert.equal(await img.text(), 'fake-jpeg');
  const { data: p, error } = await adm.rpc('admin_review_top_three', { p_id: app.id, p_approve: true, p_note: '恭喜' });
  assert.ifError(error);
  const rm = await adm.storage.from('proofs').remove([p]);
  assert.ifError(rm.error);
  const { data: home } = await stu.rpc('get_home');
  assert.equal(home.premium, true);
  const { data: s } = await adm.rpc('admin_stats');
  assert.ok(s.students >= 1);
  const { error: notAdmin } = await stu.rpc('admin_stats');
  assert.match(notAdmin.message, /not_admin/);
});

const par = client();
await test('家長：用邀請碼綁定、看到孩子 7 天摘要', async () => {
  await par.auth.signUp({ email: `parent${stamp}@test.tw`, password: 'password123', options: { data: { nickname: '媽媽', role: 'parent' } } });
  const code = (await db.query(`select invite_code from profiles where id = $1`, [stuId])).rows[0].invite_code;
  const { data, error } = await par.rpc('link_child', { p_code: code.toLowerCase() });
  assert.ifError(error);
  assert.equal(data.nickname, '小安');
  const { data: kids } = await par.from('parent_links').select('student_id');
  assert.equal(kids[0].student_id, stuId);
  const { data: sum, error: e2 } = await par.rpc('get_child_summary', { p_student: stuId });
  assert.ifError(e2);
  assert.equal(sum.days.length, 7);
  assert.equal(sum.days.at(-1).answered, 6);
  assert.ok(sum.by_subject[0].answered >= 6);
});

await test('家長：在「我的」看到已綁定的孩子，可以自己解除綁定後再重新綁定', async () => {
  const { data: list, error } = await par.rpc('my_children');
  assert.ifError(error);
  assert.deepEqual(list.map((k) => k.nickname), ['小安']);
  const { error: e2 } = await par.rpc('unlink_child', { p_student: stuId });
  assert.ifError(e2);
  const { error: e3 } = await par.rpc('get_child_summary', { p_student: stuId });
  assert.ok(e3, '解除後看不到孩子的資料');
  const { error: anonErr } = await client().rpc('unlink_child', { p_student: stuId });
  assert.ok(anonErr, '未登入不能呼叫');
  const code = (await db.query(`select invite_code from profiles where id = $1`, [stuId])).rows[0].invite_code;
  assert.ifError((await par.rpc('link_child', { p_code: code })).error);
});

const sub = client();
let subId;
await test('訂閱：購買後同步（真實 Edge Function 查 RevenueCat）→ 完整版；webhook 到期 → 恢復免費', async () => {
  const { data } = await sub.auth.signUp({ email: `sub${stamp}@test.tw`, password: 'password123', options: { data: { role: 'student' } } });
  subId = data.user.id;
  rcState.set(subId, { expires_date: new Date(Date.now() + 30 * 86400e3).toISOString(), product_identifier: 'premium_monthly' });
  const { data: r, error } = await sub.functions.invoke('sync-subscription', { body: {} });
  assert.ifError(error);
  assert.ok(r.subscription_until);
  assert.equal((await sub.rpc('get_home')).data.premium, true);

  rcState.set(subId, { expires_date: new Date(Date.now() - 86400e3).toISOString() });
  const bad = await fetch(`${API}/functions/v1/revenuecat-webhook`, { method: 'POST', headers: { Authorization: 'Bearer wrong', 'content-type': 'application/json' },
    body: JSON.stringify({ event: { type: 'EXPIRATION', app_user_id: subId } }) });
  assert.equal(bad.status, 401);
  const ok = await fetch(`${API}/functions/v1/revenuecat-webhook`, { method: 'POST', headers: { Authorization: WEBHOOK_AUTH, 'content-type': 'application/json' },
    body: JSON.stringify({ api_version: '1.0', event: { type: 'EXPIRATION', app_user_id: '$RCAnonymousID:x', aliases: [subId] } }) });
  assert.equal(ok.status, 200);
  assert.equal((await sub.rpc('get_home')).data.premium, false);
});

await test('忘記密碼：寄驗證碼 → 驗證 → 設新密碼 → 新密碼可登入、舊密碼不行', async () => {
  const email = `sub${stamp}@test.tw`;
  const c = client();
  assert.ifError((await c.auth.resetPasswordForEmail(email)).error);
  const otp = await (await fetch(`${API}/__test/otp?email=${encodeURIComponent(email)}`)).json();
  assert.ifError((await c.auth.verifyOtp({ email, token: otp.code, type: 'recovery' })).error);
  assert.ifError((await c.auth.updateUser({ password: 'newpassword456' })).error);
  const c2 = client();
  assert.ok((await c2.auth.signInWithPassword({ email, password: 'password123' })).error);
  assert.ifError((await c2.auth.signInWithPassword({ email, password: 'newpassword456' })).error);
});

await test('刪除帳號（真實 Edge Function）：帳號、紀錄、證明照片一併刪除', async () => {
  const path = `${subId}/p.jpg`;
  assert.ifError((await sub.storage.from('proofs').upload(path, Buffer.from('x'), { contentType: 'image/jpeg' })).error);
  const { error } = await sub.functions.invoke('delete-account', { body: {} });
  assert.ifError(error);
  const left = await db.query(`select (select count(*) from auth.users where id = $1) u, (select count(*) from profiles where id = $1) p,
                                      (select count(*) from storage.objects where name = $2) o`, [subId, path]);
  assert.deepEqual(Object.values(left.rows[0]).map(Number), [0, 0, 0]);
});

await stopStack();
await db.end();
console.log(`\n${passed} 項通過${process.exitCode ? '，有失敗項目' : ''}`);
process.exit(process.exitCode ?? 0);
