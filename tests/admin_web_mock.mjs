// 管理後台畫面測試：用 Playwright 開啟 admin/index.html，模擬 Supabase 回應，走審核與回報處理流程
// 執行：node admin_web_mock.mjs /tmp/admin-shots
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';

const OUT = process.argv[2] ?? '/tmp/admin-shots';
mkdirSync(OUT, { recursive: true });
const root = new URL('../', import.meta.url);
const HTML = readFileSync(new URL('admin/index.html', root), 'utf8');
const UMD = readFileSync(new URL('app/node_modules/@supabase/supabase-js/dist/umd/supabase.js', root), 'utf8');
const PNG = readFileSync(new URL('app/assets/images/icon.png', root));

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const exp = Math.floor(Date.now() / 1000) + 86400;
const token = `${b64({ alg: 'HS256' })}.${b64({ sub: 'admin-1', exp, role: 'authenticated' })}.sig`;
const user = { id: 'admin-1', email: 'admin@example.com', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {} };
const session = { access_token: token, refresh_token: 'r', token_type: 'bearer', expires_in: 86400, expires_at: exp, user };

const state = {
  apps: [{ id: 'app-1', user_id: 'u1', nickname: '小安', school: '○○國中', grade: 8, exam: '第一次段考', school_rank: 1, proof_path: 'u1/1.jpg', created_at: new Date().toISOString() }],
  reports: [{ report_id: 7, created_at: new Date().toISOString(), kind: 'question_wrong', note: '答案好像是 B', resolved: false,
    question_id: 'M-8A-2-04', unit_title: '平方根與畢氏定理', stem: '直角三角形的兩股長分別是 5 和 12，斜邊長是多少？',
    options: [{ key: 'A', text: '7' }, { key: 'B', text: '17' }, { key: 'C', text: '√119' }, { key: 'D', text: '13' }],
    answer: 'D', explanation: '5² + 12² = 169，斜邊 = 13。', active: true, reported_count: 1 }],
  removed: [], calls: [],
};

const errors = [];
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
page.on('dialog', (d) => d.accept());

await page.route('http://admin.local/**', (r) => r.fulfill({ contentType: 'text/html', body: HTML }));
await page.route('https://cdn.jsdelivr.net/**', (r) => r.fulfill({
  contentType: 'application/javascript',
  body: `${UMD}\nexport const createClient = supabase.createClient;`,
}));
await page.route('https://example.supabase.co/**', async (route) => {
  const req = route.request();
  const url = new URL(req.url());
  const p = url.pathname;
  const body = (() => { try { return req.postDataJSON(); } catch { return null; } })();
  const json = (d, s = 200) => route.fulfill({ status: s, contentType: 'application/json', body: JSON.stringify(d), headers: { 'access-control-allow-origin': '*' } });
  if (req.method() === 'OPTIONS') return route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' } });
  if (p === '/auth/v1/token') return json(session);
  if (p === '/auth/v1/user') return json(user);
  if (p === '/auth/v1/logout') return route.fulfill({ status: 204 });
  if (p.startsWith('/storage/v1/object/sign/proofs/') && req.method() === 'POST') return json({ signedURL: '/object/sign/proofs/u1/1.jpg?token=t' });
  if (p.startsWith('/storage/v1/object/sign')) return route.fulfill({ status: 200, contentType: 'image/png', body: PNG, headers: { 'access-control-allow-origin': '*' } });
  if (p === '/storage/v1/object/proofs' && req.method() === 'DELETE') { state.removed.push(...(body?.prefixes ?? [])); return json([]); }
  const rpc = p.replace('/rest/v1/rpc/', '');
  state.calls.push(rpc);
  switch (rpc) {
    case 'is_admin': return json(true);
    case 'admin_stats': return json({ students: 128, parents: 40, active_today: 57, active_7d: 96, answers_today: 612, tutor_today: 88,
      subscribers: 12, top_three_active: 5, pending_top_three: state.apps.length, open_reports: state.reports.filter((r) => !r.resolved).length });
    case 'admin_pending_applications': return json(state.apps);
    case 'admin_review_top_three': { const a = state.apps.find((x) => x.id === body.p_id); state.apps = state.apps.filter((x) => x.id !== body.p_id); return json(a.proof_path); }
    case 'admin_reports': return json(state.reports.filter((r) => body?.p_include_resolved || !r.resolved));
    case 'admin_set_question_active': state.reports.forEach((r) => { if (r.question_id === body.p_question_id) r.active = body.p_active; }); return json(null);
    case 'admin_resolve_report': state.reports.forEach((r) => { if (r.report_id === body.p_report_id) r.resolved = true; }); return json(null);
  }
  errors.push('UNMOCKED ' + req.method() + ' ' + p);
  return json({}, 404);
});

const shot = async (n) => { await page.waitForTimeout(600); await page.screenshot({ path: `${OUT}/${n}.png`, fullPage: true }); };

await page.goto('http://admin.local/');
await page.waitForTimeout(800);
await shot('a1-setup');
await page.fill('#cfg-url', 'https://example.supabase.co');
await page.fill('#cfg-key', 'sb_publishable_test');
await page.click('#cfg-save');
await page.waitForTimeout(600);
await shot('a2-login');
await page.fill('#email', 'admin@example.com');
await page.fill('#password', 'password123');
await page.click('#login-btn');
await page.waitForTimeout(1200);
await shot('a3-overview');

await page.getByRole('tab', { name: /前三名審核/ }).click();
await page.waitForTimeout(800);
await shot('a4-apps');
await page.getByRole('button', { name: '不通過', exact: true }).click();   // 沒寫說明應該被擋下
await page.waitForTimeout(300);
const blocked = await page.locator('.msg.err').count();
await page.fill('[data-role=note]', '恭喜！');
await page.getByRole('button', { name: '通過', exact: true }).click();
await page.waitForTimeout(1000);
await shot('a5-apps-done');

await page.getByRole('tab', { name: /題目回報/ }).click();
await page.waitForTimeout(800);
await shot('a6-reports');
await page.getByRole('button', { name: '先下架這題' }).click();
await page.waitForTimeout(600);
await page.getByRole('button', { name: '標記已處理' }).click();
await page.waitForTimeout(800);
await shot('a7-reports-done');
await browser.close();

const checks = [
  ['不通過時沒寫說明會被擋下', blocked === 1],
  ['通過後呼叫審核並刪除照片', state.calls.includes('admin_review_top_three') && state.removed.includes('u1/1.jpg')],
  ['下架題目', state.reports[0].active === false],
  ['標記已處理', state.reports[0].resolved === true],
];
for (const [name, ok] of checks) console.log(`  ${ok ? '✓' : '✗'} ${name}`);
if (checks.some(([, ok]) => !ok)) process.exitCode = 1;
console.log(errors.length ? '問題：\n' + errors.join('\n') : '管理後台流程完成，沒有頁面錯誤');
