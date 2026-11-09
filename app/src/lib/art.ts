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
