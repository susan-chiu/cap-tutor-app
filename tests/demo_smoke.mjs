// 網頁試用版冒煙測試：學生註冊→首次設定→每日練習（答錯）→小老師→模擬考→聽力→家長綁定
import { chromium } from 'playwright';
const APP = process.env.DEMO_URL ?? 'http://127.0.0.1:8790/';
const OUT = '/tmp/demo-shots'; (await import('node:fs')).mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push('console ' + m.text()); });
page.on('response', (r) => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()); });
const t = (s) => page.getByText(s, { exact: true }).first();
const shot = (n) => page.screenshot({ path: `${OUT}/${n}.png` });
const tab = async (name) => { await page.getByRole('tab', { name }).or(page.getByRole('link', { name })).first().click(); };
let n = 0; const step = async (name, fn) => { await fn(); console.log(`  ✓ ${++n}. ${name}`); };

await step('註冊學生帳號', async () => {
  await page.goto(APP);
  await page.getByText('試用版', { exact: false }).first().waitFor({ timeout: 20000 });
  await t('註冊').click();
  await page.getByLabel('暱稱（不要用真實姓名）').fill('小安');
  await page.getByLabel('Email').fill('kid@demo.tw');
  await page.getByLabel('密碼（至少 8 個字元）').fill('password123');
  await page.getByRole('checkbox').nth(0).click();
  await page.getByRole('checkbox').nth(1).click();
  await page.getByRole('button', { name: '建立帳號' }).click();
  await t('先設定一下').waitFor({ timeout: 15000 });
});
await step('首次設定 → 首頁', async () => {
  await t('八年級').click(); await t('康軒').click();
  await page.getByRole('button', { name: '開始練習' }).click();
  await page.getByText('歡迎！先做第一輪 5 題', { exact: false }).waitFor({ timeout: 15000 });
  await shot('01-home');
});
await step('每日練習：答 5 題（第 1 題故意答錯）', async () => {
  await page.getByRole('button', { name: '開始第一輪' }).click();
  for (let i = 0; i < 5; i++) {
    await page.getByText(`第 ${i + 1} 題 / 共 5 題`, { exact: false }).waitFor({ timeout: 15000 });
    const ans = await page.evaluate(() => {
      const body = document.body.innerText;
      const q = window.CAP_DEMO_DATA.questions.find((x) => body.includes(x.stem.slice(0, 30)));
      return q.answer;
    });
    const key = i === 0 ? 'ABCD'.split('').find((k) => k !== ans) : ans;
    await page.getByLabel(new RegExp(`^選項 ${key}：`)).click();
    await page.getByRole('button', { name: '檢查答案' }).click();
    if (i === 0) {
      await shot('02-wrong');
      await page.getByRole('button', { name: '找小老師' }).click();
      await page.getByRole('button', { name: '我同意，開始使用' }).click();
      await page.getByText('可以說說你當時是怎麼想的', { exact: false }).waitFor({ timeout: 15000 });
      await page.getByRole('button', { name: '給我提示' }).click();
      await page.getByText('提示 1：', { exact: false }).waitFor({ timeout: 15000 });
      await shot('03-tutor');
      await page.goBack();
      await page.getByRole('button', { name: '先做下一題' }).waitFor({ timeout: 15000 });
      await page.getByRole('button', { name: '先做下一題' }).click();
    } else {
      await page.getByRole('button', { name: i === 4 ? '看結果' : '下一題' }).click();
    }
  }
  await t('這一輪完成了！').waitFor();
  await page.getByText('連勝 1 天', { exact: false }).first().waitFor();
});
await step('錯題本有 1 題待講解', async () => {
  await page.getByRole('button', { name: '回首頁' }).click();
  await tab('錯題本');
  await page.getByText('待講解', { exact: true }).nth(1).waitFor({ timeout: 15000 });
});
await step('模擬考：英語閱讀迷你 10 題 → 交卷 → 成績記錄', async () => {
  await tab('練習');
  await page.getByText('會考模擬考', { exact: true }).first().click();
  await page.getByText('英語閱讀', { exact: true }).last().click();
  await page.getByRole('button', { name: '開始作答' }).click();
  await page.getByText('第 1 題 / 共 10 題', { exact: false }).waitFor({ timeout: 15000 });
  for (let i = 0; i < 3; i++) {
    await page.getByLabel(/^選項 A：/).click();
    await page.getByRole('button', { name: '下一題' }).click();
  }
  await t('提早交卷').click();
  await page.getByText('確定交卷？', { exact: true }).waitFor();   // 網頁版的頁面內確認視窗
  await shot('04a-dialog');
  await page.getByRole('button', { name: '交卷', exact: true }).click();
  await t('交卷完成').waitFor({ timeout: 15000 });
  await page.getByText('成績已記錄', { exact: false }).waitFor({ timeout: 10000 });
  await shot('04-mock');
});
await step('英語聽力單元有播放鍵', async () => {
  await page.getByRole('button', { name: '再考一次／看歷次成績' }).click();
  await page.getByRole('button', { name: '離開模擬考' }).click();
  await t('英語').click(); await t('七下').click();
  await page.getByRole('button', { name: '看學期總複習的單元' }).click();
  await page.getByRole('button', { name: '練習單元 聽力：基本問答與日常對話（七年級）' }).click();
  await page.getByRole('button', { name: '播放', exact: true }).waitFor({ timeout: 15000 });
  await shot('05-listening');
});
await step('家長帳號綁定 → 看到練習與模擬考', async () => {
  await page.getByRole('button', { name: '離開練習' }).click();
  await page.getByText('要離開練習嗎？', { exact: true }).waitFor({ timeout: 3000 }).then(() => page.getByRole('button', { name: '離開', exact: true }).click()).catch(() => {});
  await tab('我的');
  const code = (await page.getByText(/^[A-HJ-NP-Z2-9]{8}$/).first().innerText()).trim();
  const p2 = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  p2.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
  // 不同分頁的資料在同一個瀏覽器才看得到：這裡用同一個 context 的另一個分頁
  const p3 = await ctx.newPage();
  await p3.goto(APP);
  await p3.getByText('試用版', { exact: false }).first().waitFor();
  await page.getByRole('button', { name: '登出' }).click();
  await t('註冊').waitFor({ timeout: 15000 });
  await t('註冊').click(); await t('家長').click();
  await page.getByLabel('暱稱（不要用真實姓名）').fill('小安媽媽');
  await page.getByLabel('Email').fill('mom@demo.tw');
  await page.getByLabel('密碼（至少 8 個字元）').fill('password123');
  await page.getByRole('checkbox').click();
  await page.getByRole('button', { name: '建立帳號' }).click();
  await t('孩子的學習狀況').waitFor({ timeout: 15000 });
  await page.getByLabel('孩子的邀請碼').fill(code);
  await page.getByRole('button', { name: '綁定' }).click();
  await page.getByText('天有練習', { exact: false }).waitFor({ timeout: 15000 });
  await page.getByText('會考模擬考', { exact: true }).waitFor();
  await shot('06-parent');
  await p2.close(); await p3.close();
});
await browser.close();
const real = errors.filter((e) => !/Password field is not contained|DOM|favicon/.test(e));
console.log(real.length ? '錯誤：\n' + real.join('\n') : '沒有頁面錯誤');
process.exit(real.length ? 1 : 0);
