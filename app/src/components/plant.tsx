import { Image, View } from 'react-native';

import { ITEM_IMG, plantImg } from '@/lib/art';
import type { PlantStage } from '@/lib/game';
import { C } from '@/lib/theme';

/** 學習花園的一株植物：種子 → 發芽 → 長葉 → 花苞 → 開花（每科花色不同）；金色稀有花加上金光 */
export function Plant({ stage, subject, size = 64, gold = false }: { stage: PlantStage; subject: string; size?: number; gold?: boolean }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'flex-end' }}>
      {gold ? (
        <View style={{ position: 'absolute', width: size * 0.9, height: size * 0.9, top: 0, borderRadius: size,
          backgroundColor: C.goldSoft, borderWidth: 2, borderColor: C.gold, opacity: 0.85 }} />
      ) : null}
      <Image source={plantImg(subject, stage)} accessibilityIgnoresInvertColors style={{ width: size, height: size }} />
      {gold ? (
        <Image source={ITEM_IMG.goldFlower} accessibilityIgnoresInvertColors
          style={{ position: 'absolute', width: size * 0.38, height: size * 0.38, top: -2, right: -4 }} />
      ) : null}
    </View>
  );
}
