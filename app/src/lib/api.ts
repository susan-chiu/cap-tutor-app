import { disableReminders } from './reminders';
import { supabase } from './supabase';

export interface Option { key: string; text: string }

export interface PublicQuestion {
  id: string;
  unit_id: string;
  concept: string;
  stem: string;
  options: Option[];
  difficulty: number;
  source: string;
  subject: string;
  semester: string;
  unit_title: string;
  /** 這題以前做過（出題 RPC 才有） */
  seen?: boolean;
  /** 英語聽力原文（M:/W:/N: 每行一位說話者）；不是聽力題時為 null */
  listen_script?: string | null;
}

export interface MockExamRow {
  id: string;
  subject: string;
  full_length: boolean;
  total: number;
  correct: number;
  unanswered: number;
  score: number;
  duration_sec: number;
  by_unit: { unit_id: string; title: string; n: number; ok: number }[];
  created_at: string;
}

export interface Limits { free_daily_questions: number; free_daily_tutor: number; premium_daily_tutor: number }

export interface AnswerResult {
  correct: boolean;
  answer: string;
  explanation: string;
  wrong_reason: string | null;
  xp_gained: number;
  xp_total: number;
  today_answered: number;
  daily_goal: number;
  streak: number;
  streak_up: boolean;
  freeze_cards: number;
  mistake_status: string | null;
}

export interface GardenUnit {
  unit_id: string; subject: string; semester: string; seq: number; title: string;
  total: number; mastered: number; attempted: number;
  /** 困難題數與熟練數：開花＋困難題全部熟練＝金色稀有花 */
  hard_total?: number; hard_mastered?: number;
}
export type AdPlacement = 'energy' | 'xp2x' | 'tutor';
export type AdStatus = { enabled: boolean; total_left: number; energy_left: number; xp2x_left: number; tutor_left: number; energy_questions: number };
export type AdReward = AdStatus & { placement: AdPlacement; amount: number; xp_total: number | null; bonus: number | null; bonus_left: number | null };

export interface BossResult {
  stars: number; correct: number; total: number; best: number;
  first_three: boolean; freeze_reward: boolean; freeze_cards: number;
}
export type WishGoal = 'correct' | 'days' | 'graduated';
export interface Wish {
  id: string; title: string; goal_type: WishGoal; goal: number;
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  progress: number; reached: boolean; approved_at: string | null; fulfilled_at: string | null; created_at: string;
}
export interface Badge {
  id: string; group: string; title: string; desc: string; progress: number; goal: number; done: boolean;
}
export interface LeaderRow { rank: number; alias: string; level: number; xp: number; me: boolean }
export interface Leaderboard {
  week_start: string; school: 'junior' | 'elementary'; top: LeaderRow[];
  me: { alias: string; level: number; xp: number; rank: number | null; hidden: boolean };
}

export interface HomeData {
  nickname: string;
  grade: number | null;
  textbook: string | null;
  persona: string;
  xp: number;
  streak: number;
  longest_streak: number;
  freeze_cards: number;
  premium: boolean;
  premium_until: string | null;
  subscribed: boolean;
  tutor_used_today: number;
  tutor_limit_today: number;
  daily_goal: number;
  today_answered: number;
  due_reviews: number;
  pending_mistakes: number;
  week: { day: string; met: boolean; froze: boolean }[];
  invite_code: string;
}

export interface UnitPartRow {
  unit_id: string; part: number; total: number; mastered: number; attempted: number; answered: number; correct: number;
}

export interface UnitRow {
  id: string;
  semester: string;
  seq: number;
  title: string;
  /** 所選版本的章／課次與章名（沒有選版本時為 null） */
  chapter: string | null;
  chapter_title: string | null;
  total: number;
  mastered: number;
  attempted: number;
  /** 這個單元總共作答幾次、答對幾次（算答對率、找弱點） */
  answered: number;
  correct: number;
  /** 只在 App 內使用：社會科段考卡片裡，這個單元屬於第幾次段考的範圍 */
  part?: number;
}

/** 完整詳解（作答過才拿得到） */
export interface Solution {
  answer: string;
  explanation: string;
  hints: string[];
  wrong_reasons: Record<string, string>;
  options: { key: string; text: string }[];
}

export interface MistakeRow {
  question: PublicQuestion;
  status: string;
  error_type: string | null;
  next_review: string;
  wrong_count: number;
  created_at?: string;
}

export interface Profile {
  id: string;
  role: 'student' | 'parent';
  nickname: string;
  grade: number | null;
  textbook_version: string | null;
  tutor_persona: string;
  premium_until: string | null;
  subscription_until: string | null;
  invite_code: string;
  ai_consent_at: string | null;
  daily_subjects: string[] | null;
  textbook_versions: Record<string, string> | null;
  grade_confirmed_at: string | null;
  /** 戰鬥夥伴（舊版資料庫沒有這個欄位時是 undefined） */
  hero?: string | null;
}

export interface TutorResponse {
  session_id: string;
  reply: string;
  hint_level: number;
  error_type?: string | null;
  understood?: boolean;
  safety?: boolean;
  remaining_today?: number;
  /** 同一題今天講過：接續原本的對話（沒有扣次數） */
  resumed?: boolean;
  history?: { from: 'me' | 'tutor'; text: string }[];
}

export interface ChildSummary {
  nickname: string;
  grade: number | null;
  streak: number;
  days: { day: string; answered: number; correct: number; froze: boolean }[];
  by_subject: { subject: string; answered: number; correct: number }[] | null;
  weak_units: { title: string; semester: string; answered: number; pct: number }[] | null;
  graduated_this_week: number;
  error_types: Record<string, number> | null;
}

// 伺服器錯誤代碼 → 給學生看的中文
const ERROR_TEXT: Record<string, string> = {
  daily_limit_reached: '今天的免費題數用完了，明天再來！全校前三名可以申請免費無限練習。',
  daily_tutor_limit: '今天的免費小老師次數用完了。',
  ad_bonus_limit: '這個獎勵今天看廣告換的次數用完了，明天再來！',
  ad_daily_limit: '今天看廣告的次數用完了（每天最多 5 次），明天再來！',
  ad_nothing_to_double: '這一輪還沒有賺到 XP，先答對幾題再來加倍。',
  ad_not_verified: '還沒收到廣告平台的確認，請稍後再試一次。',
  ad_load_failed: '目前沒有可播放的廣告，請稍後再試。',
  ad_bonus_too_fast: '請稍等一下再試。',
  session_too_long: '這題聊很久了，先做驗收題看看有沒有學會吧！',
  tutor_unavailable: '小老師暫時連不上，請稍後再試。',
  tutor_not_configured: '小老師還沒設定好（伺服器缺少 AI 金鑰）。',
  already_pending: '你已經有一筆申請在審核中了。',
  bad_proof_path: '證明檔案上傳失敗，請重新選擇照片。',
  code_not_found: '找不到這個邀請碼，請確認孩子「我的」頁面上的代碼。',
  too_many_attempts: '今天輸入錯誤太多次，請明天再試，或請孩子確認邀請碼。',
  ai_consent_required: '使用小老師前，請先同意 AI 服務說明。',
  tutor_busy: '小老師現在太忙了，請過幾分鐘再試。',
  busy_retry: '訊息送太快了，請再送一次。',
  not_parent: '只有家長帳號可以綁定孩子。',
  not_linked: '還沒有綁定這位孩子。',
  question_not_found: '這題已經下架了。',
  not_answered: '作答之後才能看詳解。',
  not_authenticated: '請重新登入。',
  too_many_wishes: '最多同時許 3 個願望，先完成或取消一個吧！',
  wish_not_reached: '孩子還沒達成目標喔。',
  wish_not_pending: '這個願望已經處理過了。',
  already_retried: '這題已經用過心眼了。',
  no_retry: '這題已經不能重答了。',
};

export function errorText(e: unknown): string {
  const msg = e instanceof Error ? e.message : typeof e === 'string' ? e : JSON.stringify(e);
  for (const code of Object.keys(ERROR_TEXT)) {
    if (msg.includes(code)) return ERROR_TEXT[code];
  }
  if (/network|fetch/i.test(msg)) return '網路連線不穩，請稍後再試。';
  return '發生錯誤，請稍後再試。';
}

async function rpc<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
}

export const api = {
  home: () => rpc<HomeData>('get_home'),
  units: (subject = 'math', version: string | null = null) =>
    rpc<UnitRow[]>('get_units', { p_subject: subject, p_version: version }),
  /** 社會科：每個單元在第一～三次段考範圍的題數與進度 */
  /** 學習花園：這個學段每個單元的熟練進度 */
  garden: () => rpc<GardenUnit[]>('garden'),
  /** 魔王戰結算：星數由伺服器依剛剛的作答計算；第一次三星送保護卡 */
  recordBoss: (bossKey: string, questionIds: string[]) =>
    rpc<BossResult>('record_boss', { p_boss_key: bossKey, p_question_ids: questionIds }),
  bossBests: () => rpc<{ boss_key: string; best_stars: number; clears: number }[]>('boss_bests'),
  /** 成就徽章（全部由作答紀錄算出） */
  achievements: () => rpc<Badge[]>('achievements'),
  /** 許願池 */
  makeWish: (title: string, goalType: WishGoal, goal: number) => rpc<Wish>('make_wish', { p_title: title, p_goal_type: goalType, p_goal: goal }),
  myWishes: () => rpc<Wish[]>('my_wishes'),
  cancelWish: (id: string) => rpc<null>('cancel_wish', { p_id: id }),
  childWishes: (studentId: string) => rpc<Wish[]>('child_wishes', { p_student: studentId }),
  reviewWish: (id: string, approve: boolean) => rpc<Wish>('review_wish', { p_id: id, p_approve: approve }),
  fulfillWish: (id: string) => rpc<Wish>('fulfill_wish', { p_id: id }),
  /** 心眼重答：剛答錯的題目再選一次，答對加 3 XP（不改變錯題紀錄） */
  retryBonus: (questionId: string, choice: string) =>
    rpc<{ correct: boolean; xp_gained: number; xp_total: number }>('retry_bonus', { p_question_id: questionId, p_choice: choice }),
  /** 匿名週排行 */
  leaderboard: () => rpc<Leaderboard>('weekly_leaderboard', { p_limit: 20 }),
  setLeaderboardHidden: (hidden: boolean) => rpc<null>('set_leaderboard_hidden', { p_hidden: hidden }),
  unitParts: (subject = 'social') => rpc<UnitPartRow[]>('get_unit_parts', { p_subject: subject }),
  nextQuestions: (unitIds: string[], limit = 5, difficulty: number | null = null, part: number | null = null) =>
    rpc<PublicQuestion[]>('practice_questions', { p_unit_ids: unitIds, p_limit: limit, p_difficulty: difficulty, p_part: part }),
  solution: (questionId: string) => rpc<Solution>('question_solution', { p_question_id: questionId }),
  /** 每日練習：伺服器依科目平均輪流出題、照學生各科版本的學期範圍 */
  dailyQuestions: (subjects: string[], maxSemester: string | null, limit = 5) =>
    rpc<PublicQuestion[]>('daily_questions', { p_subjects: subjects, p_max_sem: maxSemester, p_limit: limit }),
  limits: () => rpc<Limits>('get_limits'),
  /** 交卷後存成績：伺服器依剛剛送出的作答計分 */
  saveMockExam: (subject: string, full: boolean, questionIds: string[], durationSec: number) =>
    rpc<{ id: string; score: number; correct: number; total: number; previous_score: number | null; duplicate?: boolean }>(
      'save_mock_exam', { p_subject: subject, p_full: full, p_question_ids: questionIds, p_duration_sec: durationSec }),
  myMockExams: (subject: string | null = null, limit = 30) =>
    rpc<MockExamRow[]>('my_mock_exams', { p_subject: subject, p_limit: limit }),
  childMockExams: (studentId: string, limit = 30) =>
    rpc<MockExamRow[]>('child_mock_exams', { p_student: studentId, p_limit: limit }),
  dueReviews: (limit = 10) => rpc<MistakeRow[]>('due_reviews', { p_limit: limit }),
  mistakes: (status: string | null = null) => rpc<MistakeRow[]>('list_mistakes', { p_status: status }),
  question: async (id: string): Promise<PublicQuestion> => {
    const { data, error } = await supabase.from('questions_public').select('*').eq('id', id).single();
    if (error) throw new Error(error.message);
    return data as PublicQuestion;
  },
  similar: async (questionId: string) =>
    (await rpc<PublicQuestion[]>('similar_question', { p_question_id: questionId }))[0] ?? null,
  submit: (questionId: string, choice: string, context: 'practice' | 'review' | 'exam' | 'tutor_check' = 'practice',
    forMistake: string | null = null) =>
    rpc<AnswerResult>('submit_answer', { p_question_id: questionId, p_choice: choice, p_context: context, p_for_mistake: forMistake }),
  setErrorType: (questionId: string, errorType: string) =>
    rpc<void>('set_error_type', { p_question_id: questionId, p_error_type: errorType }),
  report: (questionId: string, kind: 'question_wrong' | 'tutor_wrong' | 'tutor_inappropriate', note?: string) =>
    rpc<void>('report_question', { p_question_id: questionId, p_kind: kind, p_note: note ?? null }),
  applyTopThree: (a: { school: string; grade: number; exam: string; rank: number; proofPath: string; parentConsent: boolean }) =>
    rpc<string>('apply_top_three', {
      p_school: a.school, p_grade: a.grade, p_exam: a.exam, p_rank: a.rank,
      p_proof_path: a.proofPath, p_parent_consent: a.parentConsent,
    }),
  grantAdBonus: () => rpc<{ bonus: number; bonus_left: number }>('grant_ad_bonus'),
  adStatus: () => rpc<AdStatus>('ad_status'),
  grantAdReward: (placement: AdPlacement) => rpc<AdReward>('grant_ad_reward', { p_placement: placement }),
  linkChild: async (code: string) => {
    const r = await rpc<{ student_id?: string; nickname?: string; error?: string }>('link_child', { p_code: code });
    if (r.error) throw new Error(r.error);
    return r as { student_id: string; nickname: string };
  },
  myParents: () => rpc<{ parent_id: string; nickname: string; linked_at: string }[]>('my_parents'),
  myChildren: () => rpc<{ student_id: string; nickname: string; linked_at: string }[]>('my_children'),
  unlinkChild: (studentId: string) => rpc<void>('unlink_child', { p_student: studentId }),
  unlinkParent: (parentId: string) => rpc<void>('unlink_parent', { p_parent: parentId }),
  rotateInviteCode: () => rpc<string>('rotate_invite_code'),
  giveAiConsent: () => rpc<void>('give_ai_consent'),
  childSummary: (studentId: string) => rpc<ChildSummary>('get_child_summary', { p_student: studentId }),

  profile: async (userId: string): Promise<Profile | null> => {
    const cols = 'id, role, nickname, grade, textbook_version, tutor_persona, premium_until, subscription_until, invite_code, ai_consent_at, daily_subjects, textbook_versions, grade_confirmed_at';
    const first = await supabase.from('profiles').select(`${cols}, hero`).eq('id', userId).single();
    // 資料庫還沒跑第 15 個 migration（沒有 hero 欄位）時，先不讀戰鬥夥伴，App 照常運作
    const r = first.error && /hero/.test(first.error.message)
      ? await supabase.from('profiles').select(cols).eq('id', userId).single() : first;
    if (r.error) throw new Error(r.error.message);
    return r.data as unknown as Profile;
  },
  updateProfile: async (patch: Partial<Pick<Profile, 'nickname' | 'grade' | 'textbook_version' | 'tutor_persona' | 'daily_subjects' | 'textbook_versions' | 'hero'>>) => {
    const { data: s } = await supabase.auth.getSession();
    if (!s.session) throw new Error('not_authenticated');
    const { error } = await supabase.from('profiles').update(patch).eq('id', s.session.user.id);
    if (error) throw new Error(error.message);
  },
  myApplications: async () => {
    const { data, error } = await supabase.from('top_three_applications')
      .select('id, school, exam, school_rank, status, reviewer_note, created_at')
      .order('created_at', { ascending: false }).limit(5);
    if (error) throw new Error(error.message);
    return data ?? [];
  },
  children: async () => {
    const { data, error } = await supabase.from('parent_links').select('student_id');
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => r.student_id as string);
  },

  tutor: async (body: { action: 'start' | 'reply' | 'hint' | 'reteach'; question_id: string; session_id?: string;
    student_choice?: string | null; message?: string }): Promise<TutorResponse> => {
    const { data, error } = await supabase.functions.invoke('tutor', { body });
    if (error) {
      // FunctionsHttpError 會把伺服器回傳的 JSON 放在 context 裡
      let code = error.message;
      try {
        const ctx = (error as { context?: Response }).context;
        if (ctx && typeof ctx.json === 'function') code = (await ctx.json()).error ?? code;
      } catch { /* 忽略 */ }
      throw new Error(code);
    }
    return data as TutorResponse;
  },
  deleteAccount: async () => {
    const { error } = await supabase.functions.invoke('delete-account', { body: {} });
    if (error) throw new Error(error.message);
    await disableReminders().catch(() => {});
    await supabase.auth.signOut();
  },
};

export function isPremiumProfile(p: Profile | null, today: string): boolean {
  if (!p) return false;
  return (!!p.premium_until && p.premium_until >= today) ||
    (!!p.subscription_until && new Date(p.subscription_until) > new Date());
}
