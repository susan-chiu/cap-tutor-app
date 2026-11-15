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

/** 再收服幾次會進化（已經覺醒回傳 null） */
export function toEvolve(pal: Pick<Pal, 'caught' | 'stage'>, evolve: number[]): number | null {
  if (pal.stage >= 3) return null;
  return Math.max((pal.stage <= 1 ? evolve[0] : evolve[1]) - pal.caught, 1);
}

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
  chest:   { name: '冒險寶箱', desc: '放戰利品的箱子', x: 0.33, y: 0.82, size: 0.17 },
  picture: { name: '討伐紀念畫', desc: '紀念打倒的魔物', x: 0.85, y: 0.24, size: 0.22 },
  mirror:  { name: '魔鏡', desc: '照出勇者的英姿', x: 0.89, y: 0.41, size: 0.17 },
  lamp:    { name: '星光吊燈', desc: '點亮整個大廳', x: 0.5, y: 0.07, size: 0.26 },
  shelf:   { name: '魔導書櫃', desc: '收藏學過的知識', x: 0.12, y: 0.46, size: 0.22 },
  nest:    { name: '夥伴小窩', desc: '夥伴睡覺的地方', x: 0.7, y: 0.83, size: 0.18 },
  weapon:  { name: '武器架', desc: '展示勇者的武器', x: 0.13, y: 0.6, size: 0.18 },
};
export const SOUP = { name: '熱湯', desc: '今天可以多練幾題' };

export type ImgMap = Record<string, ImageSourcePropType>;
