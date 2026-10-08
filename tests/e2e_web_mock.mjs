// 前端畫面測試：用 Playwright 開啟網頁版 App，攔截並模擬 Supabase 回應，走一遍主要流程並截圖。
// 用法：先 `npx expo export --platform web --output-dir /tmp/exp-web`（環境變數 URL 用 https://example.supabase.co），
//      在 /tmp/exp-web 啟動靜態伺服器（port 8765），再執行 node tests/e2e_web_mock.mjs <截圖資料夾>
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';

const OUT = process.argv[2] ?? '/tmp/e2e';
mkdirSync(OUT, { recursive: true });
const BANK = JSON.parse(readFileSync(new URL('../supabase/seed/questions_math.json', import.meta.url), 'utf8'));
const UNITS = [...new Map(BANK.map((q) => [q.unit, q])).keys()];
const unitTitle = (id) => ({
  'M-8A-1': '乘法公式與多項式', 'M-8A-2': '平方根與畢氏定理', 'M-8A-3': '因式分解', 'M-8A-4': '一元二次方程式',
}[id] ?? id);

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const USER_ID = '11111111-1111-1111-1111-111111111111';
const exp = Math.floor(Date.now() / 1000) + 3600 * 24;
const token = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: USER_ID, exp, role: 'authenticated', aud: 'authenticated' })}.sig`;
const user = { id: USER_ID, aud: 'authenticated', role: 'authenticated', email: 'student@example.com', app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() };
const session = { access_token: token, refresh_token: 'r', token_type: 'bearer', expires_in: 86400, expires_at: exp, user };

function publicQ(q) {
  return {
    id: q.id, unit_id: q.unit, concept: q.concept, stem: q.stem,
    options: q.options.map((t, i) => ({ key: 'ABCD'[i], text: t })), difficulty: q.difficulty, source: 'original',
    subject: 'math', semester: q.unit.split('-')[1], unit_title: unitTitle(q.unit),
  };
}

async function run(role) {
  const state = { answered: 2, xp: 120, mistakes: [], tutorLimit: false };
  const profile = { id: USER_ID, role, nickname: role === 'parent' ? '媽媽' : '小安', grade: role === 'parent' ? null : 8,
    textbook_version: '康軒', tutor_persona: 'gentle', premium_until: null, invite_code: 'K7P2QX9M', ai_consent_at: null };
  const errors = [];
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: Number(process.env.DPR ?? 2) });
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console ' + m.text()); });

  await page.route('https://example.supabase.co/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;
    const body = req.postDataJSON?.() ?? null;
    const json = (data, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data), headers: { 'access-control-allow-origin': '*' } });
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' } });

    if (path === '/auth/v1/user') return json(user);
    if (path === '/auth/v1/token') return json(session);
    if (path === '/rest/v1/profiles') return req.method() === 'PATCH' ? route.fulfill({ status: 204 }) : json(profile);
    if (path === '/rest/v1/questions_public') {
      const id = url.searchParams.get('id')?.replace('eq.', '');
      return json(publicQ(BANK.find((q) => q.id === id)));
    }
    if (path === '/rest/v1/top_three_applications') return json([]);
    if (path === '/rest/v1/parent_links') return json([{ student_id: 'kid-1' }]);
    const rpc = path.replace('/rest/v1/rpc/', '');
    switch (rpc) {
      case 'give_ai_consent': profile.ai_consent_at = new Date().toISOString(); return json(null);
      case 'my_parents': return json([{ parent_id: 'mom-1', nickname: '小安媽媽', linked_at: new Date().toISOString() }]);
      case 'get_home': {
        const days = [...Array(7)].map((_, i) => { const d = new Date(Date.now() - (6 - i) * 864e5); return d.toISOString().slice(0, 10); });
        return json({ nickname: '小安', grade: 8, textbook: '康軒', persona: 'gentle', xp: state.xp, streak: 23, longest_streak: 30,
          freeze_cards: 2, premium: false, premium_until: null, subscribed: false, tutor_used_today: 1, tutor_limit_today: 3, daily_goal: 5, today_answered: state.answered,
          due_reviews: 1, pending_mistakes: state.mistakes.length,
          week: days.map((d, i) => ({ day: d, met: i < 3 || (i > 3 && i < 6), froze: i === 3 })), invite_code: 'K7P2QX9M' });
      }
      case 'get_units':
        if (body?.p_subject && body.p_subject !== 'math') return json([]);
        return json(UNITS.map((u) => {
          const [, sem, seq] = u.split('-');
          const total = BANK.filter((q) => q.unit === u).length;
          return { id: u, semester: sem, seq: Number(seq), title: unitTitle(u), total, mastered: u === 'M-8A-1' ? 2 : sem < '8A' ? total : 0, attempted: u === 'M-8A-1' ? 3 : 0,
            answered: u === 'M-8A-1' ? 5 : 0, correct: u === 'M-8A-1' ? 2 : 0 };
        }));
      case 'next_questions':
      case 'practice_questions':
        return json(BANK.filter((q) => body.p_unit_ids.includes(q.unit)).slice(0, 3).map((q) => ({ ...publicQ(q), seen: false })));
      case 'daily_questions':
        return json(BANK.filter((q) => q.unit === 'M-8A-1').slice(0, 3).map((q) => ({ ...publicQ(q), seen: false })));
      case 'my_mock_exams':
      case 'child_mock_exams':
        return json([]);
      case 'save_mock_exam':
        return json({ id: 'm1', score: 0, correct: 0, total: 1, previous_score: null });
      case 'get_limits':
        return json({ free_daily_questions: 30, free_daily_tutor: 3, premium_daily_tutor: 50 });
      case 'due_reviews': return json([]);
      case 'list_mistakes':
        return json(state.mistakes.map((m) => ({ question: publicQ(BANK.find((q) => q.id === m.id)), status: m.status, error_type: m.error_type, next_review: '2026-09-27', wrong_count: 1, created_at: new Date().toISOString() })));
      case 'similar_question': {
        const src = BANK.find((q) => q.id === body.p_question_id);
        return json([publicQ(BANK.find((q) => q.unit === src.unit && q.id !== src.id && q.concept === src.concept) ?? BANK.find((q) => q.unit === src.unit && q.id !== src.id))]);
      }
      case 'question_solution': {
        const q = BANK.find((x) => x.id === body.p_question_id);
        return json({ answer: q.answer, explanation: q.explanation, hints: q.hints, wrong_reasons: q.wrong ?? {},
          options: q.options.map((t, i) => ({ key: 'ABCD'[i], text: t })) });
      }
      case 'submit_answer': {
        const q = BANK.find((x) => x.id === body.p_question_id);
        const correct = body.p_choice === q.answer;
        state.answered += 1;
        let ms = null;
        if (!correct && !body.p_for_mistake) { state.mistakes.push({ id: q.id, status: 'pending', error_type: null }); ms = 'pending'; }
        if (correct && body.p_for_mistake) { const m = state.mistakes.find((x) => x.id === body.p_for_mistake); if (m) { m.status = 'learning'; ms = 'learning'; } }
        if (correct) state.xp += 10;
        return json({ correct, answer: q.answer, explanation: q.explanation, wrong_reason: correct ? null : q.wrong[body.p_choice],
          xp_gained: correct ? 10 : 0, xp_total: state.xp, today_answered: state.answered, daily_goal: 5,
          streak: state.answered >= 5 ? 24 : 23, streak_up: state.answered === 5, freeze_cards: 2, mistake_status: ms });
      }
      case 'get_child_summary': {
        const days = [...Array(7)].map((_, i) => ({ day: new Date(Date.now() - (6 - i) * 864e5).toISOString().slice(0, 10), answered: [12, 8, 15, 0, 10, 14, 6][i], correct: [9, 6, 11, 0, 7, 10, 5][i], froze: i === 3 }));
        return json({ nickname: '小安', grade: 8, streak: 23, days, by_subject: [{ subject: 'math', answered: 65, correct: 48 }],
          weak_units: [{ title: '平方根與畢氏定理', semester: '8A', answered: 12, pct: 52 }], graduated_this_week: 5, error_types: { misread: 4, calculation: 2 } });
      }
    }
    if (path === '/functions/v1/tutor') {
      if (state.tutorLimit && body.action === 'start') return json({ error: 'daily_tutor_limit', limit: 3, premium: false }, 429);
      const replies = {
        start: '嗨！差一點點～你當時是怎麼想的呢？',
        reply: '原來如此！先看看題目要求的是什麼，再想想第一步要做什麼？',
        hint: '提示：想想看課本裡的公式，先把式子展開試試看？',
        reteach: '換個方式想：把它想成分蛋糕，每一份要一樣大。',
      };
      return json({ session_id: 's1', reply: replies[body.action], hint_level: body.action === 'hint' ? 1 : 0, error_type: body.action === 'reply' ? 'misread' : null });
    }
    errors.push('UNMOCKED ' + req.method() + ' ' + path);
    return json({ message: 'unmocked' }, 404);
  });

  // 單頁應用：沒有副檔名的路徑都回傳 index.html
  const INDEX = await (await fetch('http://localhost:8765/index.html')).text();
  await page.route('http://localhost:8765/**', (route) => {
    const u = new URL(route.request().url());
    if (!/\.[a-z0-9]+$/i.test(u.pathname)) return route.fulfill({ status: 200, contentType: 'text/html', body: INDEX });
    return route.continue();
  });

  if (role !== 'signedout') {
    await page.addInitScript(([s]) => { localStorage.setItem('sb-example-auth-token', JSON.stringify(s)); }, [session]);
  }
  const shot = async (name) => { await page.waitForTimeout(700); await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: process.env.FULLPAGE !== '0' }); };
  const tap = async (text) => { await page.getByText(text, { exact: true }).first().click(); };

  await page.goto('http://localhost:8765/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  if (role === 'signedout') {
    await tap('忘記密碼？');
    await shot('s1-forgot');
    await browser.close();
    return errors;
  }
  if (role === 'parent') {
    await shot('p1-parent-home');
    await browser.close();
    return errors;
  }
  await shot('01-home');

  await page.goto('http://localhost:8765/learn', { waitUntil: 'networkidle' });
  await shot('02-learn');

  await page.getByRole('button', { name: '看第一次段考的單元' }).click();
  await page.getByRole('button', { name: '練習單元 乘法公式與多項式' }).click();
  await page.waitForTimeout(1200);
  await shot('03-quiz');
  const first = BANK.filter((q) => q.unit === 'M-8A-1')[0];
  const wrongKey = 'ABCD'.split('').find((k) => k !== first.answer);
  await page.getByLabel(new RegExp(`^選項 ${wrongKey}：`)).click();
  await tap('檢查答案');
  await shot('04-quiz-wrong');

  await tap('找小老師');
  await page.waitForTimeout(800);
  await shot('05a-ai-consent');
  await tap('我同意，開始使用');
  await page.waitForTimeout(1500);
  await shot('05-tutor-start');
  await tap('算到一半卡住');
  await page.waitForTimeout(800);
  await tap('給我提示');
  await page.waitForTimeout(800);
  await shot('06-tutor-hint');
  await tap('我懂了，驗收');
  await page.waitForTimeout(1000);
  const sim = BANK.find((q) => q.unit === first.unit && q.id !== first.id && q.concept === first.concept);
  await page.getByLabel(new RegExp(`^選項 ${sim.answer}：`)).last().click();
  await page.getByText('檢查答案', { exact: true }).last().click();
  await shot('07-tutor-check-correct');

  await page.goto('http://localhost:8765/mistakes', { waitUntil: 'networkidle' });
  await shot('08-mistakes');
  await page.goto('http://localhost:8765/me', { waitUntil: 'networkidle' });
  await shot('09-me');
  await page.goto('http://localhost:8765/top-three', { waitUntil: 'networkidle' });
  await shot('10-top-three');
  await page.goto('http://localhost:8765/paywall', { waitUntil: 'networkidle' });
  await shot('11-paywall');
  state.tutorLimit = true;
  await page.goto(`http://localhost:8765/tutor?questionId=${first.id}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await shot('12-tutor-limit');
  await browser.close();
  return errors;
}

const e1 = await run('student');
const e2 = await run('parent');
const e3 = await run('signedout');
const all = [...e1, ...e2, ...e3].filter((e) => !/Password field is not contained|status of 429/.test(e)); // 429 是刻意模擬的小老師次數用完
console.log(all.length ? '問題：\n' + all.join('\n') : '流程完成，沒有頁面錯誤');
