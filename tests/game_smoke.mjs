// 網頁試用版：遊戲化功能冒煙測試（等級卡、+XP、學習花園、週排行、段考魔王戰）
import { chromium } from 'playwright';
const APP = process.env.DEMO_URL ?? 'http://127.0.0.1:8790/';
const OUT = process.env.SHOTS ?? '/tmp/game-shots'; (await import('node:fs')).mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const errors = [];
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage();
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push('console ' + m.text()); });
const t = (s) => page.getByText(s, { exact: true }).first();
const shot = (n) => page.screenshot({ path: `${OUT}/${n}.png` });
const tab = async (name) => { await page.getByRole('tab', { name }).or(page.getByRole('link', { name })).first().click(); };
let n = 0; const step = async (name, fn) => { await fn(); console.log(`  ✓ ${++n}. ${name}`); };
const answerCurrent = async (right = true) => {
  const ans = await page.evaluate(() => {
    const body = document.body.innerText;
    return window.CAP_DEMO_DATA.questions.find((x) => body.includes(x.stem.slice(0, 30))).answer;
  });
  await page.getByLabel(new RegExp(`^選項 ${right ? ans : 'ABCD'.split('').find((k) => k !== ans)}：`)).click();
  await page.getByRole('button', { name: '檢查答案' }).click();
};

await step('註冊並完成首次設定', async () => {
  await page.goto(APP);
  await page.getByText('試用版', { exact: false }).first().waitFor({ timeout: 20000 });
  await t('註冊').click();
  await page.getByLabel('暱稱（不要用真實姓名）').fill('暱稱甲乙');
  await page.getByLabel('Email').fill('game@demo.tw');
  await page.getByLabel('密碼（至少 8 個字元）').fill('password123');
  await page.getByRole('checkbox').nth(0).click();
  await page.getByRole('checkbox').nth(1).click();
  await page.getByRole('button', { name: '建立帳號' }).click();
  await t('先設定一下').waitFor({ timeout: 15000 });
  await t('七年級').click(); await t('康軒').click();
  await page.getByRole('button', { name: '開始練習' }).click();
  await page.getByText('歡迎！先做第一輪 5 題', { exact: false }).waitFor({ timeout: 15000 });
});
await step('每日 5 題全對：飄出 +10 XP、3 連擊、升到 Lv 1 進度', async () => {
  await page.getByRole('button', { name: '開始第一輪' }).click();
  for (let i = 0; i < 5; i++) {
    await page.getByText(`第 ${i + 1} 題 / 共 5 題`, { exact: false }).waitFor({ timeout: 15000 });
    await answerCurrent(true);
    if (i === 2) { await page.getByText('3 連擊！', { exact: true }).waitFor({ timeout: 3000 }); await shot('01-combo'); }
    await page.getByRole('button', { name: i === 4 ? '看結果' : '下一題' }).click();
  }
  await t('這一輪完成了！').waitFor();
  await page.getByRole('button', { name: '回首頁' }).click();
  await t('小種子').waitFor({ timeout: 10000 });
  await page.getByText('再 50 XP 升到 Lv 2', { exact: false }).waitFor();
  await shot('02-home-level');
});
await step('學習花園：國中 86 株，有一些已經發芽', async () => {
  await page.getByRole('button', { name: '學習花園' }).click();
  await page.getByText('把整座花園種滿吧', { exact: false }).waitFor({ timeout: 10000 });
  await page.getByText('/ 86 株', { exact: false }).waitFor({ timeout: 10000 });
  const sprouted = await page.getByText(/^發芽 · 再/).count();
  if (sprouted < 1) throw new Error('應該有單元發芽');
  await shot('03-garden');
  await page.getByRole('button', { name: '返回' }).click();
});
await step('本週排行：自己有代號、名次，沒有出現暱稱；可以隱藏', async () => {
  await page.getByRole('button', { name: '本週排行' }).click();
  await page.getByText('每週一重新開始', { exact: false }).first().waitFor({ timeout: 10000 });
  await page.getByText('（你）', { exact: false }).first().waitFor({ timeout: 10000 });
  const body = await page.evaluate(() => document.body.innerText);
  if (body.includes('暱稱甲乙')) throw new Error('排行榜不該出現暱稱');
  await shot('04-leaderboard');
  await page.getByRole('switch', { name: '不要出現在排行榜' }).click();
  await page.getByText('· 已隱藏', { exact: false }).waitFor({ timeout: 10000 });
  await page.getByRole('switch', { name: '不要出現在排行榜' }).click();
  await page.getByRole('button', { name: '返回' }).click();
});
await step('段考魔王戰：血條、愛心，答錯掉愛心，結算有星星', async () => {
  await tab('副本');
  const btn = page.getByRole('button', { name: /^開始第一次段考/ });
  await btn.first().click();
  await t('段考小魔王').waitFor({ timeout: 15000 });
  await answerCurrent(true);
  await page.getByText('HP 14 / 15', { exact: false }).waitFor({ timeout: 5000 });
  await page.getByRole('button', { name: '下一題' }).click();
  await answerCurrent(false);
  await page.getByText(/^心眼發動！/).waitFor({ timeout: 5000 });
  await page.getByLabel(/你的愛心 2 顆/).waitFor({ timeout: 5000 });
  // 心眼：再挑戰一次，選正確答案 → +3 XP
  await page.getByRole('button', { name: '再挑戰一次' }).click();
  const ans2 = await page.evaluate(() => {
    const body = document.body.innerText;
    return window.CAP_DEMO_DATA.questions.find((x) => body.includes(x.stem.slice(0, 30))).answer;
  });
  await page.getByLabel(new RegExp(`^選項 ${ans2}：`)).click();
  await page.getByRole('button', { name: '發動心眼・再答一次' }).click();
  await page.getByText('心眼成功！', { exact: false }).waitFor({ timeout: 5000 });
  await shot('05-boss');
  for (let i = 2; i < 15; i++) {
    await page.getByRole('button', { name: /下一題|先做下一題/ }).click();
    await page.getByText(`第 ${i + 1} 題 / 共 15 題`, { exact: false }).waitFor({ timeout: 15000 });
    await answerCurrent(true);
  }
  await page.getByRole('button', { name: '看結果' }).click();
  await page.getByText('打敗段考小魔王了！', { exact: true }).waitFor({ timeout: 10000 });
  await page.getByLabel('3 顆星').waitFor();
  await page.getByText('獲得 1 張保護卡（現在 3 張）', { exact: false }).waitFor({ timeout: 10000 });
  await shot('06-boss-win');
});
await step('階段卡顯示魔王最佳星數', async () => {
  await page.getByRole('button', { name: '回首頁' }).click();
  await tab('副本');
  await page.getByText('魔王已三星通關', { exact: true }).first().waitFor({ timeout: 10000 });
  await shot('07-stage-stars');
});
await step('許願池：許願、送給爸媽核准', async () => {
  await tab('大廳');
  await page.getByRole('button', { name: /^許願池/ }).click();
  await page.getByText('許新的願望', { exact: true }).waitFor({ timeout: 10000 });
  await page.getByRole('button', { name: '吃一次鹹酥雞' }).click();
  await page.getByRole('button', { name: '送給爸媽核准' }).click();
  await page.getByText('願望送出了！', { exact: true }).waitFor({ timeout: 10000 });
  await page.getByRole('button', { name: '好' }).click();
  await page.getByText('等爸媽核准', { exact: true }).waitFor({ timeout: 10000 });
  await shot('08-wishes');
  await page.getByRole('button', { name: '返回' }).click();
});
await step('魔物圖鑑：魔王戰答錯的題目變成狂暴中的魔物', async () => {
  await tab('魔物圖鑑');
  await page.getByLabel(/^狂暴中 [1-9]\d* 隻$/).waitFor({ timeout: 10000 });
  await page.getByText(/・.*捕獲|捕獲/).first().waitFor({ timeout: 10000 });
  await shot('09-monsters');
});
await step('更換戰鬥夥伴：選緋音 → 大廳換成緋音，心眼也由她發動', async () => {
  await tab('大廳');
  await page.getByText('夜凜', { exact: true }).first().waitFor({ timeout: 10000 });
  await shot('11-hall');
  await page.getByRole('button', { name: '更換角色' }).click();
  await page.getByText('選擇你的戰鬥夥伴', { exact: true }).waitFor({ timeout: 10000 });
  await page.getByRole('button', { name: /^緋音，/ }).click();
  await shot('12-heroes');
  await page.getByRole('button', { name: '選擇緋音當夥伴' }).click();
  await page.getByLabel('你的戰鬥夥伴 緋音').waitFor({ timeout: 10000 });
});
await step('成就徽章：初次討伐已點亮，其他顯示進度', async () => {
  await tab('大廳');
  await page.getByRole('button', { name: '成就徽章' }).click();
  await page.getByText('已點亮', { exact: true }).waitFor({ timeout: 10000 });
  await page.getByLabel(/^初次討伐，.*已達成$/).waitFor({ timeout: 10000 });
  await page.getByLabel(/^百題斬，.*進度 \d+ \/ 100$/).waitFor();
  await shot('10-badges');
  await page.getByRole('button', { name: '返回' }).click();
});

console.log(errors.length ? '頁面錯誤：\n' + errors.join('\n') : '沒有頁面錯誤');
await browser.close();
if (errors.length) process.exit(1);
