export const C = {
  bg: '#F6F3EC',
  card: '#FFFFFF',
  line: '#E6E0D4',
  lineStrong: '#D5CEC0',
  ink: '#1C2528',
  inkSoft: '#3A4A4E',
  muted: '#5C6663',
  faint: '#8A918E',
  accent: '#C2511B',
  accentDark: '#9A3F12',
  accentSoft: '#FBE9DF',
  green: '#1E6B61',
  greenDark: '#134A42',
  greenSoft: '#DDF0E8',
  mint: '#9FD9C9',
  red: '#B3261E',
  redDark: '#8C1D18',
  redSoft: '#FCE3E1',
  flame: '#FF8A3D',
  night: '#1C2528',
  nightSoft: '#3A4A4E',
} as const;

export const radius = { sm: 10, md: 14, lg: 20, pill: 999 } as const;

/** 國中學期 */
export const SEMESTERS = [
  { id: '7A', label: '七上' },
  { id: '7B', label: '七下' },
  { id: '8A', label: '八上' },
  { id: '8B', label: '八下' },
  { id: '9A', label: '九上' },
  { id: '9B', label: '九下' },
] as const;
/** 國小高年級學期 */
export const ELEM_SEMESTERS = [
  { id: '5A', label: '五上' },
  { id: '5B', label: '五下' },
  { id: '6A', label: '六上' },
  { id: '6B', label: '六下' },
] as const;
/** 全部學期（查標籤用） */
export const ALL_SEMESTERS = [...ELEM_SEMESTERS, ...SEMESTERS] as const;

export type SemesterId = (typeof ALL_SEMESTERS)[number]['id'];

/** 五、六年級是國小 */
export const isElementary = (grade: number | null | undefined) => !!grade && grade <= 6;
export const isElementarySemester = (sem: string | null | undefined) => !!sem && /^[56]/.test(sem);
export const semestersFor = (grade: number | null | undefined) => (isElementary(grade) ? ELEM_SEMESTERS : SEMESTERS);
export const semesterLabel = (id: string) => ALL_SEMESTERS.find((s) => s.id === id)?.label ?? id;
/** 選到的學期／科目不在這個學制的清單裡時，改用預設值 */
export const validSemester = (grade: number | null | undefined, pick: SemesterId, fallback: SemesterId | null): SemesterId =>
  semestersFor(grade).some((x) => x.id === pick) ? pick : fallback ?? semestersFor(grade)[0].id;
export const GRADES = [5, 6, 7, 8, 9] as const;
export const gradeLabel = (g: number) => `${['五', '六', '七', '八', '九'][g - 5] ?? g}年級`;

export const SUBJECTS = [
  { id: 'math', label: '數學' },
  { id: 'chinese', label: '國文' },
  { id: 'english', label: '英語' },
  { id: 'science', label: '自然' },
  { id: 'social', label: '社會' },
] as const;
export type SubjectId = (typeof SUBJECTS)[number]['id'];
export const ALL_SUBJECTS: SubjectId[] = SUBJECTS.map((s) => s.id);
/** 國小版的科目（國文在國小叫「國語」） */
export const ELEM_SUBJECTS = [
  { id: 'chinese', label: '國語' },
  { id: 'math', label: '數學' },
  { id: 'science', label: '自然' },
  { id: 'social', label: '社會' },
] as const satisfies readonly { id: SubjectId; label: string }[];
export const ELEM_SUBJECT_IDS: SubjectId[] = ELEM_SUBJECTS.map((s) => s.id);
export const subjectsFor = (grade: number | null | undefined): readonly { id: SubjectId; label: string }[] =>
  (isElementary(grade) ? ELEM_SUBJECTS : SUBJECTS);
export const validSubject = (grade: number | null | undefined, pick: SubjectId): SubjectId =>
  subjectsFor(grade).some((x) => x.id === pick) ? pick : subjectsFor(grade)[0].id;
/** 科目名稱：國小題的 chinese 顯示「國語」 */
export const subjectLabel = (id: string, semester?: string | null) =>
  id === 'chinese' && isElementarySemester(semester) ? '國語' : SUBJECTS.find((s) => s.id === id)?.label ?? id;

export const TEXTBOOK_VERSIONS = ['康軒', '南一', '翰林'] as const;
export type TextbookVersion = (typeof TEXTBOOK_VERSIONS)[number];
/** 有分版本的科目（國文依會考能力分單元，各版本通用） */
export const VERSIONED_SUBJECTS: SubjectId[] = ['math', 'english', 'science', 'social'];

export const PERSONAS = [
  { id: 'gentle', label: '溫柔學姊', desc: '鼓勵、有耐心' },
  { id: 'funny', label: '幽默學長', desc: '輕鬆、會開玩笑' },
  { id: 'strict', label: '嚴格老師', desc: '簡潔、直接' },
] as const;

export const ERROR_TYPE_LABEL: Record<string, string> = {
  concept: '觀念不清',
  calculation: '計算錯誤',
  misread: '看錯題意',
  careless: '粗心',
  guess: '用猜的',
};

export const MISTAKE_STATUS_LABEL: Record<string, string> = {
  pending: '待講解',
  learning: '學習中',
  consolidating: '鞏固中',
  almost: '即將畢業',
  graduated: '已畢業',
};

// 台灣時間的月份（手機時區設錯也不影響）
function taipeiMonth(): number {
  return Number(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Taipei', month: 'numeric' }).format(new Date()));
}

// 依目前月份推算學生所在學期（8 月～1 月為上學期）
export function currentSemester(grade: number | null | undefined): SemesterId | null {
  if (!grade) return null;
  const m = taipeiMonth();
  const half = m >= 8 || m === 1 ? 'A' : 'B';
  return `${grade}${half}` as SemesterId;
}

/**
 * 新學年（8/1 起）還沒確認過年級 → 提醒學生確認是否升年級。
 * 回傳建議的新年級；不需要提醒時回傳 null。
 */
export function gradeCheckNeeded(grade: number | null | undefined, confirmedAt: string | null | undefined): number | null {
  if (!grade || grade >= 9) return null;
  const now = new Date();
  const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei' }).format(now);
  const [y, m] = ymd.split('-').map(Number);
  const schoolYearStart = new Date(`${m >= 8 ? y : y - 1}-08-01T00:00:00+08:00`);
  if (confirmedAt && new Date(confirmedAt) >= schoolYearStart) return null;
  if (m < 8 && m > 1) return null; // 只在暑假到上學期（8 月～1 月）提醒
  return grade + 1;
}

// 手機本地日期（YYYY-MM-DD），用來和伺服器的台灣日期比對
export function localToday(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
