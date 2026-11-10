// 產生商店截圖：node scripts/make_store_images.mjs <App 截圖資料夾（3 倍解析度）>
// 輸出到 store/ios（1290×2796）、store/ios-63（1206×2622）、store/android（1080×1920）與 store/android/feature-graphic.png（1024×500）
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
const require = createRequire(new URL('../tests/package.json', import.meta.url));
const { chromium } = require('playwright');

const SRC = process.argv[2] ?? '/tmp/e2e3';
const OUT = new URL('../store/', import.meta.url).pathname;
mkdirSync(OUT + 'ios', { recursive: true });
mkdirSync(OUT + 'android', { recursive: true });
mkdirSync(OUT + 'ios-63', { recursive: true });

const SLIDES = [
  { file: '01-hall.png', title: '選一位夥伴，一起打怪升級', sub: '8 位勇者陪你，每天 3 分鐘刷題', alt: false },
  { file: '02-battle.png', title: '答對一題，砍魔王一刀', sub: '段考魔王戰・連擊暴擊・三星通關', alt: true },
  { file: '03-eye.png', title: '答錯不怕，夥伴發動心眼', sub: '先給提示再挑戰一次，答對還有獎勵', alt: false, bottom: true },
  { file: '04-tutor.png', title: 'AI 小老師一步步帶你想', sub: '不直接給答案，陪你自己想出來', alt: true },
  { file: '05-monsters.png', title: '錯題變魔物，複習就討伐', sub: '隔 1、3、7 天再複習，真正學會', alt: false },
  { file: '06-parent.png', title: '家長看得見孩子的進步', sub: '五科防禦力雷達圖・許願池獎勵', alt: true },
];
function slideHtml(s, w, h) {
  const img = readFileSync(`${SRC}/${s.file}`).toString('base64');
  const scale = w / 1290;
  const phoneW = Math.round(w * 0.76);
  const bg = s.alt ? 'linear-gradient(180deg,#160F36 0%,#2A1650 100%)' : 'linear-gradient(180deg,#0B0F19 0%,#16224A 100%)';
  return `<html><body style="margin:0">
  <div style="width:${w}px;height:${h}px;overflow:hidden;background:${bg};
    font-family:'Noto Sans CJK TC','Noto Sans TC','PingFang TC',sans-serif;display:flex;flex-direction:column;align-items:center">
    <div style="padding:${Math.round(150 * scale)}px ${Math.round(70 * scale)}px ${Math.round(70 * scale)}px;text-align:center">
      <div style="font-size:${Math.round(92 * scale)}px;font-weight:900;line-height:1.25;color:#FFFFFF;text-shadow:0 0 ${Math.round(30 * scale)}px rgba(0,240,255,.45)">${s.title}</div>
      <div style="margin-top:${Math.round(28 * scale)}px;font-size:${Math.round(46 * scale)}px;font-weight:500;color:#7CF7FF">${s.sub}</div>
    </div>
    <div style="width:${phoneW}px;flex:1;margin-bottom:-${Math.round(40 * scale)}px;border-radius:${Math.round(64 * scale)}px;overflow:hidden;
      border:${Math.round(12 * scale)}px solid #E8C26A;box-shadow:0 0 ${Math.round(70 * scale)}px rgba(0,240,255,.35);background:#0B0F19">
      <img src="data:image/png;base64,${img}" style="display:block;width:100%;height:100%;object-fit:cover;object-position:${s.bottom ? 'bottom' : 'top'}">
    </div>
  </div></body></html>`;
}

const ICON = readFileSync(new URL('../app/assets/images/icon.png', import.meta.url)).toString('base64');
const FEATURE = `<html><body style="margin:0">
  <div style="width:1024px;height:500px;background:radial-gradient(circle at 25% 50%,#0B3A7A 0%,#02143B 70%);display:flex;align-items:center;gap:56px;padding:0 80px;box-sizing:border-box;
    font-family:'Noto Sans CJK TC','Noto Sans TC',sans-serif">
    <img src="data:image/png;base64,${ICON}" style="width:300px;height:300px;border-radius:64px;box-shadow:0 0 60px rgba(80,200,255,.45)">
    <div>
      <div style="font-size:92px;font-weight:900;color:#fff;line-height:1.1;text-shadow:0 0 24px rgba(80,200,255,.6)">勇敢學吧</div>
      <div style="font-size:34px;color:#9FE3FF;margin-top:20px">國中考前小練習・打魔王複習</div>
      <div style="font-size:26px;color:#C9D6EA;margin-top:12px">每日 5 題・AI 錯題講解・連勝養成</div>
    </div>
  </div></body></html>`;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
const render = async (html, w, h, path) => {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(html, { waitUntil: 'load' });
  await page.screenshot({ path, clip: { x: 0, y: 0, width: w, height: h } });
};
for (const [i, s] of (existsSync(SRC) ? SLIDES : []).entries()) {
  const n = String(i + 1).padStart(2, '0');
  await render(slideHtml(s, 1290, 2796), 1290, 2796, `${OUT}ios/${n}.png`);
  // App Store Connect 的 6.3 吋欄位只收 1206×2622（1290×2796 會被拒）
  await render(slideHtml(s, 1206, 2622), 1206, 2622, `${OUT}ios-63/${n}.png`);
  await render(slideHtml(s, 1080, 1920), 1080, 1920, `${OUT}android/${n}.png`);
  console.log('產生', n, s.title);
}
await render(FEATURE, 1024, 500, `${OUT}android/feature-graphic.png`);
console.log('產生 feature-graphic.png');
await browser.close();
