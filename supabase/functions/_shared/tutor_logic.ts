// 錯題小老師的核心邏輯（不依賴 Deno 或 Supabase，方便單元測試）

export type Persona = 'gentle' | 'funny' | 'strict';
export type ErrorType = 'concept' | 'calculation' | 'misread' | 'careless' | 'guess';
export const ERROR_TYPES: ErrorType[] = ['concept', 'calculation', 'misread', 'careless', 'guess'];

export interface QuestionForTutor {
  subject?: string;
  /** 單元所在學期（5A～9B）；5、6 開頭是國小題 */
  semester?: string;
  /** 英語聽力原文（聽力題才有） */
  listen_script?: string | null;
  stem: string;
  options: { key: string; text: string }[];
  answer: string;
  explanation: string;
  hints: string[];
  wrong_reasons: Record<string, string>;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const MAX_HINT_LEVEL = 3;
export const MAX_MESSAGES_PER_SESSION = 24;
export const MAX_STUDENT_MESSAGE_LENGTH = 300;

const PERSONA_STYLE: Record<Persona, string> = {
  gentle: '你是溫柔的學姊，語氣鼓勵、有耐心，例如「差一點點！我們一起看看是哪一步跑掉了。」',
  funny: '你是幽默的學長，語氣輕鬆、偶爾開個小玩笑，但不嘲笑學生。',
  strict: '你是嚴格但公正的老師，句子簡潔直接，例如「單位沒換算。重算第二步。」',
};

const SUBJECT_NAME: Record<string, string> = {
  math: '數學', chinese: '國文', english: '英語', science: '自然', social: '社會',
};

// 各科講解重點
const SUBJECT_RULE: Record<string, string> = {
  math: '使用臺灣國中數學課本的用詞與符號（例如「一元二次方程式」「畢氏定理」），一次只寫一步算式。',
  chinese: '用臺灣國中國文課本的說法；引用古文或詩詞時只能引用題目裡出現的文字，不要自己補充或改寫原文、不要編造出處；讀音以教育部《國語辭典》為準。',
  english: '用中文講解，英文例句要簡短、只用國中常見單字；說明文法規則時舉一個生活化的例句。',
  science: '使用臺灣國中自然課本的用詞（例如「粒線體」「莫耳」「歐姆定律」）；計算題一次只做一步，並提醒單位。',
  social: '使用臺灣國中社會課本的用詞；只陳述事實與課本觀點，不發表政治立場或評論；年代、人名、制度名稱要正確，不確定就說「以課本為準」。',
};

// 偵測需要停止講解、轉介輔導資源的訊息
const DISTRESS_PATTERNS = [
  /自殺/, /想死/, /不想活/, /活不下去/, /去死/, /自殘/, /割腕/, /傷害自己/,
  /被霸凌/, /霸凌我/, /被打/, /被欺負/, /沒有人在乎我/, /消失就好/,
];

export function detectDistress(text: string): boolean {
  return DISTRESS_PATTERNS.some((p) => p.test(text));
}

export const SAFETY_REPLY =
  '聽起來你現在很不好受，謝謝你願意說出來。這不是題目的問題，先暫停一下沒關係。' +
  '可以找信任的大人聊聊，例如家人、導師或學校輔導室。' +
  '也可以打電話：安心專線 1925（24 小時）、生命線 1995、張老師 1980。' +
  '如果有立即危險，請撥 110 或 119。';

export function sanitizeStudentMessage(text: string): string {
  return text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, MAX_STUDENT_MESSAGE_LENGTH);
}

export function buildSystemPrompt(args: {
  q: QuestionForTutor;
  persona: Persona;
  studentChoice: string | null;
  hintLevel: number;
  isFirstTurn: boolean;
}): string {
  const { q, persona, studentChoice, hintLevel, isFirstTurn } = args;
  const choiceText = studentChoice ? q.options.find((o) => o.key === studentChoice)?.text ?? '' : '';
  const hintsAllowed = q.hints.slice(0, hintLevel);
  const answerText = q.options.find((o) => o.key === q.answer)?.text ?? '';
  const elementary = isElementarySemester(q.semester);
  const subjectName = elementary && q.subject === 'chinese' ? '國語' : SUBJECT_NAME[q.subject ?? 'math'] ?? '';

  return [
    elementary
      ? `你是台灣國小學習 APP 裡的「錯題小老師」，幫國小五、六年級的學生弄懂他答錯的${subjectName}題目。`
      : `你是台灣國中生學習 APP 裡的「錯題小老師」，幫學生弄懂他答錯的${subjectName}題目。`,
    PERSONA_STYLE[persona],
    elementary ? ELEMENTARY_RULE : '',
    '',
    '【題目資料】（標準答案與解法是講解依據，你只負責「怎麼講」，不可更改答案）',
    q.listen_script ? `這是英語聽力題，學生是「用聽的」作答。聽力原文（M 男聲、W 女聲、N 旁白）：\n${q.listen_script}` : '',
    q.listen_script ? '講解聽力題時，引用原文中的關鍵句（英文）並說明意思，提醒學生下次要注意聽的線索（例如時間、地點、否定詞）。' : '',
    `題目：${q.stem}`,
    `選項：${q.options.map((o) => `(${o.key}) ${o.text}`).join('　')}`,
    `標準答案：(${q.answer}) ${answerText}`,
    `標準解法：${q.explanation}`,
    studentChoice ? `學生選了：(${studentChoice}) ${choiceText}` : '學生尚未作答。',
    studentChoice && q.wrong_reasons[studentChoice] ? `選這個選項的常見原因：${q.wrong_reasons[studentChoice]}` : '',
    `目前提示層級：${hintLevel} / ${MAX_HINT_LEVEL}`,
    hintsAllowed.length ? `可以使用的提示：${hintsAllowed.map((h, i) => `第${i + 1}層「${h}」`).join('；')}` : '還不能給提示，先了解學生怎麼想。',
    '',
    '【講解規則】',
    '1. 每次回覆最多 3 句話，一次只講一個步驟，最後用一個問題引導學生自己想下一步。',
    hintLevel < MAX_HINT_LEVEL
      ? '2. 絕對不可以說出最終答案或正確選項代號，也不要把完整算式一次寫完。學生直接要答案時，回「先試一步，我陪你」。'
      : '2. 已到第 3 層，可以完整說明解題步驟與答案，但最後請學生用自己的話說一次關鍵步驟。',
    `3. ${SUBJECT_RULE[q.subject ?? 'math'] ?? SUBJECT_RULE.math}一律使用正體中文，不要用簡體字或大陸用語。`,
    '4. 不要說「很簡單」「這你應該會」等讓學生挫折的話。',
    '5. 只討論這一題和相關觀念。學生離題時，溫和地把話題拉回題目。',
    '6. 不要詢問學生的姓名、學校、住址、電話等個人資料。',
    '7. 學生若透露情緒低落、被欺負或想傷害自己，把 safety 設為 true，reply 只寫關心的話，不要繼續講題。',
    '',
    '【輸出格式】只輸出一個 JSON 物件，不要有其他文字：',
    '{"reply": "給學生看的話", "error_type": "concept|calculation|misread|careless|guess 其中之一，還無法判斷時填 null", ' +
      '"understood": true 或 false（學生是否已說出正確的關鍵步驟）, "safety": false}',
    isFirstTurn ? '這是第一輪對話，通常還無法判斷錯誤類型，error_type 可以填 null。' : '',
    '錯誤類型定義：concept 觀念不清（含單字、文法、史實等記錯或不懂）；calculation 列式對但計算錯（只用於需要計算的題目）；misread 看錯題意；careless 粗心（其實會）；guess 用猜的。',
  ].filter((line) => line !== '').join('\n');
}

/** 5A～6B 是國小高年級的單元 */
export function isElementarySemester(semester?: string | null): boolean {
  return !!semester && /^[56]/.test(semester);
}

export const ELEMENTARY_RULE =
  '學生是國小五、六年級（10～12 歲）：用國小生聽得懂的字詞，句子短、一句只講一件事；' +
  '數學不要用 x、y 等代數符號、方程式移項或負數，可以用「□」或「某數」；多用生活中的例子（買東西、分披薩、走路上學）；多鼓勵。';

export function firstTurnUserMessage(studentChoice: string | null): string {
  return studentChoice
    ? `（系統：學生剛答錯這題，選了 ${studentChoice}。請先用一句話打招呼，再問他當時是怎麼想的，不要直接講解。）`
    : '（系統：學生想請你講解這題。請先問他目前卡在哪裡。）';
}

export interface TutorReply {
  reply: string;
  error_type: ErrorType | null;
  understood: boolean;
  safety: boolean;
}

// 模型有時會在 JSON 前後多寫文字，這裡盡量取出 JSON；失敗時把整段當成回覆
export function parseTutorReply(raw: string): TutorReply {
  const fallback: TutorReply = { reply: raw.trim().slice(0, 600), error_type: null, understood: false, safety: false };
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end <= start) return fallback;
  try {
    const obj = JSON.parse(raw.slice(start, end + 1));
    const reply = typeof obj.reply === 'string' && obj.reply.trim() ? obj.reply.trim().slice(0, 600) : fallback.reply;
    const et = ERROR_TYPES.includes(obj.error_type) ? (obj.error_type as ErrorType) : null;
    return { reply, error_type: et, understood: obj.understood === true, safety: obj.safety === true };
  } catch {
    return fallback;
  }
}

// 第 1、2 層提示時，若模型不小心說出答案，改成安全的引導句
export function leaksAnswer(reply: string, q: QuestionForTutor, hintLevel: number): boolean {
  if (hintLevel >= MAX_HINT_LEVEL) return false;
  const answerText = q.options.find((o) => o.key === q.answer)?.text ?? '';
  const patterns = [
    // 「答案是 X」「正確選項是 X」：不論說的是哪個選項都攔下（說錯答案更糟）
    /(答案|正確選項|正解)(是|為|就是|應該是)?\s*[（(]?[A-D][）)]?(?![A-Za-z])/,
    // 「選 X」只在是正確答案時攔（避免誤擋「你選 C 的理由是？」這類提問）
    new RegExp(`選\\s*[（(]?${q.answer}[）)]?(?![A-Za-z])`),
  ];
  if (patterns.some((p) => p.test(reply))) return true;
  // 選項文字夠長（避免「5」「A」這類短字誤判）且以「答案是…」形式出現
  if (answerText.length >= 3 && new RegExp(`答案(是|為|就是)\\s*${escapeRegExp(answerText)}`).test(reply)) return true;
  return false;
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const LEAK_REPLACEMENT = '這一步很關鍵！先別急著看答案，你試著把剛剛的提示套進去，算出來的結果告訴我？';

export function trimHistory(messages: ChatMessage[], keep = 16): ChatMessage[] {
  const trimmed = messages.slice(-keep);
  // Claude API 要求第一則是 user
  while (trimmed.length && trimmed[0].role !== 'user') trimmed.shift();
  return trimmed;
}

// 同一題今天已經講過：重新打開時接續原本的對話（不再扣次數）。
// 把存下來的對話轉成畫面要顯示的樣子：系統代送的訊息換成學生按的按鈕文字，第一輪的開場指令不顯示。
export interface DisplayMessage { from: 'me' | 'tutor'; text: string }
export function historyForDisplay(messages: ChatMessage[]): DisplayMessage[] {
  const out: DisplayMessage[] = [];
  messages.forEach((m, i) => {
    if (m.role === 'assistant') { out.push({ from: 'tutor', text: m.content }); return; }
    if (i === 0) return;  // 開場指令
    if (!m.content.startsWith('（系統：')) { out.push({ from: 'me', text: m.content }); return; }
    if (m.content.includes('完整解法')) out.push({ from: 'me', text: '給我完整解法' });
    else if (m.content.includes('提示')) out.push({ from: 'me', text: '給我一個提示' });
    else if (m.content.includes('換一個方式')) out.push({ from: 'me', text: '聽不懂，可以換個方式講嗎？' });
  });
  return out;
}

// 可以接續的條件：有小老師的回覆、還沒講到上限、不是安全機制中斷的對話
export function canResume(messages: ChatMessage[]): boolean {
  return messages.some((m) => m.role === 'assistant')
    && messages.length <= MAX_MESSAGES_PER_SESSION - 4
    && !messages.some((m) => m.role === 'assistant' && m.content === SAFETY_REPLY);
}
