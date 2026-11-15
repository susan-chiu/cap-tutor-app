import { useEffect, useState } from 'react';
import { Animated, Easing, Image, Pressable, View } from 'react-native';

import { T } from '@/components/ui';
import type { ConquerResult } from '@/lib/api';
import { FX_IMG, palImg, WORLD_IMG } from '@/lib/art';
import { play } from '@/lib/sound';
import { C } from '@/lib/theme';
import { PAL_STAGE, PAL_STAGE_COLOR, palName } from '@/lib/world';

/** 金幣數量（可以點，通常是去商店） */
export function GoldPill({ gold, onPress }: { gold: number; onPress?: () => void }) {
  return (
    <Pressable accessibilityRole={onPress ? 'button' : 'text'} accessibilityLabel={`金幣 ${gold}${onPress ? '，去商店' : ''}`}
      onPress={onPress} disabled={!onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 36, paddingHorizontal: 10, borderRadius: 999,
        backgroundColor: C.goldSoft, borderWidth: 1, borderColor: '#5A4A10' }}>
      <Image source={WORLD_IMG.coin} accessibilityIgnoresInvertColors style={{ width: 20, height: 20 }} />
      <T size={13} weight="700" color={C.gold}>{gold}</T>
    </Pressable>
  );
}

/**
 * 夥伴圖：幼體用原圖；成體、覺醒的正式圖還沒有，先用放大加上金色／紫色光環表示。
 * stage 0（還沒收服）顯示成剪影。
 */
export function PalImage({ species, stage, size }: { species: string; stage: number; size: number }) {
  const glow = stage >= 2 ? PAL_STAGE_COLOR[Math.min(stage, 3)] : null;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {glow ? <View style={{ position: 'absolute', width: size * 0.86, height: size * 0.86, borderRadius: size, borderWidth: stage >= 3 ? 3 : 2,
        borderColor: glow, backgroundColor: stage >= 3 ? 'rgba(255, 122, 240, 0.16)' : 'rgba(255, 215, 0, 0.12)' }} /> : null}
      <Image source={palImg(species)} accessibilityIgnoresInvertColors
        style={{ width: size * (stage >= 2 ? 0.92 : 0.8), height: size * (stage >= 2 ? 0.92 : 0.8),
          ...(stage === 0 ? { tintColor: '#2B3A62', opacity: 0.8 } : null) }} />
    </View>
  );
}

/** 領地戰結算：法陣轉動，魔物被收服成夥伴（或進化），顯示拿到的金幣 */
export function ConquerCard({ result }: { result: ConquerResult }) {
  const spin = useState(() => new Animated.Value(0))[0];
  const pop = useState(() => new Animated.Value(0))[0];
  const evolved = result.rewarded && result.stage > result.stage_before && !result.new_pal;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 6000, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    Animated.spring(pop, { toValue: 1, friction: 5, tension: 60, delay: 250, useNativeDriver: true }).start();
    if (result.rewarded) setTimeout(() => play(evolved ? 'evolve' : 'capture', 0.7), 300);
    if (result.gold_gained) setTimeout(() => play('coin', 0.7), 1100);
    return () => loop.stop();
  }, [spin, pop, result.rewarded, result.gold_gained, evolved]);

  const title = !result.rewarded ? '領地守住了！'
    : result.new_pal ? '收服成功！新夥伴加入'
    : evolved ? `進化了！變成${PAL_STAGE[result.stage]}`
    : '收服成功！夥伴變強了';
  const color = PAL_STAGE_COLOR[Math.min(Math.max(result.stage, 1), 3)];
  return (
    <View style={{ alignItems: 'center', gap: 8, padding: 14, borderRadius: 18, backgroundColor: '#0E1530', borderWidth: 2, borderColor: color }}>
      <T size={18} weight="700" color={color}>{title}</T>
      <View style={{ width: 190, height: 190, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.Image source={FX_IMG.magicCircle} accessibilityIgnoresInvertColors
          style={{ position: 'absolute', width: 190, height: 190, opacity: 0.8,
            transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }} />
        <Animated.View style={{ transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }) }] }}>
          <PalImage species={result.species} stage={Math.max(result.stage, 1)} size={140} />
        </Animated.View>
      </View>
      <T size={18} weight="700">{palName(result.species)}</T>
      <T size={13} color={C.inkSoft} style={{ textAlign: 'center' }}>
        {result.rewarded ? `${PAL_STAGE[Math.max(result.stage, 1)]}・已收服 ${result.caught} 次` : '今天已經在這塊領地收服過了，明天再來可以再收服一次。'}
      </T>
      {result.mastered ? <T weight="700" color={C.gold}>★ 領地熟練！升級成金旗領地</T>
        : result.rewarded && result.days < result.master_days ? <T size={12} color={C.muted}>熟練度 {result.days} / {result.master_days}（改天再打贏一次 +1）</T> : null}
      {result.gold_gained ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Image source={WORLD_IMG.coin} accessibilityIgnoresInvertColors style={{ width: 24, height: 24 }} />
          <T weight="700" color={C.gold}>{result.first ? '佔領獎勵' : result.mastered ? '收回＋熟練獎勵' : result.guard_bonus ? '收回＋守護者獎勵' : '收回獎勵'} +{result.gold_gained} 金幣</T>
        </View>
      ) : null}
    </View>
  );
}
