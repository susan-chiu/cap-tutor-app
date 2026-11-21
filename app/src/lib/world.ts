// 世界地圖、魔物夥伴、勇者大廳商店的名稱與規則（金幣、收服、進化都由伺服器計算，這裡只負責畫面）
import type { ImageSourcePropType } from 'react-native';

import type { MapUnit, Pal } from '@/lib/api';

/** 20 種魔物夥伴：五科各 4 種，同科目的單元依順序輪流出現 */
export const PAL_NAME: Record<string, string> = {
  'math-1': '算籌獸', 'math-2': '角度兔', 'math-3': '骰子狐', 'math-4': '等號龜',
  'chinese-1': '墨點妖', 'chinese-2': '筆畫貓', 'chinese-3': '詞語鶴', 'chinese-4': '比喻蝶',
  'english-1': 'ABC 小怪', 'english-2': '字母鸚', 'english-3': '時鐘犬', 'english-4': '泡泡章魚',
  'science-1': '燒杯精', 'science-2': '葉芽羊', 'science-3': '靜電蜂', 'science-4': '碎石熊',
  'social-1': '時光鬼火', 'social-2': '羅盤鯨', 'social-3': '規則梟', 'social-4': '銅板龍',
};
export const ALL_SPECIES = Object.keys(PAL_NAME);
export const palName = (species: string | null | undefined) => PAL_NAME[species ?? ''] ?? '魔物夥伴';
export const palSubject = (species: string) => species.split('-')[0];

/** 成長階段：0 還沒收服、1 幼體、2 成體、3 覺醒 */
export const PAL_STAGE = ['未收服', '幼體', '成體', '覺醒'] as const;
export const PAL_STAGE_COLOR = ['#6B7792', '#7CF7FF', '#FFD700', '#FF7AF0'] as const;

/** 還差多少經驗值進化（已經覺醒回傳 null）。evolve＝[成體, 覺醒] 需要的經驗值 */
export function toEvolve(pal: Pick<Pal, 'xp' | 'stage'>, evolve: number[]): number | null {
  if (pal.stage >= 3) return null;
  return Math.max((pal.stage <= 1 ? evolve[0] : evolve[1]) - pal.xp, 1);
}
/** 這一階段的經驗值進度（0～1），覺醒後是 1 */
export function evolveProgress(pal: Pick<Pal, 'xp' | 'stage'>, evolve: number[]): number {
  if (pal.stage >= 3) return 1;
  const from = pal.stage <= 1 ? 0 : evolve[0], to = pal.stage <= 1 ? evolve[0] : evolve[1];
  return Math.max(0, Math.min(1, (pal.xp - from) / Math.max(to - from, 1)));
}
/** 錯題對應的野生魔物：單元的夥伴種類（後端沒給時用科目的第 1 種） */
export const wildSpecies = (species: string | null | undefined, subject: string | null | undefined) => species ?? `${subject ?? 'math'}-1`;

/** 領地狀態：入侵（已佔領但有錯題該複習）、已佔領、下一塊建議出征、還沒探索 */
export type NodeState = 'invaded' | 'won' | 'next' | 'open';
export function nodeStates(units: MapUnit[]): NodeState[] {
  const firstOpen = units.findIndex((u) => !u.won);
  return units.map((u, i) => (u.won ? (u.due > 0 ? 'invaded' : 'won') : i === firstOpen ? 'next' : 'open'));
}

/** 領地在地圖上的位置：從下往上蜿蜒的一條路（x、y 都是 0～1） */
const NODE_X = [0.66, 0.3, 0.72, 0.42, 0.2, 0.58, 0.8, 0.46];
export function nodePosition(i: number, n: number): { x: number; y: number } {
  const t = n <= 1 ? 0 : i / (n - 1);
  return { x: NODE_X[i % NODE_X.length], y: 0.93 - 0.85 * t };
}
/** 地圖高度：領地多的學期拉長，每塊領地至少留 76 的間距 */
export const mapHeight = (width: number, n: number) => Math.max(Math.round(width * 20 / 9), 160 + n * 76);

/** 大廳家具：名稱、說明、擺在大廳舞台上的位置（中心點佔寬高的比例）與大小（佔寬度的比例） */
export interface Furniture { name: string; desc: string; x: number; y: number; size: number }
export const FURNITURE: Record<string, Furniture> = {
  plant:   { name: '魔法盆栽', desc: '大廳多一點綠意', x: 0.9, y: 0.56, size: 0.2 },
  rug:     { name: '星紋地毯', desc: '鋪在石台前面', x: 0.5, y: 0.85, size: 0.36 },
  desk:    { name: '修煉書桌', desc: '勇者寫作業的地方', x: 0.14, y: 0.75, size: 0.26 },
  window:  { name: '月光窗', desc: '看得到外面的星空', x: 0.15, y: 0.22, size: 0.24 },
  bed:     { name: '勇者之床', desc: '每天免費題數 +5', x: 0.85, y: 0.75, size: 0.28 },
  chest:   { name: '冒險寶箱', desc: '放戰利品的箱子', x: 0.72, y: 0.86, size: 0.16 },
  picture: { name: '討伐紀念畫', desc: '紀念打倒的魔物', x: 0.85, y: 0.24, size: 0.22 },
  mirror:  { name: '魔鏡', desc: '照出勇者的英姿', x: 0.89, y: 0.41, size: 0.17 },
  lamp:    { name: '星光吊燈', desc: '點亮整個大廳', x: 0.5, y: 0.07, size: 0.26 },
  shelf:   { name: '魔導書櫃', desc: '收藏學過的知識', x: 0.12, y: 0.46, size: 0.22 },
  nest:    { name: '夥伴小窩', desc: '夥伴睡覺的地方', x: 0.33, y: 0.84, size: 0.18 },
  weapon:  { name: '武器架', desc: '展示勇者的武器', x: 0.13, y: 0.6, size: 0.18 },
};
export const SOUP = { name: '熱湯', desc: '今天可以多練幾題' };

export type ImgMap = Record<string, ImageSourcePropType>;

/** 夥伴技能：隊伍裡每一科的夥伴各帶一個技能，影響「絕招能量」怎麼累積（只影響戰鬥演出，不影響對錯與獎勵） */
export interface PalSkill { name: string; desc: string }
export const PAL_SKILL: Record<string, PalSkill> = {
  math: { name: '計算暴擊', desc: '絕招少連對 1 題就集滿' },
  chinese: { name: '墨之護符', desc: '每場第一次答錯，絕招能量不會歸零' },
  english: { name: '先聲奪人', desc: '每場一開始就有 1 格絕招能量' },
  science: { name: '回復藥水', desc: '放完絕招後留下 1 格能量' },
  social: { name: '時光倒流', desc: '答錯只掉 1 格能量，不會全部歸零' },
};
export const palSkill = (species: string | null | undefined): PalSkill | null => (species ? PAL_SKILL[palSubject(species)] ?? null : null);
const has = (team: readonly string[], subject: string) => team.some((s) => palSubject(s) === subject);

/** 絕招能量規則：一般連對 3 題集滿，領地戰（題數少）2 題；隊伍有數學夥伴再少 1 題 */
export function ultNeed(mode: string, team: readonly string[]): number {
  const base = mode === 'conquer' ? 2 : 3;
  return Math.max(base - (has(team, 'math') ? 1 : 0), 1);
}
/** 作答後的絕招能量。shieldUsed＝國文夥伴的護符這場用過了沒 */
export function nextEnergy(o: { energy: number; need: number; correct: boolean; usedUlt: boolean; team: readonly string[]; shieldUsed: boolean }): { energy: number; shieldUsed: boolean } {
  if (o.correct) {
    if (o.usedUlt) return { energy: has(o.team, 'science') ? 1 : 0, shieldUsed: o.shieldUsed };
    return { energy: Math.min(o.energy + 1, o.need), shieldUsed: o.shieldUsed };
  }
  if (has(o.team, 'chinese') && !o.shieldUsed) return { energy: o.energy, shieldUsed: true };
  if (has(o.team, 'social')) return { energy: Math.max(o.energy - 1, 0), shieldUsed: o.shieldUsed };
  return { energy: 0, shieldUsed: o.shieldUsed };
}
export const startEnergy = (team: readonly string[], need: number) => (has(team, 'english') ? Math.min(1, need) : 0);
