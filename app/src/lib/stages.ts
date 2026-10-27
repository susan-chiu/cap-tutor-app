// 段考分階段：把一個學期的單元（已依課本版本排好順序）分成第一、二、三次段考，最後是學期總複習。
// 大部分國中一學期 3 次段考；實際範圍以學校公告為準。
export interface StageUnit {
  id: string; title: string; total: number; mastered: number; attempted: number; answered: number; correct: number;
  /** 社會科：這個單元在本次段考的範圍（1～3）；沒有時代表整個單元 */
  part?: number;
}
export interface PartStats { unit_id: string; part: number; total: number; mastered: number; attempted: number; answered: number; correct: number }
export interface Stage<U extends StageUnit = StageUnit> {
  key: 'exam1' | 'exam2' | 'exam3' | 'final';
  label: string;
  units: U[];
  note?: string;
}

export function splitStages<U extends StageUnit>(units: U[]): Stage<U>[] {
  const n = units.length;
  const final: Stage<U> = { key: 'final', label: '學期總複習', units };
  if (n === 0) return [];
  if (n === 1) return [final];
  let groups: U[][];
  let note3: string | undefined;
  if (n === 2) {
    groups = [[units[0]], [units[1]], units];
    note3 = '這科這學期單元較少，第三次段考綜合複習';
  } else {
    // 平均切成三段（前面的段考不會比後面多太多），保持課本順序
    const cut1 = Math.round(n / 3), cut2 = Math.round((2 * n) / 3);
    groups = [units.slice(0, cut1), units.slice(cut1, cut2), units.slice(cut2)];
  }
  const labels = ['第一次段考', '第二次段考', '第三次段考'] as const;
  const keys = ['exam1', 'exam2', 'exam3'] as const;
  return [...groups.map((g, i) => ({ key: keys[i], label: labels[i], units: g, note: i === 2 ? note3 : undefined })), final];
}

/**
 * 國小：一學期只有期中考和期末考。前半學期的單元考期中、後半考期末（單元數是奇數時，中間那個單元放期中）。
 */
export function splitElementaryStages<U extends StageUnit>(units: U[]): Stage<U>[] {
  const n = units.length;
  if (n === 0) return [];
  if (n === 1) return [{ key: 'exam2', label: '期末考', units }];
  const cut = Math.ceil(n / 2);
  return [
    { key: 'exam1', label: '期中考', units: units.slice(0, cut) },
    { key: 'exam2', label: '期末考', units: units.slice(cut) },
  ];
}

/**
 * 社會科：每次段考都考地理、歷史、公民各一部分。
 * 每個段考放入所有單元在該次範圍的部分（題數與進度用 parts 的統計），學期總複習是完整單元。
 */
export function splitStagesByPart<U extends StageUnit>(units: U[], parts: PartStats[]): Stage<U>[] {
  if (units.length === 0) return [];
  const labels = ['第一次段考', '第二次段考', '第三次段考'] as const;
  const keys = ['exam1', 'exam2', 'exam3'] as const;
  const stages: Stage<U>[] = [];
  for (let i = 0; i < 3; i++) {
    const part = i + 1;
    const stageUnits = units.flatMap((u) => {
      const p = parts.find((x) => x.unit_id === u.id && x.part === part);
      return p && p.total > 0 ? [{ ...u, part, total: p.total, mastered: p.mastered, attempted: p.attempted,
        answered: p.answered, correct: p.correct }] : [];
    });
    if (stageUnits.length) stages.push({ key: keys[i], label: labels[i], units: stageUnits });
  }
  return [...stages, { key: 'final', label: '學期總複習', units }];
}

export interface StageStats {
  total: number; mastered: number; answered: number; correct: number;
  /** 熟練比例 0～1 */
  progress: number;
  /** 答對率 0～1（還沒作答時為 null） */
  accuracy: number | null;
  status: 'todo' | 'doing' | 'done';
  /** 最需要加強的單元：作答至少 3 次、答對率最低且低於 70% */
  weakest: { title: string; accuracy: number } | null;
}

export function stageStats(units: StageUnit[]): StageStats {
  const sum = (f: (u: StageUnit) => number) => units.reduce((a, u) => a + f(u), 0);
  const total = sum((u) => u.total), mastered = sum((u) => u.mastered);
  const answered = sum((u) => u.answered), correct = sum((u) => u.correct);
  const progress = total ? mastered / total : 0;
  const weak = units.filter((u) => u.answered >= 3).map((u) => ({ title: u.title, accuracy: u.correct / u.answered }))
    .filter((w) => w.accuracy < 0.7).sort((a, b) => a.accuracy - b.accuracy)[0] ?? null;
  return {
    total, mastered, answered, correct, progress,
    accuracy: answered ? correct / answered : null,
    status: progress >= 0.8 ? 'done' : sum((u) => u.attempted) > 0 ? 'doing' : 'todo',
    weakest: weak,
  };
}

/** 目前複習到哪個階段：第一個還沒完成的段考 */
export function currentStage(stages: Stage[]): Stage | null {
  return stages.find((s) => s.key !== 'final' && stageStats(s.units).status !== 'done') ?? stages.find((s) => s.key === 'final') ?? null;
}

export const DIFFICULTIES = [
  { id: null, label: '混合' },
  { id: 1, label: '簡單' },
  { id: 2, label: '中等' },
  { id: 3, label: '困難' },
] as const;
export type Difficulty = (typeof DIFFICULTIES)[number]['id'];
