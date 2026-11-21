// 網頁試用版冒煙測試：世界地圖出征 → 領地戰 → 收服夥伴 → 夥伴頁 → 商店買家具 → 大廳看到家具與夥伴
// 先 bash demo/build-demo.sh，再用任何靜態伺服器開 demo/dist（例如 python3 -m http.server 8790 -d demo/dist）
// REC_DIR=資料夾 會把整段操作錄成影片
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const APP = process.env.DEMO_URL ?? 'http://127.0.0.1:8790/';
const OUT = process.env.SHOT_DIR ?? '/tmp/world-shots'; mkdirSync(OUT, { recursive: true });
const REC = process.env.REC_DIR;
// 錄影時讓瀏覽器本身用 2 倍解析度輸出，影片才會是清楚的 780×1688
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? '/opt/pw-browsers/chromium',
  args: REC ? ['--force-device-scale-factor=2'] : [] });
const errors = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, ...(REC ? {} : { deviceScaleFactor: 2 }),
  ...(REC ? { recordVideo: { dir: REC, size: { width: 780, height: 1688 } } } : {}) });
const page = await ctx.newPage();
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|play\(\)/.test(m.text())) errors.push('console ' + m.text()); });
page.on('dialog', (d) => d.accept());
const t = (s) => page.getByText(s, { exact: true }).first();
const shot = (n) => page.screenshot({ path: `${OUT}/${n}.png` });
const tab = async (name) => { await page.getByRole('tab', { name }).or(page.getByRole('link', { name })).first().click(); };
const pause = (ms) => page.waitForTimeout(REC ? ms : Math.min(ms, 300));
let n = 0; const step = async (name, fn) => { await fn(); console.log(`  ✓ ${++n}. ${name}`); };
// App 內的確認視窗（網頁版是自製對話框）
const confirm = async (label) => { await page.getByRole('button', { name: label, exact: true }).last().click(); };

async function answerCorrect(wrong = false) {
  const ans = await page.evaluate(() => {
    const body = document.body.innerText;
    return window.CAP_DEMO_DATA.questions.find((x) => body.includes(x.stem.slice(0, 30))).answer;
  });
  const key = wrong ? 'ABCD'.split('').find((k) => k !== ans) : ans;
  await pause(900);
  await page.getByLabel(new RegExp(`^選項 ${key}：`)).click();
  await pause(400);
  await page.getByRole('button', { name: '檢查答案' }).click();
}
async function winBattle() {
  for (let i = 0; i < 3; i++) {
    await page.getByText(`第 ${i + 1} 題 / 共 5 題`, { exact: false }).waitFor({ timeout: 15000 });
    // 連對 2 題後絕招集滿：按下絕招鈕，下一題答對就放絕招
    if (i === 2) { await page.getByRole('button', { name: '絕招集滿了，按一下準備發動' }).click(); await page.getByLabel('絕招已就緒，下一題答對就會發動').waitFor(); await pause(900); }
    await answerCorrect();
    if (i === 2) await t('絕招擊敗！').waitFor({ timeout: 5000 });
    await pause(1300);
    await page.getByRole('button', { name: i === 2 ? '看結果' : '下一題' }).click();
  }
  await t('領地戰勝利！').waitFor({ timeout: 15000 });
}

await step('註冊、首次設定', async () => {
  await page.goto(APP);
  await page.getByText('試用版', { exact: false }).first().waitFor({ timeout: 20000 });
  await t('註冊').click();
  await page.getByLabel('暱稱（不要用真實姓名）').fill('小勇');
  await page.getByLabel('Email').fill('hero@demo.tw');
  await page.getByLabel('密碼（至少 8 個字元）').fill('password123');
  await page.getByRole('checkbox').nth(0).click();
  await page.getByRole('checkbox').nth(1).click();
  await page.getByRole('button', { name: '建立帳號' }).click();
  await t('先設定一下').waitFor({ timeout: 15000 });
  await t('七年級').click(); await t('康軒').click();
  await page.getByRole('button', { name: '開始練習' }).click();
  await page.getByText('勇者大廳', { exact: true }).first().waitFor({ timeout: 15000 });
  await t('新手任務：收服你的第一隻夥伴').waitFor();
  await t('今日任務').waitFor();
  await pause(2500);
  await shot('01-hall-empty');
});
await step('世界地圖：七上大陸，第一塊領地可以出征', async () => {
  await tab('地圖');
  await page.getByText(/七上大陸・已佔領 0 \/ \d+ 塊/).waitFor({ timeout: 15000 });
  await t('點這塊發亮的領地，打第一場！').waitFor();
  await pause(2500);
  await shot('02-map');
  await page.getByRole('button', { name: /可以出征$/ }).first().click();
  await page.getByText(/^這裡出沒：/).waitFor();
  await pause(1500);
  await shot('03-node-sheet');
});
await step('領地戰：答對 3 題就贏，收服第一隻夥伴、+30 金幣', async () => {
  await page.getByRole('button', { name: '出征', exact: true }).click();
  await winBattle();
  await t('收服成功！新夥伴加入').waitFor({ timeout: 15000 });
  await page.getByText('佔領獎勵 +30 金幣').waitFor();
  await pause(3500);
  await shot('04-captured');
});
await step('回地圖：這塊領地插旗，金幣 45', async () => {
  await page.getByRole('button', { name: '回世界地圖' }).click();
  await page.getByText(/已佔領 1 \/ \d+ 塊/).waitFor({ timeout: 15000 });
  await page.getByLabel('金幣 45，去商店').waitFor();
  await pause(2000);
  await shot('05-map-won');
});
await step('第二塊領地：先答錯 1 題再贏（錯題會讓這塊領地被入侵）', async () => {
  await page.getByRole('button', { name: /可以出征$/ }).first().click();
  await page.getByRole('button', { name: '出征', exact: true }).click();
  await page.getByText('第 1 題 / 共 5 題', { exact: false }).waitFor({ timeout: 15000 });
  await answerCorrect(true);
  await page.getByText(/^心眼發動！/).waitFor({ timeout: 10000 });
  await pause(1500);
  await page.getByRole('button', { name: '直接看解析' }).click();
  await page.getByRole('button', { name: '先做下一題' }).click();
  for (let i = 1; i < 4; i++) {
    await page.getByText(`第 ${i + 1} 題 / 共 5 題`, { exact: false }).waitFor({ timeout: 15000 });
    await answerCorrect();
    await pause(1200);
    await page.getByRole('button', { name: i === 3 ? '看結果' : '下一題' }).click();
  }
  await t('領地戰勝利！').waitFor({ timeout: 15000 });
  await pause(3000);
  await page.getByRole('button', { name: '回世界地圖' }).click();
  await page.getByText('1 塊被入侵', { exact: false }).waitFor({ timeout: 15000 });
  await pause(2000);
  await shot('06-map-invaded');
});
await step('守護者與熟練度：在已佔領的領地派夥伴駐守', async () => {
  await page.getByRole('button', { name: /，已佔領$/ }).first().click();
  await page.getByLabel('熟練度 1 / 3').waitFor();
  await page.getByRole('button', { name: /^派 .+ 駐守$/ }).first().click();
  await page.getByRole('button', { name: /^派 .+ 駐守，駐守中$/ }).waitFor({ timeout: 10000 });
  await pause(1500);
  await shot('06b-guard');
  await page.getByRole('button', { name: '關閉', exact: true }).click();
});
await step('圖鑑・夥伴：已收服 2 種，兩隻都自動加入出戰隊伍；可以換下、再加入', async () => {
  await page.getByRole('button', { name: '我的魔物夥伴' }).click();
  await page.getByText(/已收服 2 \/ 20 種/).waitFor({ timeout: 15000 });
  await t('◆ 出戰隊伍 2/3').waitFor();
  await page.getByLabel(/^星晶 \d+ 顆$/).waitFor();
  await pause(2000);
  await shot('07-pals');
  const second = await page.getByRole('button', { name: /^隊員.+，點一下換下來$/ }).first();
  const name = (await second.getAttribute('aria-label')).replace(/^隊員/, '').replace(/，點一下換下來$/, '');
  await second.click();
  await t('◆ 出戰隊伍 1/3').waitFor({ timeout: 10000 });
  await page.getByRole('button', { name: `${name}，幼體，經驗 ` , exact: false }).first().click();
  await t('◆ 出戰隊伍 2/3').waitFor({ timeout: 10000 });
});
await step('圖鑑・野生魔物：答錯的題目是那個單元夥伴的野生版；魔王頁還沒遇過', async () => {
  await page.getByRole('tab', { name: /^野生魔物/ }).click();
  await page.getByText(/^野生.+・/).first().waitFor({ timeout: 10000 });
  await t('狂暴中').first().waitFor();
  await pause(1500);
  await shot('07b-wild');
  await page.getByRole('tab', { name: /^魔王/ }).click();
  await t('段考小魔王').or(page.getByText('？？？').first()).first().waitFor({ timeout: 10000 });
  await pause(800);
  await shot('07c-boss');
});
await step('淨化：錯題複習到最後一次答對，野生魔物被淨化，夥伴拿經驗', async () => {
  // 試用資料：把錯題直接推到最後一關（almost、已到期），模擬已經複習過 1、3、7 天
  await page.evaluate(() => {
    const db = JSON.parse(localStorage.getItem('cap-demo-db-v1'));
    Object.values(db.mistakes).forEach((ms) => Object.values(ms).forEach((m) => { m.status = 'almost'; m.next_review = '2000-01-01'; }));
    localStorage.setItem('cap-demo-db-v1', JSON.stringify(db));
  });
  await page.goto(APP);
  await page.getByRole('button', { name: /^野生魔物，1 隻今天可複習/ }).click({ timeout: 20000 });
  await page.getByText('第 1 題 / 共 1 題', { exact: false }).waitFor({ timeout: 15000 });
  await page.getByLabel(/^野生.+血量/).waitFor();
  await pause(1500);
  await shot('07d-wild-battle');
  await answerCorrect();
  await page.getByText(/^淨化成功！/).waitFor({ timeout: 10000 });
  await pause(2500);
  await shot('07e-purified');
  await page.getByRole('button', { name: '看結果' }).click();
  await page.goto(APP);
  await page.getByText('勇者大廳', { exact: true }).first().waitFor({ timeout: 20000 });
});
await step('魔王城：地圖最上面進去，選科目挑戰段考魔王', async () => {
  await tab('地圖');
  await page.getByRole('button', { name: /大陸的魔王城/ }).click({ timeout: 15000 });
  await t('魔王城').waitFor({ timeout: 15000 });
  await page.getByText(/挑戰/).first().waitFor();
  await pause(1500);
  await shot('07f-castle');
  await page.getByRole('button', { name: '返回' }).click();
});
await step('商店：金幣不夠會提示；補金幣後買盆栽和床', async () => {
  await tab('大廳');
  await page.getByRole('button', { name: /^商店，/ }).click();
  await t('大廳商店').waitFor({ timeout: 15000 });
  await pause(1500);
  await shot('08-shop');
  // 試用資料：直接把金幣加到 500，方便示範購買
  await page.evaluate(() => {
    const db = JSON.parse(localStorage.getItem('cap-demo-db-v1'));
    Object.values(db.world).forEach((w) => { w.gold = 500; });
    localStorage.setItem('cap-demo-db-v1', JSON.stringify(db));
  });
  await page.goto(APP);
  await page.getByRole('button', { name: /^商店，/ }).click({ timeout: 20000 });
  await page.getByLabel('金幣 500', { exact: true }).waitFor({ timeout: 20000 });
  for (const [name, left] of [['魔法盆栽', 380], ['勇者之床', 80]]) {
    await page.getByRole('button', { name: new RegExp(`^${name}，`) }).click();
    await pause(900);
    await confirm('買');
    await pause(1200);
    await confirm('好');
    await page.getByLabel(`金幣 ${left}`, { exact: true }).waitFor({ timeout: 10000 });
  }
  await pause(1500);
  await shot('09-shop-bought');
});
await step('大廳：看得到家具、出戰夥伴，體力上限多 5 題；領每日任務的金幣', async () => {
  await page.getByRole('button', { name: '返回' }).click();
  await page.getByRole('button', { name: '領取 20 金幣' }).click();
  await page.getByRole('button', { name: '領取 40 金幣' }).click();
  await t('已領 2 / 4').waitFor({ timeout: 10000 });
  await page.getByLabel('金幣 140，去商店').waitFor();
  await page.getByLabel(/削弱 2 隻野生魔物（複習答對錯題），進度 1 \/ 2/).waitFor();   // 淨化那一題是複習答對
  if (await t('新手任務：收服你的第一隻夥伴').isVisible()) throw new Error('新手任務應該已經消失');
  await page.getByLabel('魔法盆栽').waitFor({ timeout: 15000 });
  await page.getByLabel('勇者之床').waitFor();
  await page.getByLabel(/^隊長 /).waitFor();
  await page.getByLabel(/^隊員 /).waitFor();
  await page.getByLabel(/體力：今天還能練 \d+ 題/).waitFor();
  await page.getByText(/\/35$/).first().waitFor();
  await page.getByText('勇者大廳', { exact: true }).first().scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, -3000);
  await pause(3000);
  await shot('10-hall-furnished');
});

await ctx.close(); await browser.close();
if (errors.length) { console.error('頁面錯誤：\n' + errors.join('\n')); process.exit(1); }
console.log(`\n${n} 個步驟通過，沒有頁面錯誤`);
