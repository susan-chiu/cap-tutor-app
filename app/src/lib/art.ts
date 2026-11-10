import type { ImageSourcePropType } from 'react-native';

import { BOSS_NAMES } from '@/lib/game';

/** 美術素材：五科魔物、段考魔王、道具、大廳背景 */
export const MONSTER_IMG: Record<string, ImageSourcePropType> = {
  math: require('@/assets/monsters/math.webp'),
  chinese: require('@/assets/monsters/chinese.webp'),
  english: require('@/assets/monsters/english.webp'),
  science: require('@/assets/monsters/science.webp'),
  social: require('@/assets/monsters/social.webp'),
};
export const monsterImg = (subject: string | null | undefined) => MONSTER_IMG[subject ?? ''] ?? MONSTER_IMG.math;

const BOSS_IMG: Record<string, ImageSourcePropType> = {
  exam1: require('@/assets/bosses/boss-1.webp'),
  exam2: require('@/assets/bosses/boss-2.webp'),
  exam3: require('@/assets/bosses/boss-3.webp'),
  final: require('@/assets/bosses/boss-final.webp'),
};
/** 依魔王名稱找圖：國小期中考用第 2 隻、期末考用終極魔王 */
export function bossImg(name: string | null | undefined): ImageSourcePropType {
  const key = Object.keys(BOSS_NAMES).find((k) => BOSS_NAMES[k] === name);
  if (key === 'midterm') return BOSS_IMG.exam2;
  if (key === 'finalterm') return BOSS_IMG.final;
  return BOSS_IMG[key ?? ''] ?? BOSS_IMG.exam1;
}

export const ITEM_IMG = {
  potion: require('@/assets/items/potion.webp') as ImageSourcePropType,
  shield: require('@/assets/items/shield.webp') as ImageSourcePropType,
  goldFlower: require('@/assets/items/gold-flower.webp') as ImageSourcePropType,
  badgeFrame: require('@/assets/items/badge-frame.webp') as ImageSourcePropType,
};

export const HALL_BG: ImageSourcePropType = require('@/assets/images/hall-bg.jpg');

/** 戰鬥特效（已轉成透明背景） */
export const FX_IMG = {
  slash: require('@/assets/fx/slash.webp') as ImageSourcePropType,
  hit: require('@/assets/fx/hit.webp') as ImageSourcePropType,
  crit: require('@/assets/fx/crit.webp') as ImageSourcePropType,
  dissolve: require('@/assets/fx/dissolve.webp') as ImageSourcePropType,
  levelup: require('@/assets/fx/levelup.webp') as ImageSourcePropType,
  magicCircle: require('@/assets/fx/magic-circle.webp') as ImageSourcePropType,
};

/** 戰場：每科一張，綜合（每日突擊）用通用戰場 */
const ARENA: Record<string, ImageSourcePropType> = {
  all: require('@/assets/arenas/arena-all.jpg'),
  math: require('@/assets/arenas/arena-math.jpg'),
  chinese: require('@/assets/arenas/arena-chinese.jpg'),
  english: require('@/assets/arenas/arena-english.jpg'),
  science: require('@/assets/arenas/arena-science.jpg'),
  social: require('@/assets/arenas/arena-social.jpg'),
};
export const arenaImg = (subject: string | null | undefined) => ARENA[subject ?? ''] ?? ARENA.all;

/** 介面：分頁圖示、科目徽章、獎牌、寶箱、金邊按鈕、面板角飾 */
export const TAB_IMG: Record<string, { on: ImageSourcePropType; off: ImageSourcePropType }> = {
  hall: { on: require('@/assets/ui/tab-hall-on.webp'), off: require('@/assets/ui/tab-hall-off.webp') },
  quest: { on: require('@/assets/ui/tab-quest-on.webp'), off: require('@/assets/ui/tab-quest-off.webp') },
  monster: { on: require('@/assets/ui/tab-monster-on.webp'), off: require('@/assets/ui/tab-monster-off.webp') },
  me: { on: require('@/assets/ui/tab-me-on.webp'), off: require('@/assets/ui/tab-me-off.webp') },
};
export const SUBJECT_IMG: Record<string, ImageSourcePropType> = {
  math: require('@/assets/ui/subj-math.webp'),
  chinese: require('@/assets/ui/subj-chinese.webp'),
  english: require('@/assets/ui/subj-english.webp'),
  science: require('@/assets/ui/subj-science.webp'),
  social: require('@/assets/ui/subj-social.webp'),
};
export const MEDAL_IMG: ImageSourcePropType[] = [
  require('@/assets/ui/medal-1.webp'), require('@/assets/ui/medal-2.webp'), require('@/assets/ui/medal-3.webp'),
];
export const CHEST_IMG = { closed: require('@/assets/ui/chest-closed.webp') as ImageSourcePropType, open: require('@/assets/ui/chest-open.webp') as ImageSourcePropType };
export const BTN_IMG = { left: require('@/assets/ui/btn-left.webp') as ImageSourcePropType, mid: require('@/assets/ui/btn-mid.webp') as ImageSourcePropType, right: require('@/assets/ui/btn-right.webp') as ImageSourcePropType };
export const CORNER_IMG: ImageSourcePropType = require('@/assets/ui/corner.webp');

/** 學習花園植物：每科 5 個成長階段 */
const PLANT: Record<string, ImageSourcePropType[]> = {
  math: [require('@/assets/plants/math-0.webp'), require('@/assets/plants/math-1.webp'), require('@/assets/plants/math-2.webp'), require('@/assets/plants/math-3.webp'), require('@/assets/plants/math-4.webp')],
  chinese: [require('@/assets/plants/chinese-0.webp'), require('@/assets/plants/chinese-1.webp'), require('@/assets/plants/chinese-2.webp'), require('@/assets/plants/chinese-3.webp'), require('@/assets/plants/chinese-4.webp')],
  english: [require('@/assets/plants/english-0.webp'), require('@/assets/plants/english-1.webp'), require('@/assets/plants/english-2.webp'), require('@/assets/plants/english-3.webp'), require('@/assets/plants/english-4.webp')],
  science: [require('@/assets/plants/science-0.webp'), require('@/assets/plants/science-1.webp'), require('@/assets/plants/science-2.webp'), require('@/assets/plants/science-3.webp'), require('@/assets/plants/science-4.webp')],
  social: [require('@/assets/plants/social-0.webp'), require('@/assets/plants/social-1.webp'), require('@/assets/plants/social-2.webp'), require('@/assets/plants/social-3.webp'), require('@/assets/plants/social-4.webp')],
};
export const plantImg = (subject: string, stage: number) => (PLANT[subject] ?? PLANT.math)[Math.max(0, Math.min(4, stage))];
