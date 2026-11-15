import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, type ImageSourcePropType, useWindowDimensions, View } from 'react-native';

import { T } from '@/components/ui';
import { FX_IMG } from '@/lib/art';
import { BOSS_HEARTS } from '@/lib/game';
import { play } from '@/lib/sound';
import { C } from '@/lib/theme';

/** 舞台高度：矮螢幕（小手機）縮小，題目才不會被擠到畫面外 */
const stageSize = (height: number) => (height < 700 ? { h: 124, monster: 88 } : { h: 176, monster: 132 });

/**
 * 戰鬥舞台：戰場背景上站著魔物（或魔王），答對時劍光劃過、命中閃光、魔物搖晃；
 * 連擊時改成金色暴擊；血量歸零時化成光點消散。
 */
export function BattleStage({ name, image, arena, hp, maxHp, hearts, hit, crit }: {
  name: string; image: ImageSourcePropType; arena: ImageSourcePropType;
  hp: number; maxHp: number; hearts?: number | null;
  /** 每答對一題加 1，觸發攻擊特效 */
  hit: number;
  /** 這一擊是不是暴擊（連擊） */
  crit: boolean;
}) {
  const { width: w, height } = useWindowDimensions();
  const { h: STAGE_H, monster } = stageSize(height);
  const k = monster / 132;
  const shake = useState(() => new Animated.Value(0))[0];
  const slash = useState(() => new Animated.Value(0))[0];
  const flash = useState(() => new Animated.Value(0))[0];
  const fade = useState(() => new Animated.Value(1))[0];
  const dust = useState(() => new Animated.Value(0))[0];
  const defeated = hp <= 0;
  const wasDefeated = useRef(false);

  useEffect(() => {
    if (!hit) return;
    play('slash', 0.6);
    setTimeout(() => play('hit', 0.6), 140);
    slash.setValue(0); flash.setValue(0);
    Animated.parallel([
      Animated.timing(slash, { toValue: 1, duration: 360, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(140),
        Animated.timing(flash, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.timing(flash, { toValue: 0, duration: 380, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(140),
        Animated.timing(shake, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 6, duration: 50, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hit]);

  useEffect(() => {
    if (defeated && !wasDefeated.current) {
      wasDefeated.current = true;
      setTimeout(() => play('bossDown', 0.7), 450);
      Animated.sequence([
        Animated.delay(450),
        Animated.parallel([
          Animated.timing(fade, { toValue: 0.15, duration: 900, useNativeDriver: true }),
          Animated.timing(dust, { toValue: 1, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]),
      ]).start();
    }
    if (!defeated) { wasDefeated.current = false; fade.setValue(1); dust.setValue(0); }
  }, [defeated, fade, dust]);

  return (
    <View accessibilityLabel={`${name} 血量 ${Math.max(hp, 0)} / ${maxHp}${hearts != null ? `，你的愛心 ${hearts} 顆` : ''}`}
      style={{ height: STAGE_H, overflow: 'hidden', backgroundColor: C.night }}>
      {/* 戰場只取上半部的場景 */}
      <Image source={arena} accessibilityIgnoresInvertColors resizeMode="cover"
        style={{ position: 'absolute', top: -Math.min(w, 640) * 0.12, left: 0, width: w, height: w * 16 / 9 }} />
      <Animated.View style={{ position: 'absolute', alignSelf: 'center', top: 6, width: monster, height: monster,
        opacity: fade, transform: [{ translateX: shake }] }}>
        <Image source={image} accessibilityIgnoresInvertColors style={{ width: monster, height: monster }} />
      </Animated.View>
      {/* 劍光 */}
      <Animated.Image source={crit ? FX_IMG.crit : FX_IMG.slash} style={{
        position: 'absolute', alignSelf: 'center', top: -10 * k, width: 170 * k, height: 170 * k,
        opacity: slash.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 1, 1, 0] }),
        transform: [
          { translateX: crit ? 0 : slash.interpolate({ inputRange: [0, 1], outputRange: [-40, 30] }) },
          { scale: slash.interpolate({ inputRange: [0, 1], outputRange: crit ? [0.5, 1.3] : [0.8, 1.15] }) },
        ],
      }} />
      {/* 命中閃光 */}
      <Animated.Image source={FX_IMG.hit} style={{
        position: 'absolute', alignSelf: 'center', top: 10 * k, width: 130 * k, height: 130 * k, opacity: flash,
        transform: [{ scale: flash.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.2] }) }],
      }} />
      {/* 打倒後化成光點 */}
      <Animated.Image source={FX_IMG.dissolve} style={{
        position: 'absolute', alignSelf: 'center', top: -6, width: 170 * k, height: 170 * k,
        opacity: dust.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 1, 1, 0] }),
        transform: [{ translateY: dust.interpolate({ inputRange: [0, 1], outputRange: [20, -30] }) }],
      }} />

      <View style={{ position: 'absolute', left: 12, right: 12, bottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: 'rgba(5, 10, 24, 0.8)', borderWidth: 1, borderColor: C.nightLine }}>
        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <T size={13} weight="700" color="#FFFFFF">{defeated ? `${name} 被擊敗了！` : name}</T>
            <T size={12} color="#C9D1CF">HP {Math.max(hp, 0)} / {maxHp}</T>
          </View>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: C.nightSoft, overflow: 'hidden' }}>
            <View style={{ width: `${maxHp ? (Math.max(hp, 0) / maxHp) * 100 : 0}%`, height: '100%', backgroundColor: C.red }} />
          </View>
        </View>
        {hearts != null ? (
          <View style={{ flexDirection: 'row', gap: 2 }}>
            {Array.from({ length: BOSS_HEARTS }, (_, i) => (
              <Ionicons key={i} name={i < hearts ? 'heart' : 'heart-outline'} size={18} color={i < hearts ? '#FF6B81' : C.nightSoft} />
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}
