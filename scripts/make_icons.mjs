// 產生 App 圖示：node scripts/make_icons.mjs（需要 tests 資料夾已安裝 playwright）
// 圖案：小老師的對話框＋打勾，代表「錯題弄懂了」。原創設計，可自行替換。
import { createRequire } from 'node:module';
const require = createRequire(new URL('../tests/package.json', import.meta.url));
const { chromium } = require('playwright');

const OUT = new URL('../app/assets/images/', import.meta.url).pathname;
const CLAY = '#C2511B';
const CREAM = '#FFF6EC';
const FLAME = '#FFB067';

// 對話框＋打勾（以 100×100 座標設計）
const glyph = (bubble, check, spark = true) => `
  <path d="M22 20 h56 a12 12 0 0 1 12 12 v30 a12 12 0 0 1 -12 12 h-30 l-14 12 v-12 h-12 a12 12 0 0 1 -12 -12 v-30 a12 12 0 0 1 12 -12 z" fill="${bubble}"/>
  <path d="M34 47 l10 10 l22 -22" fill="none" stroke="${check}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
  ${spark ? `<circle cx="84" cy="18" r="6" fill="${FLAME}"/>` : ''}`;

// 單色版：白色對話框，打勾的部分挖空
const monochrome = `
  <defs><mask id="cut"><rect width="100" height="100" fill="white"/>
    <path d="M34 47 l10 10 l22 -22" fill="none" stroke="black" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></mask></defs>
  <path mask="url(#cut)" d="M22 20 h56 a12 12 0 0 1 12 12 v30 a12 12 0 0 1 -12 12 h-30 l-14 12 v-12 h-12 a12 12 0 0 1 -12 -12 v-30 a12 12 0 0 1 12 -12 z" fill="#FFFFFF"/>`;

const svg = (size, body, bg = 'none') => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  ${bg !== 'none' ? `<rect width="100" height="100" fill="${bg}"/>` : ''}${body}</svg>`;

// 置中縮放：scale 為圖案佔畫面比例
const placed = (inner, scale) => `<g transform="translate(${50 - 50 * scale} ${50 - 50 * scale}) scale(${scale})">${inner}</g>`;

const jobs = [
  // iOS／通用圖示：不透明底色（App Store 不接受透明）
  { file: 'icon.png', size: 1024, body: placed(glyph(CREAM, CLAY), 0.78), bg: CLAY, opaque: true },
  // Android 自適應：背景＋前景（圖案要在中間 66% 安全範圍內）
  { file: 'android-icon-background.png', size: 512, body: '', bg: CLAY, opaque: true },
  { file: 'android-icon-foreground.png', size: 512, body: placed(glyph(CREAM, CLAY), 0.56) },
  // Android 單色（主題圖示）：只用白色
  { file: 'android-icon-monochrome.png', size: 432, body: placed(monochrome, 0.56) },
  // 啟動畫面：米色背景上的橘色對話框
  { file: 'splash-icon.png', size: 400, body: placed(glyph(CLAY, CREAM), 0.9) },
  { file: 'favicon.png', size: 48, body: placed(glyph(CREAM, CLAY, false), 0.86), bg: CLAY, opaque: true },
];

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
for (const j of jobs) {
  await page.setViewportSize({ width: j.size, height: j.size });
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg(j.size, j.body, j.bg)}</body></html>`);
  await page.locator('svg').screenshot({ path: OUT + j.file, omitBackground: !j.opaque });
  console.log('產生', j.file);
}
await browser.close();
