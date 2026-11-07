// 遊戲化規則：等級、稱號、學習花園的植物成長、段考 Boss 戰
// 經驗值由伺服器計算（答對 +10、錯題畢業 +30），這裡只換算成等級與畫面。

/** 第 L 級需要 50 × L × (L − 1) 經驗值（Lv2 100、Lv3 300、Lv5 1000、Lv10 4500），和資料庫 xp_level 相同 */
export const xpForLevel = (level: number) => 50 * level * (level - 1);

export function levelFor(xp: number): number {
  return Math.max(1, Math.floor((1 + Math.sqrt(1 + 0.08 * Math.max(xp, 0))) / 2));
}

export interface LevelInfo { level: number; title: string; current: number; next: number; progress: number }

const TITLES: [number, string][] = [
  [1, '小種子'], [3, '發芽新手'], [5, '小樹苗'], [8, '勤學綠葉'], [12, '含苞學者'],
  [16, '開花達人'], [20, '學習大樹'], [25, '智慧森林'], [30, '傳說花神'],
];

export function titleFor(level: number): string {
  let t = TITLES[0][1];
  for (const [lv, name] of TITLES) if (level >= lv) t = name;
  return t;
}

export function levelInfo(xp: number): LevelInfo {
  const level = levelFor(xp);
  const current = xp - xpForLevel(level);
  const need = xpForLevel(level + 1) - xpForLevel(level);
  return { level, title: titleFor(level), current, next: need, progress: need ? current / need : 0 };
}

/** 學習花園：每個單元是一株植物，依熟練度長大 */
export type PlantStage = 0 | 1 | 2 | 3 | 4;
export const PLANT_STAGE_LABEL = ['種子', '發芽', '長葉', '花苞', '開花'] as const;

export function plantStage(u: { total: number; mastered: number; attempted: number }): PlantStage {
  if (!u.total || u.attempted === 0) return 0;
  const r = u.mastered / u.total;
  if (r >= 0.85) return 4;
  if (r >= 0.55) return 3;
  if (r >= 0.25) return 2;
  return 1;
}

/** 下一個階段還要熟練幾題（已開花回傳 0） */
export function toNextStage(u: { total: number; mastered: number; attempted: number }): number {
  const s = plantStage(u);
  if (s === 4 || !u.total) return 0;
  if (s === 0) return 1;
  const need = [0, 0.25, 0.55, 0.85][s];
  return Math.max(1, Math.ceil(need * u.total) - u.mastered);
}

/** 各科的花色（花園與 Boss 用） */
export const SUBJECT_FLOWER: Record<string, string> = {
  chinese: '#D9485F', english: '#3D7DD8', math: '#E8A317', science: '#2E9E6A', social: '#8A5CC7',
};

/** 段考 Boss：答對扣 Boss 血、答錯扣自己的愛心；結算時依答對率給星星 */
export const BOSS_HEARTS = 3;
export const BOSS_NAMES: Record<string, string> = {
  exam1: '段考小魔王', exam2: '段考大魔王', exam3: '段考魔王之王', final: '學期終極魔王',
  midterm: '期中考魔王', finalterm: '期末考魔王',
};

export function bossStars(correct: number, total: number): 0 | 1 | 2 | 3 {
  if (!total) return 0;
  const r = correct / total;
  return r >= 0.9 ? 3 : r >= 0.7 ? 2 : r >= 0.5 ? 1 : 0;
}

/** 連擊提示：3、5、10、20 題時跳出 */
export function comboMessage(combo: number): string | null {
  if (combo >= 20) return `${combo} 連擊！無人能擋`;
  if (combo === 10) return '10 連擊！超強';
  if (combo === 5) return '5 連擊！手感正熱';
  if (combo === 3) return '3 連擊！';
  return null;
}
