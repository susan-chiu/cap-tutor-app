// 產生商店截圖：node scripts/make_store_images.mjs <App 截圖資料夾（3 倍解析度）>
// 輸出到 store/ios（1290×2796）、store/android（1080×1920）與 store/android/feature-graphic.png（1024×500）
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync } from 'node:fs';
const require = createRequire(new URL('../tests/package.json', import.meta.url));
const { chromium } = require('playwright');

const SRC = process.argv[2] ?? '/tmp/e2e3';
const OUT = new URL('../store/', import.meta.url).pathname;
mkdirSync(OUT + 'ios', { recursive: true });
mkdirSync(OUT + 'android', { recursive: true });

const SLIDES = [
  { file: '01-home.png', title: '每天 5 題，連勝不中斷', sub: '像玩遊戲一樣養成讀書習慣', dark: true },
  { file: '04-quiz-wrong.png', title: '答錯馬上知道錯在哪', sub: '每個錯誤選項都有常見原因與解析', dark: false },
  { file: '06-tutor-hint.png', title: 'AI 小老師一步步帶你想', sub: '不直接給答案，陪你自己想出來', dark: true },
  { file: '07-tutor-check-correct.png', title: '換一題驗收，真的學會', sub: '錯題隔天、3 天、7 天再複習', dark: false },
  { file: '02-learn.png', title: '七上到九下，照學期複習', sub: '依 108 課綱單元，段考前組複習卷', dark: true },
  { file: 'p1-parent-home.png', title: '家長也能看見進步', sub: '綁定孩子帳號，看練習天數與弱點單元', dark: false },
];

const CLAY = '#C2511B';
const CREAM = '#F6F3EC';
const INK = '#1C2528';

function slideHtml(s, w, h) {
  const img = readFileSync(`${SRC}/${s.file}`).toString('base64');
  const scale = w / 1290;
  const phoneW = Math.round(w * 0.78);
  return `<html><body style="margin:0">
  <div style="width:${w}px;height:${h}px;overflow:hidden;background:${s.dark ? CLAY : CREAM};
    font-family:'Noto Sans CJK TC','Noto Sans TC','PingFang TC',sans-serif;display:flex;flex-direction:column;align-items:center">
    <div style="padding:${Math.round(150 * scale)}px ${Math.round(80 * scale)}px ${Math.round(70 * scale)}px;text-align:center">
      <div style="font-size:${Math.round(96 * scale)}px;font-weight:900;line-height:1.25;color:${s.dark ? '#FFFFFF' : INK}">${s.title}</div>
      <div style="margin-top:${Math.round(28 * scale)}px;font-size:${Math.round(48 * scale)}px;font-weight:500;color:${s.dark ? '#FBE9DF' : '#5C6663'}">${s.sub}</div>
    </div>
    <div style="width:${phoneW}px;border-radius:${Math.round(64 * scale)}px;overflow:hidden;
      border:${Math.round(14 * scale)}px solid ${INK};box-shadow:0 ${Math.round(30 * scale)}px ${Math.round(80 * scale)}px rgba(0,0,0,.25);background:${CREAM}">
      <img src="data:image/png;base64,${img}" style="display:block;width:100%">
    </div>
  </div></body></html>`;
}

const FEATURE = `<html><body style="margin:0">
  <div style="width:1024px;height:500px;background:${CLAY};display:flex;align-items:center;gap:56px;padding:0 80px;box-sizing:border-box;
    font-family:'Noto Sans CJK TC','Noto Sans TC',sans-serif">
    <svg width="220" height="220" viewBox="0 0 100 100">
      <path d="M22 20 h56 a12 12 0 0 1 12 12 v30 a12 12 0 0 1 -12 12 h-30 l-14 12 v-12 h-12 a12 12 0 0 1 -12 -12 v-30 a12 12 0 0 1 12 -12 z" fill="#FFF6EC"/>
      <path d="M34 47 l10 10 l22 -22" fill="none" stroke="${CLAY}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="84" cy="18" r="6" fill="#FFB067"/>
    </svg>
    <div>
      <div style="font-size:76px;font-weight:900;color:#fff;line-height:1.1">會考小老師</div>
      <div style="font-size:34px;color:#FBE9DF;margin-top:18px">每日 5 題・AI 錯題講解・連勝養成</div>
    </div>
  </div></body></html>`;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
const render = async (html, w, h, path) => {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(html, { waitUntil: 'load' });
  await page.screenshot({ path, clip: { x: 0, y: 0, width: w, height: h } });
};
for (const [i, s] of SLIDES.entries()) {
  const n = String(i + 1).padStart(2, '0');
  await render(slideHtml(s, 1290, 2796), 1290, 2796, `${OUT}ios/${n}.png`);
  await render(slideHtml(s, 1080, 1920), 1080, 1920, `${OUT}android/${n}.png`);
  console.log('產生', n, s.title);
}
await render(FEATURE, 1024, 500, `${OUT}android/feature-graphic.png`);
console.log('產生 feature-graphic.png');
await browser.close();
