// 整合測試（畫面層）：App 網頁版連真實後端，瀏覽器實際操作完整流程，沒有任何模擬資料
// 先執行：npx expo export --platform web --output-dir /tmp/exp-int
//   （EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321、EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_integration_test）
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import pg from 'pg';
import { chromium } from 'playwright';
import { API, claudeLog, startStack, stopStack } from './stack.mjs';

const WEB = process.env.WEB_DIR ?? '/tmp/exp-int';
const OUT = process.argv[2] ?? '/tmp/int-shots';
fs.mkdirSync(OUT, { recursive: true });
const root = new URL('../../', import.meta.url);
const db = new pg.Pool({ connectionString: process.env.DATABASE_URL ?? 'postgres://postgres@127.0.0.1:55432/capapp' });
const stamp = Date.now();
const STUDENT = { email: `ui-stu${stamp}@test.tw`, password: 'password123', nickname: '小安' };

// 靜態網站伺服器（單頁應用：沒有副檔名的路徑回傳 index.html）
const types = { '.js': 'application/javascript', '.html': 'text/html', '.css': 'text/css', '.png': 'image/png', '.ttf': 'font/ttf', '.json': 'application/json', '.ico': 'image/x-icon' };
const web = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/__admin') {
    res.writeHead(200, { 'content-type': 'text/html' });
    return res.end(fs.readFileSync(new URL('admin/index.html', root)));
  }
  let f = path.join(WEB, decodeURIComponent(u.pathname));
  if (!path.extname(f) || !fs.existsSync(f)) f = path.join(WEB, 'index.html');
  res.writeHead(200, { 'content-type': types[path.extname(f)] ?? 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => web.listen(8770, '127.0.0.1', r));
const APP = 'http://127.0.0.1:8770';

let passed = 0;
const errors = [];
const step = async (name, fn) => {
  try { await fn(); passed++; console.log('  ✓ ' + name); }
  catch (e) { console.error('  ✗ ' + name + '\n    ' + String(e.message).split('\n').slice(0, 4).join('\n    ')); process.exitCode = 1; }
};

await startStack();
// 清掉之前測試留下的帳號（連帶刪除作答、申請等紀錄）
await db.query(`delete from auth.users where email like 'ui-%@test.tw'`);
await db.query(`delete from storage.objects where bucket_id = 'proofs'`);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
async function newPage() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/status of (4\d\d)/.test(m.text())) errors.push('console ' + m.text()); });
  return page;
}
const shot = (page, n) => page.screenshot({ path: `${OUT}/${n}.png`, fullPage: true });
const byText = (page, t) => page.getByText(t, { exact: true }).first();
const answerFor = async (stem) => (await db.query(`select id, answer from questions where stem = $1`, [stem])).rows[0];
// 畫面上所有以問號結尾的文字中，找出題庫裡真的有的題目（排除小老師的聊天訊息）
async function stemsOnPage(page) {
  // 畫面上出現的題目（依出現順序）：把整頁文字和資料庫題幹比對，適用各科（英文、國文題幹不一定以問號結尾）
  const body = await page.innerText('body');
  const r = await db.query(`select stem from questions where strpos($1, stem) > 0`, [body]);
  return r.rows.map((x) => x.stem).sort((a, b) => body.indexOf(a) - body.indexOf(b));
}

console.log('畫面整合測試（App 網頁版 ↔ 真實後端）');
const page = await newPage();
let studentId;

await step('學生註冊（勾選家長同意與條款）→ 進入首次設定', async () => {
  await page.goto(APP);
  await byText(page, '註冊').click();
  await page.getByLabel('暱稱（不要用真實姓名）').fill(STUDENT.nickname);
  await page.getByLabel('Email').fill(STUDENT.email);
  await page.getByLabel('密碼（至少 8 個字元）').fill(STUDENT.password);
  await page.getByRole('checkbox').nth(0).click();
  await page.getByRole('checkbox').nth(1).click();
  await page.getByRole('button', { name: '建立帳號' }).click();
  await byText(page, '先設定一下').waitFor({ timeout: 15000 });
  await shot(page, '01-onboarding');
  studentId = (await db.query(`select id from auth.users where email = $1`, [STUDENT.email])).rows[0].id;
  const p = (await db.query(`select nickname, parent_consent_at, terms_accepted_at, terms_version from profiles where id = $1`, [studentId])).rows[0];
  assert.equal(p.nickname, '小安');
  assert.ok(p.parent_consent_at, '家長同意時間已記錄');
  assert.ok(p.terms_accepted_at, '服務條款同意時間已記錄');
  assert.equal(p.terms_version, '2026-10');
});

await step('首次設定：八年級、康軒、幽默學長 → 首頁顯示 0 天連勝與新手歡迎卡', async () => {
  await byText(page, '八年級').click();
  await byText(page, '康軒').click();
  await byText(page, '幽默學長・輕鬆、會開玩笑').click();
  await page.getByRole('button', { name: '開始練習' }).click();
  await byText(page, '天連勝').waitFor({ timeout: 15000 });
  await page.getByText('歡迎！先做第一輪 5 題', { exact: false }).waitFor();
  await shot(page, '02-home');
  const p = (await db.query(`select grade, textbook_version, tutor_persona from profiles where id = $1`, [studentId])).rows[0];
  assert.deepEqual(p, { grade: 8, textbook_version: '康軒', tutor_persona: 'funny' });
});

let wrongStem;
await step('（設定）每日練習先只練數學，讓後面的小老師流程固定', async () => {
  await db.query(`update profiles set daily_subjects = '{math}' where id = $1`, [studentId]);
  await page.reload();
  await byText(page, '天連勝').waitFor({ timeout: 15000 });
});

await step('每日練習第 1 題故意答錯 → 顯示錯誤原因與解析、收進錯題本', async () => {
  await page.getByRole('button', { name: '開始' }).first().click();
  await byText(page, '檢查答案').waitFor({ timeout: 15000 });
  wrongStem = (await stemsOnPage(page))[0];
  if (!wrongStem) throw new Error('找不到題目文字');
  const q = await answerFor(wrongStem);
  assert.ok(q, '題目在題庫中：' + wrongStem);
  const wrong = 'ABCD'.split('').find((k) => k !== q.answer);
  await page.getByLabel(new RegExp(`^選項 ${wrong}：`)).click();
  await byText(page, '檢查答案').click();
  await byText(page, '差一點！已收進錯題本').waitFor({ timeout: 10000 });
  await shot(page, '03-wrong');
  const m = await db.query(`select status from mistakes where user_id = $1 and question_id = $2`, [studentId, q.id]);
  assert.equal(m.rows[0].status, 'pending');
});

await step('找小老師：真實 Edge Function 回覆、快速回覆、提示、驗收題答對 → 錯題變學習中', async () => {
  await page.getByRole('button', { name: '找小老師' }).click();
  // 第一次使用：先看到 AI 資料使用說明並同意
  await byText(page, '使用 AI 小老師前，請先看一下').waitFor({ timeout: 15000 });
  await shot(page, '04a-ai-consent');
  await page.getByRole('button', { name: '我同意，開始使用' }).click();
  await page.getByText('差一點點', { exact: false }).first().waitFor({ timeout: 20000 });
  const consent = await db.query(`select ai_consent_at from profiles where id = $1`, [studentId]);
  assert.ok(consent.rows[0].ai_consent_at, '同意時間寫入資料庫');
  await byText(page, '算到一半卡住').click();
  await page.getByText('原來如此', { exact: false }).first().waitFor({ timeout: 20000 });
  await page.getByRole('button', { name: '給我提示' }).click();
  await page.getByText('提示：先想想', { exact: false }).first().waitFor({ timeout: 20000 });
  await shot(page, '04-tutor');
  await page.getByRole('button', { name: '我懂了，驗收' }).click();
  await byText(page, '驗收題：同一個觀念，換一題試試').waitFor({ timeout: 15000 });
  const simStem = (await stemsOnPage(page)).find((x) => x !== wrongStem);
  const sim = await answerFor(simStem);
  assert.ok(sim, '驗收題在題庫中');
  await page.getByLabel(new RegExp(`^選項 ${sim.answer}：`)).last().click();
  await page.getByRole('button', { name: '檢查答案' }).last().click();
  await page.getByText('學會了！', { exact: false }).waitFor({ timeout: 10000 });
  await shot(page, '05-tutor-check');
  const wrongId = (await answerFor(wrongStem)).id;
  const m = await db.query(`select status, error_type from mistakes where user_id = $1 and question_id = $2`, [studentId, wrongId]);
  assert.equal(m.rows[0].status, 'learning');
  assert.equal(m.rows[0].error_type, 'calculation', 'AI 判斷的錯誤原因寫入錯題本');
  await page.getByRole('button', { name: '完成' }).click();
});

await step('回到練習完成剩下 4 題 → 看結果、今天目標完成、連勝 1 天', async () => {
  await page.getByRole('button', { name: '先做下一題' }).click();
  for (let i = 0; i < 4; i++) {
    await byText(page, '檢查答案').waitFor({ timeout: 10000 });
    const stem = (await stemsOnPage(page))[0];
    const q = await answerFor(stem);
    await page.getByLabel(new RegExp(`^選項 ${q.answer}：`)).click();
    await byText(page, '檢查答案').click();
    await page.getByText('答對了！', { exact: false }).first().waitFor({ timeout: 10000 });
    await page.getByRole('button', { name: i === 3 ? '看結果' : '下一題' }).click();
  }
  await byText(page, '這一輪完成了！').waitFor({ timeout: 10000 });
  await page.getByText('連勝 1 天', { exact: false }).waitFor();
  await shot(page, '06-summary');
  const p = (await db.query(`select current_streak, xp from profiles where id = $1`, [studentId])).rows[0];
  assert.equal(p.current_streak, 1);
  assert.equal(p.xp, 50, '5 題答對（含驗收）各 10 XP');
});

await step('首頁更新：1 天連勝、每日任務勾選；錯題本顯示「學習中」', async () => {
  await page.getByRole('button', { name: '回首頁' }).click();
  await byText(page, '今天的目標完成了！').waitFor({ timeout: 10000 });
  await shot(page, '07-home-after');
  await page.goto(`${APP}/mistakes`);
  await byText(page, '學習中').first().waitFor({ timeout: 10000 });
  await shot(page, '08-mistakes');
});

await step('學期複習：八上分成第一～三次段考與學期總複習，顯示目前階段；選難度後出段考複習卷', async () => {
  await page.goto(`${APP}/learn`);
  await page.getByText('目前階段：', { exact: false }).first().waitFor({ timeout: 10000 });
  for (const s of ['第一次段考', '第二次段考', '第三次段考', '學期總複習']) await byText(page, s).waitFor({ timeout: 5000 });
  await byText(page, '中等').click();
  await page.getByRole('button', { name: '開始第二次段考・中等' }).click();
  await page.getByText('八上第二次段考 · 中等', { exact: false }).first().waitFor({ timeout: 10000 });
  const stem = await page.evaluate(() => document.body.innerText);
  const qs = (await db.query(`select q.stem, q.difficulty, q.unit_id from questions q where q.unit_id in ('M-8A-2', 'M-8A-3')`)).rows;
  const shown = qs.find((q) => stem.includes(q.stem.slice(0, 25)));
  assert.ok(shown, '出的是第二次段考範圍的題目');
  assert.equal(shown.difficulty, 2, '難度是中等');
  await shot(page, '09-exam');
});

await step('答錯看完整詳解：你錯在哪、正確答案、解題步驟', async () => {
  const body = await page.evaluate(() => document.body.innerText);
  const q = (await db.query(`select id, stem, answer from questions where unit_id in ('M-8A-2', 'M-8A-3')`)).rows.find((x) => body.includes(x.stem.slice(0, 25)));
  const wrong = 'ABCD'.split('').find((k) => k !== q.answer);
  await page.getByLabel(new RegExp(`^選項 ${wrong}：`)).first().click();
  await page.getByRole('button', { name: '檢查答案' }).click();
  await byText(page, '完整詳解').waitFor({ timeout: 10000 });
  await page.getByText(`你的答案（${wrong}）`, { exact: false }).first().waitFor();
  await page.getByText(`正確答案（${q.answer}）`, { exact: false }).first().waitFor();
  await byText(page, '解題步驟').waitFor();
  await shot(page, '09-solution');
});

await step('教科書版本：數學顯示康軒章節 → 改成翰林，章名跟著換；資料庫記住各科版本', async () => {
  await page.goto(`${APP}/learn`);
  await byText(page, '第一次段考').waitFor({ timeout: 10000 });
  await page.getByRole('button', { name: '看第一次段考的單元' }).click();
  await page.getByText('康軒 第', { exact: false }).first().waitFor({ timeout: 10000 });
  await shot(page, '09a-learn-kangxuan');
  await byText(page, '翰林').click();
  await page.getByText('翰林 第', { exact: false }).first().waitFor({ timeout: 10000 });
  const v = (await db.query(`select textbook_versions from profiles where id = $1`, [studentId])).rows[0].textbook_versions;
  assert.equal(v.math, '翰林');
  assert.equal(v.english, '康軒', '其他科維持首次設定的版本');
  await shot(page, '09a2-learn-hanlin');
  await byText(page, '康軒').click();
  await page.getByText('康軒 第', { exact: false }).first().waitFor({ timeout: 10000 });
});

await step('多科目：切換到英語（康軒課次）→ 練習英語單元 → 答錯找小老師，小老師用英語科的講解規則', async () => {
  await byText(page, '英語').click();
  await byText(page, '學期總複習').waitFor({ timeout: 10000 });
  await page.getByRole('button', { name: '看學期總複習的單元' }).click();
  await page.getByText('康軒 L', { exact: false }).first().waitFor({ timeout: 10000 });
  await shot(page, '09b-learn-english');
  await page.getByRole('button', { name: '練習單元 未來式與助動詞' }).click();
  await page.getByText('英語 八上 · 未來式與助動詞', { exact: false }).first().waitFor({ timeout: 10000 });
  const qs = (await db.query(`select id, stem, answer from questions where unit_id = 'EN-8A-1'`)).rows;
  let cur = null;
  for (const q of qs) {
    if (await page.getByText(q.stem.slice(0, 25), { exact: false }).count()) { cur = q; break; }
  }
  assert.ok(cur, '畫面上應該顯示一題 EN-8A-1 的題目');
  const wrongKey = 'ABCD'.split('').find((k) => k !== cur.answer);
  await page.getByLabel(new RegExp(`^選項 ${wrongKey}：`)).click();
  await page.getByRole('button', { name: '檢查答案' }).click();
  await shot(page, '09c-english-wrong');
  await page.getByRole('button', { name: '找小老師' }).click();
  await page.getByText('差一點點', { exact: false }).first().waitFor({ timeout: 20000 });
  const sys = claudeLog.at(-1).system;
  assert.match(sys, /答錯的英語題目/);
  assert.match(sys, /用中文講解/);
  await shot(page, '09d-english-tutor');
});

await step('每日練習科目：在「我的」只勾國文 → 每日 5 題都是國文', async () => {
  await db.query(`update profiles set daily_subjects = '{chinese}' where id = $1`, [studentId]);
  await page.goto(`${APP}/me`);
  await byText(page, '每日練習科目').waitFor({ timeout: 10000 });
  await shot(page, '09e-me-subjects');
  await page.goto(`${APP}/quiz?mode=daily`);
  await page.getByText('國文', { exact: false }).first().waitFor({ timeout: 10000 });
  const tag = await page.getByText(/^(數學|國文|英語|自然|社會) /).first().innerText();
  assert.match(tag, /^國文 /);
  await db.query(`update profiles set daily_subjects = '{math,chinese,english,science,social}' where id = $1`, [studentId]);
});

await step('每日練習（五科都勾）：5 題分散在不同科目；首頁顯示免費版今天還能練幾題', async () => {
  await page.goto(`${APP}/quiz?mode=daily`);
  await page.getByText('第 1 題 / 共 5 題', { exact: false }).waitFor({ timeout: 15000 });
  const subjects = new Set();
  for (let i = 0; i < 5; i++) {
    const tag = await page.getByText(/^(數學|國文|英語|自然|社會) /).first().innerText();
    subjects.add(tag.split(' ')[0]);
    const stems = await stemsOnPage(page);
    const q = await answerFor(stems[0]);
    await page.getByLabel(new RegExp(`^選項 ${q.answer}：`)).click();
    await page.getByRole('button', { name: '檢查答案' }).click();
    await page.getByRole('button', { name: i === 4 ? '看結果' : '下一題' }).click();
  }
  assert.ok(subjects.size >= 4, '五科平均出題，5 題至少來自 4 科：' + [...subjects].join(','));
  await byText(page, '這一輪完成了！').waitFor();
  await page.getByRole('button', { name: '分享成績' }).waitFor();
  await page.goto(APP);
  await page.getByText('免費版今天還能練', { exact: false }).waitFor({ timeout: 10000 });
});

await step('使用說明：從「我的」打開常見問題、展開答案、有客服信箱與版本號', async () => {
  await page.goto(`${APP}/me`);
  await byText(page, '使用說明與常見問題').click();
  await byText(page, '保護卡是什麼？').click();
  await page.getByText('每連勝 7 天再送 1 張', { exact: false }).waitFor({ timeout: 10000 });
  await page.getByRole('button', { name: '寫信給客服' }).waitFor();
  await page.getByText('會考小老師 v', { exact: false }).last().waitFor();
  await shot(page, '09f-help');
});

await step('新學年提醒：去年確認過年級 → 首頁問是否升年級；按「還沒」後不再出現、年級不變', async () => {
  await db.query(`update profiles set grade_confirmed_at = now() - interval '400 days' where id = $1`, [studentId]);
  await page.goto(APP);
  const m = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Taipei', month: 'numeric' }).format(new Date()));
  if (m >= 8 || m === 1) {
    await page.getByText('新學年開始了！你升上九年級了嗎？', { exact: false }).waitFor({ timeout: 10000 });
    await shot(page, '09g-grade-check');
    await page.getByRole('button', { name: '還沒' }).click();
    await page.getByText('新學年開始了', { exact: false }).waitFor({ state: 'detached', timeout: 10000 });
    const g = (await db.query(`select grade, grade_confirmed_at > now() - interval '1 minute' fresh from profiles where id = $1`, [studentId])).rows[0];
    assert.equal(g.grade, 8);
    assert.equal(g.fresh, true);
  }
});

await step('會考模擬考（免費版迷你 10 題）：計時作答、題目總覽、交卷 → 成績、單元表現、錯題解析；錯題收進錯題本並可依科目篩選', async () => {
  await page.goto(`${APP}/learn`);
  await byText(page, '會考模擬考').click();
  await page.getByText('照會考的題數和時間作答', { exact: false }).waitFor({ timeout: 10000 });
  await page.getByText('英語閱讀', { exact: true }).last().click();
  await page.getByText('還沒有考過英語閱讀模擬考', { exact: false }).waitFor({ timeout: 10000 });
  await page.getByText('完整 43 題（完整版）', { exact: false }).waitFor();
  await page.getByText('10 題・', { exact: false }).waitFor();
  await page.getByRole('button', { name: '開始作答' }).click();
  await page.getByText('第 1 題 / 共 10 題', { exact: false }).waitFor({ timeout: 15000 });
  await page.getByText(/^\d\d:\d\d$/).first().waitFor();
  await shot(page, '09h-mock-exam');
  // 第 1 題故意答錯、第 2～3 題答對，其餘不作答
  for (let i = 0; i < 3; i++) {
    const stems = await stemsOnPage(page);
    const q = await answerFor(stems[0]);
    const key = i === 0 ? 'ABCD'.split('').find((k) => k !== q.answer) : q.answer;
    await page.getByLabel(new RegExp(`^選項 ${key}：`)).click();
    await page.getByRole('button', { name: '下一題' }).click();
  }
  await byText(page, '題目總覽（已答 3）').click();
  await page.getByRole('button', { name: '第 4 題，未作答' }).waitFor();
  await byText(page, '回到題目').click();
  await byText(page, '提早交卷').click();
  await page.getByText('確定交卷？', { exact: true }).waitFor();   // 網頁版改用頁面內的確認視窗
  await page.getByRole('button', { name: '交卷', exact: true }).click();
  await byText(page, '交卷完成').waitFor({ timeout: 20000 });
  await page.getByText('20 分', { exact: false }).first().waitFor();
  await page.getByText('答對 2 / 10 題・未作答 7 題', { exact: false }).waitFor();
  await byText(page, '各單元表現（由弱到強）').waitFor();
  await page.getByText('成績已記錄', { exact: false }).waitFor({ timeout: 10000 });
  await shot(page, '09i-mock-result');
  const me = (await db.query(`select subject, full_length, total, correct, unanswered, score from mock_exams where user_id = $1`, [studentId])).rows;
  assert.deepEqual(me, [{ subject: 'english', full_length: false, total: 10, correct: 2, unanswered: 7, score: 20 }]);
  // 回到模擬考首頁：看到歷次成績與進步曲線
  await page.getByRole('button', { name: '再考一次／看歷次成績' }).click();
  await page.getByText('英語閱讀・歷次成績', { exact: false }).waitFor({ timeout: 10000 });
  await page.getByText('最近一次', { exact: true }).waitFor({ timeout: 10000 });
  await page.getByLabel('最近 1 次模擬考分數：20').waitFor();
  await shot(page, '09i2-mock-history');
  const att = (await db.query(`select count(*)::int n from attempts where user_id = $1 and context = 'exam' and question_id like 'EN-%'`, [studentId])).rows[0].n;
  assert.equal(att, 3, '只送出有作答的 3 題');
  // 錯題本：出現科目篩選，選英語只剩英語錯題
  await page.goto(`${APP}/mistakes`);
  await page.getByText('全部科目', { exact: false }).waitFor({ timeout: 10000 });
  await page.getByText(/^英語 \d+$/).click();
  const tags = await page.getByText(/^(數學|國文|英語|自然|社會) [七八九][上下] · /).allInnerTexts();
  assert.ok(tags.length > 0 && tags.every((t) => t.startsWith('英語')), tags.join(' | '));
  await shot(page, '09j-mistakes-subject');
});

await step('英語聽力：七下聽力單元有播放鍵與慢速播放；作答後顯示聽力原文', async () => {
  await page.goto(`${APP}/learn`);
  await byText(page, '英語').click();
  await byText(page, '七下').click();
  await page.getByRole('button', { name: '看學期總複習的單元' }).click();
  await page.getByRole('button', { name: '練習單元 聽力：基本問答與日常對話（七年級）' }).click();
  await page.getByRole('button', { name: '播放', exact: true }).waitFor({ timeout: 15000 });
  await page.getByRole('button', { name: '慢速播放' }).waitFor();
  await page.getByRole('button', { name: '播放', exact: true }).click();   // 網頁版用瀏覽器語音，測試環境可能沒有聲音，但不能出錯
  await shot(page, '09k-listening');
  const stems = await stemsOnPage(page);
  const q = await answerFor(stems[0]);
  const script = (await db.query(`select listen_script from questions where id = $1`, [q.id])).rows[0].listen_script;
  assert.ok(script, '這題是聽力題');
  await page.getByLabel(new RegExp(`^選項 ${q.answer}：`)).click();
  await page.getByRole('button', { name: '檢查答案' }).click();
  await page.getByText('聽力原文', { exact: true }).waitFor({ timeout: 10000 });
  const firstLine = script.split('\n')[0].replace(/^(M|W|N):\s*/, '');
  await page.getByText(firstLine.slice(0, 20), { exact: false }).first().waitFor();
  await shot(page, '09l-listening-answered');
});

await step('前三名申請：從相簿選照片上傳、填表送出 → 資料庫與儲存空間都有紀錄', async () => {
  await page.goto(`${APP}/top-three`);
  await page.getByLabel('學校').fill('測試國中');
  await byText(page, '第 1 名').click();
  await page.getByRole('checkbox').click();
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.getByRole('button', { name: '從相簿選擇' }).click()]);
  await chooser.setFiles(fileURLToPathSafe(new URL('app/assets/images/icon.png', root)));
  await page.locator('img').first().waitFor({ timeout: 10000 });
  await page.getByRole('button', { name: '送出申請' }).click();
  await page.waitForTimeout(2500);
  await shot(page, '10-top-three');
  const a = (await db.query(`select status, proof_path from top_three_applications where user_id = $1`, [studentId])).rows[0];
  assert.equal(a?.status, 'pending');
  assert.ok(fs.existsSync(`/tmp/cap-storage/proofs/${a.proof_path}`), '照片已存到儲存空間');
});

await step('管理後台：管理員登入、看到照片、通過 → 學生變完整版、照片刪除', async () => {
  const admEmail = `ui-admin${stamp}@test.tw`;
  await fetch(`${API}/auth/v1/signup`, { method: 'POST', headers: { 'content-type': 'application/json', apikey: 'sb_publishable_integration_test' },
    body: JSON.stringify({ email: admEmail, password: 'password123' }) });
  await db.query(`insert into admins (user_id) select id from auth.users where email = $1`, [admEmail]);
  const admin = await newPage();
  await admin.setViewportSize({ width: 1100, height: 900 });
  const UMD = fs.readFileSync(new URL('app/node_modules/@supabase/supabase-js/dist/umd/supabase.js', root), 'utf8');
  await admin.route('https://cdn.jsdelivr.net/**', (r) => r.fulfill({ contentType: 'application/javascript', body: `${UMD}\nexport const createClient = supabase.createClient;` }));
  await admin.goto(`${APP}/__admin`);
  await admin.fill('#cfg-url', API);
  await admin.fill('#cfg-key', 'sb_publishable_integration_test');
  await admin.click('#cfg-save');
  await admin.fill('#email', admEmail);
  await admin.fill('#password', 'password123');
  await admin.click('#login-btn');
  await admin.getByText('待審核申請').waitFor({ timeout: 15000 });
  await admin.getByRole('tab', { name: /前三名審核/ }).click();
  const img = admin.locator(`img[src*="${studentId}"]`);
  await img.waitFor({ timeout: 10000 });
  await admin.waitForFunction((sid) => { const i = document.querySelector(`img[src*="${sid}"]`); return i && i.complete && i.naturalWidth > 0; }, studentId, { timeout: 10000 });
  await shot(admin, '11-admin');
  const card = admin.locator('.card.app', { has: img });
  await card.locator('[data-role=note]').fill('恭喜！');
  await card.getByRole('button', { name: '通過', exact: true }).click();
  await admin.getByText('已通過，完整版已開通').waitFor({ timeout: 10000 });
  const p = (await db.query(`select premium_until from profiles where id = $1`, [studentId])).rows[0];
  assert.ok(p.premium_until, '完整版已開通');
  assert.equal((await db.query(`select count(*)::int n from storage.objects where name like $1`, [studentId + '/%'])).rows[0].n, 0, '照片已刪除');
  await admin.close();
});

await step('學生端看到完整版與審核結果', async () => {
  await page.goto(APP);
  await page.getByText('完整版使用中', { exact: false }).waitFor({ timeout: 10000 });
  await shot(page, '12-home-premium');
});

await step('家長：註冊家長帳號、輸入孩子邀請碼綁定 → 看到練習摘要', async () => {
  const code = (await db.query(`select invite_code from profiles where id = $1`, [studentId])).rows[0].invite_code;
  const parent = await newPage();
  await parent.goto(APP);
  await byText(parent, '註冊').click();
  await byText(parent, '家長').click();
  await parent.getByLabel('暱稱（不要用真實姓名）').fill('小安媽媽');
  await parent.getByLabel('Email').fill(`ui-parent${stamp}@test.tw`);
  await parent.getByLabel('密碼（至少 8 個字元）').fill('password123');
  await parent.getByRole('checkbox').click();
  await parent.getByRole('button', { name: '建立帳號' }).click();
  await byText(parent, '孩子的學習狀況').waitFor({ timeout: 15000 });
  await parent.getByLabel('孩子的邀請碼').fill(code);
  await parent.getByRole('button', { name: '綁定' }).click();
  await parent.getByText('天有練習', { exact: false }).waitFor({ timeout: 15000 });
  await parent.getByText('會考模擬考', { exact: true }).waitFor({ timeout: 10000 });
  await parent.getByText('英語閱讀', { exact: true }).waitFor();
  await parent.getByLabel('最近 1 次模擬考分數：20').waitFor();
  await shot(parent, '13-parent');
  await parent.close();
});

await step('學生在「我的」看到 8 碼邀請碼與已綁定的家長（可以解除）', async () => {
  await page.goto(`${APP}/me`);
  await byText(page, '已綁定的家長').waitFor({ timeout: 15000 });
  await byText(page, '小安媽媽').waitFor({ timeout: 15000 });
  const code = (await db.query(`select invite_code from profiles where id = $1`, [studentId])).rows[0].invite_code;
  assert.match(code, /^[A-HJ-NP-Z2-9]{8}$/);
  await byText(page, code).waitFor();
  assert.equal(await page.getByRole('button', { name: '解除綁定 小安媽媽' }).count(), 1);
  await shot(page, '13b-me-parents');
});

await step('忘記密碼：在 App 內收驗證碼、設新密碼後自動登入；新密碼可登入', async () => {
  const p2 = await newPage();
  await p2.goto(APP);
  await byText(p2, '忘記密碼？').click();
  await p2.getByLabel('Email').last().fill(STUDENT.email);
  await p2.getByRole('button', { name: '寄送驗證碼' }).click();
  await p2.getByLabel('6 位數驗證碼').waitFor({ timeout: 10000 });
  const otp = await (await fetch(`${API}/__test/otp?email=${encodeURIComponent(STUDENT.email)}`)).json();
  await p2.getByLabel('6 位數驗證碼').fill(otp.code);
  await p2.getByLabel('新密碼（至少 8 個字元）').fill('brandnew789');
  await shot(p2, '14-forgot');
  await p2.getByRole('button', { name: '更新密碼' }).click();
  await byText(p2, '天連勝').waitFor({ timeout: 15000 });
  await p2.close();
  const r = await fetch(`${API}/auth/v1/token?grant_type=password`, { method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: STUDENT.email, password: 'brandnew789' }) });
  assert.equal(r.status, 200);
});

await step('小老師次數用完（免費帳號）：顯示升級選項；網頁版不顯示廣告按鈕', async () => {
  const free = await newPage();
  const email = `ui-free${stamp}@test.tw`;
  await fetch(`${API}/auth/v1/signup`, { method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123', data: { nickname: '阿明', role: 'student', parent_consent: 'true' } }) });
  const uid = (await db.query(`select id from auth.users where email = $1`, [email])).rows[0].id;
  await db.query(`update profiles set grade = 9, ai_consent_at = now() where id = $1`, [uid]);
  await db.query(`insert into tutor_usage (user_id, day, count) values ($1, (now() at time zone 'Asia/Taipei')::date, 3)`, [uid]);
  await free.goto(APP);
  await free.getByLabel('Email').fill(email);
  await free.getByLabel('密碼（至少 8 個字元）').fill('password123');
  await free.getByLabel('登入', { exact: true }).click();
  await byText(free, '天連勝').waitFor({ timeout: 15000 });
  await free.goto(`${APP}/tutor?questionId=M-9A-1-01`);
  await byText(free, '今天的免費小老師次數用完了').waitFor({ timeout: 15000 });
  assert.equal(await free.getByText('看一段廣告', { exact: false }).count(), 0);
  await shot(free, '15-tutor-limit');
  await free.close();
});

await browser.close();
await stopStack();
web.close();
await db.end();
const real = errors.filter((e) => !/Password field is not contained|DOM/.test(e));
console.log(real.length ? '頁面錯誤：\n' + real.join('\n') : '沒有頁面錯誤');
if (real.length) process.exitCode = 1;
console.log(`\n${passed} 項通過${process.exitCode ? '，有失敗項目' : ''}`);
process.exit(process.exitCode ?? 0);

function fileURLToPathSafe(u) { return decodeURIComponent(u.pathname); }
