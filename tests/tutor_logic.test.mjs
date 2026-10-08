// 小老師邏輯測試：node tutor_logic.test.mjs（Node 22.18 以上可直接載入 .ts）
import assert from 'node:assert/strict';
import {
  buildSystemPrompt, canResume, detectDistress, firstTurnUserMessage, historyForDisplay, leaksAnswer, parseTutorReply,
  sanitizeStudentMessage, trimHistory, SAFETY_REPLY,
} from '../supabase/functions/_shared/tutor_logic.ts';

const q = {
  stem: '直角三角形兩股長 6 和 8，斜邊長是多少？',
  options: [{ key: 'A', text: '14' }, { key: 'B', text: '10 公尺' }, { key: 'C', text: '48' }, { key: 'D', text: '2' }],
  answer: 'B',
  explanation: '6² + 8² = 100，斜邊 = 10。',
  hints: ['畢氏定理是什麼？', '先算 6² + 8²。', '開根號'],
  wrong_reasons: { A: '兩股直接相加' },
};

let passed = 0;
const test = (name, fn) => {
  try { fn(); passed++; console.log('  ✓ ' + name); }
  catch (e) { console.error('  ✗ ' + name + '\n    ' + e.message); process.exitCode = 1; }
};

console.log('小老師邏輯測試');

test('提示層級 0：提示詞禁止說出答案，且不提供任何提示內容', () => {
  const p = buildSystemPrompt({ q, persona: 'gentle', studentChoice: 'A', hintLevel: 0, isFirstTurn: true });
  assert.match(p, /絕對不可以說出最終答案/);
  assert.match(p, /還不能給提示/);
  assert.ok(!p.includes('先算 6² + 8²'));
  assert.match(p, /兩股直接相加/, '帶入學生選項的常見錯誤原因');
  assert.match(p, /溫柔的學姊/);
});

test('提示層級 2：只開放前 2 層提示', () => {
  const p = buildSystemPrompt({ q, persona: 'strict', studentChoice: 'A', hintLevel: 2, isFirstTurn: false });
  assert.ok(p.includes('先算 6² + 8²'));
  assert.ok(!p.includes('第3層'));
  assert.match(p, /嚴格/);
});

test('提示層級 3：允許完整解法', () => {
  const p = buildSystemPrompt({ q, persona: 'funny', studentChoice: null, hintLevel: 3, isFirstTurn: false });
  assert.match(p, /可以完整說明解題步驟與答案/);
});

test('依科目調整講解規則：國文不可自編引文、社會保持中立、英語用中文講解', () => {
  const zh = buildSystemPrompt({ q: { ...q, subject: 'chinese' }, persona: 'gentle', studentChoice: 'A', hintLevel: 0, isFirstTurn: true });
  assert.match(zh, /答錯的國文題目/);
  assert.match(zh, /不要編造出處/);
  const so = buildSystemPrompt({ q: { ...q, subject: 'social' }, persona: 'gentle', studentChoice: 'A', hintLevel: 0, isFirstTurn: true });
  assert.match(so, /不發表政治立場/);
  const en = buildSystemPrompt({ q: { ...q, subject: 'english' }, persona: 'gentle', studentChoice: 'A', hintLevel: 0, isFirstTurn: true });
  assert.match(en, /用中文講解/);
  const m = buildSystemPrompt({ q, persona: 'gentle', studentChoice: 'A', hintLevel: 0, isFirstTurn: true });
  assert.match(m, /數學題目/, '沒有 subject 時預設數學');
});

test('英語聽力題：提示詞帶入聽力原文與講解方式', () => {
  const p = buildSystemPrompt({ q: { ...q, subject: 'english', listen_script: 'W: Are you free on Saturday?\nM: Sorry, I have to visit my grandma.' },
    persona: 'gentle', studentChoice: 'A', hintLevel: 0, isFirstTurn: true });
  assert.match(p, /英語聽力題/);
  assert.match(p, /visit my grandma/);
  assert.match(p, /引用原文中的關鍵句/);
  const plain = buildSystemPrompt({ q, persona: 'gentle', studentChoice: 'A', hintLevel: 0, isFirstTurn: true });
  assert.ok(!/聽力/.test(plain));
});

test('偵測到情緒低落或霸凌字詞', () => {
  assert.ok(detectDistress('我好想死'));
  assert.ok(detectDistress('班上同學一直霸凌我'));
  assert.ok(!detectDistress('這題好難，我想不到'));
  assert.match(SAFETY_REPLY, /1925/);
});

test('解析模型回覆：正常 JSON、前後有多餘文字、壞掉的 JSON', () => {
  const a = parseTutorReply('{"reply":"你先想想看","error_type":"misread","understood":false,"safety":false}');
  assert.equal(a.reply, '你先想想看');
  assert.equal(a.error_type, 'misread');
  const b = parseTutorReply('好的：\n{"reply":"嗨","error_type":"unknown","understood":true}\n謝謝');
  assert.equal(b.reply, '嗨');
  assert.equal(b.error_type, null, '不合法的錯誤類型改成 null');
  assert.equal(b.understood, true);
  const c = parseTutorReply('這不是 JSON');
  assert.equal(c.reply, '這不是 JSON');
});

test('防止第 1、2 層就洩漏答案；第 3 層可以說', () => {
  assert.ok(leaksAnswer('答案是 B 喔', q, 1));
  assert.ok(leaksAnswer('所以要選(B)', q, 2));
  assert.ok(leaksAnswer('答案是10 公尺', q, 1));
  assert.ok(!leaksAnswer('你先算算看 6 的平方是多少？', q, 1));
  assert.ok(!leaksAnswer('答案是 B', q, 3));
  assert.ok(leaksAnswer('好啦，答案是 C，直接選 C 就對了。', q, 1), '說出錯誤答案也要攔');
  assert.ok(leaksAnswer('正確選項是(A)', q, 2));
  assert.ok(!leaksAnswer('你選 C 的理由是什麼？', q, 1), '提到學生自己選的選項不算洩漏');
});

test('學生訊息會去掉控制字元並限制長度', () => {
  assert.equal(sanitizeStudentMessage('  運費\u0000！ '), '運費！');
  assert.equal(sanitizeStudentMessage('字'.repeat(500)).length, 300);
});

test('對話紀錄只保留最近幾則，且第一則是學生', () => {
  const msgs = Array.from({ length: 20 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: String(i) }));
  const t = trimHistory(msgs, 5);
  assert.equal(t[0].role, 'user');
  assert.ok(t.length <= 5);
});

test('接續對話：系統指令換成按鈕文字、開場指令不顯示；安全中斷的對話不接續', () => {
  const msgs = [
    { role: 'user', content: firstTurnUserMessage('A') }, { role: 'assistant', content: '你選了 A，怎麼想的？' },
    { role: 'user', content: '算到一半卡住' }, { role: 'assistant', content: '我們看第一步' },
    { role: 'user', content: '（系統：學生按了「給我下一個提示」，請給第 1 層提示。）' }, { role: 'assistant', content: '提示 1' },
    { role: 'user', content: '（系統：學生按了「給我完整解法」。請完整說明步驟與答案。）' }, { role: 'assistant', content: '解法' },
    { role: 'user', content: '（系統：學生說聽不懂，請換一個方式講，例如用生活中的例子或拆成更小的步驟。）' }, { role: 'assistant', content: '換個講法' },
  ];
  assert.deepEqual(historyForDisplay(msgs).map((m) => m.from + ':' + m.text), [
    'tutor:你選了 A，怎麼想的？', 'me:算到一半卡住', 'tutor:我們看第一步', 'me:給我一個提示', 'tutor:提示 1',
    'me:給我完整解法', 'tutor:解法', 'me:聽不懂，可以換個方式講嗎？', 'tutor:換個講法',
  ]);
  assert.equal(canResume(msgs), true);
  assert.equal(canResume([]), false);
  assert.equal(canResume([...msgs, { role: 'user', content: '…' }, { role: 'assistant', content: SAFETY_REPLY }]), false);
  assert.equal(canResume(Array.from({ length: 22 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: 'x' }))), false);
});

test('國小題：小老師用國小生的說法，國文改稱國語，不用代數符號', () => {
  const sys = buildSystemPrompt({ q: { ...q, subject: 'chinese', semester: '5B' }, persona: 'gentle', studentChoice: 'A', hintLevel: 0, isFirstTurn: true });
  assert.match(sys, /國小五、六年級/);
  assert.match(sys, /國語題目/);
  assert.match(sys, /不要用 x、y/);
  const jr = buildSystemPrompt({ q: { ...q, subject: 'math', semester: '8A' }, persona: 'gentle', studentChoice: 'A', hintLevel: 0, isFirstTurn: true });
  assert.doesNotMatch(jr, /國小五、六年級/);
});

console.log(`\n${passed} 項通過${process.exitCode ? '，有失敗項目' : ''}`);
