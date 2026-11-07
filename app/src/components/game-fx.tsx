import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Animated, Platform, View } from 'react-native';

import { T } from '@/components/ui';
import { BOSS_HEARTS, titleFor } from '@/lib/game';
import { C } from '@/lib/theme';

/** 震動回饋（網頁版沒有震動，直接略過） */
export function buzz(kind: 'correct' | 'wrong' | 'levelup') {
  if (Platform.OS === 'web') return;
  const run = kind === 'correct' ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    : kind === 'wrong' ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  run.catch(() => {});
}

/** 段考 Boss 戰：魔王血條＋自己的愛心 */
export function BossBar({ name, hp, maxHp, hearts, hit }: { name: string; hp: number; maxHp: number; hearts: number; hit: number }) {
  const shake = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    if (!hit) return;
    Animated.sequence([
      Animated.timing(shake, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [hit, shake]);
  const defeated = hp <= 0;
  return (
    <View accessibilityLabel={`${name} 血量 ${hp} / ${maxHp}，你的愛心 ${hearts} 顆`}
      style={{ marginHorizontal: 16, marginBottom: 6, padding: 10, borderRadius: 14, backgroundColor: C.night, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Animated.View style={{ transform: [{ translateX: shake }] }}>
        <Ionicons name={defeated ? 'skull-outline' : 'skull'} size={30} color={defeated ? C.faint : '#E5484D'} />
      </Animated.View>
      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <T size={13} weight="700" color="#FFFFFF">{defeated ? `${name} 被擊敗了！` : name}</T>
          <T size={12} color="#C9D1CF">HP {Math.max(hp, 0)} / {maxHp}</T>
        </View>
        <View style={{ height: 8, borderRadius: 4, backgroundColor: C.nightSoft, overflow: 'hidden' }}>
          <View style={{ width: `${maxHp ? (Math.max(hp, 0) / maxHp) * 100 : 0}%`, height: '100%', backgroundColor: '#E5484D' }} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 2 }}>
        {Array.from({ length: BOSS_HEARTS }, (_, i) => (
          <Ionicons key={i} name={i < hearts ? 'heart' : 'heart-outline'} size={18} color={i < hearts ? '#FF6B81' : C.nightSoft} />
        ))}
      </View>
    </View>
  );
}

/** 答對時從題目上方飄起「+10 XP」與連擊提示 */
export function XpPop({ text, sub, seq }: { text: string; sub?: string | null; seq: number }) {
  const v = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    if (!seq) return;
    v.setValue(0);
    Animated.timing(v, { toValue: 1, duration: 1100, useNativeDriver: true }).start();
  }, [seq, v]);
  if (!seq) return null;
  return (
    <Animated.View pointerEvents="none" style={{
      position: 'absolute', top: '32%', alignSelf: 'center', alignItems: 'center', zIndex: 10,
      opacity: v.interpolate({ inputRange: [0, 0.15, 0.75, 1], outputRange: [0, 1, 1, 0] }),
      transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [10, -30] }) },
        { scale: v.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.7, 1.15, 1] }) }],
    }}>
      <View style={{ backgroundColor: C.green, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 }}>
        <T weight="700" color="#FFFFFF" size={16}>{text}</T>
      </View>
      {sub ? <T weight="700" color={C.flame} size={15} style={{ marginTop: 4 }}>{sub}</T> : null}
    </Animated.View>
  );
}

/** 升級提示 */
export function LevelUpBanner({ level }: { level: number }) {
  const v = useState(() => new Animated.Value(0))[0];
  useEffect(() => { Animated.spring(v, { toValue: 1, useNativeDriver: true, friction: 5 }).start(); }, [v]);
  return (
    <Animated.View accessibilityLiveRegion="polite" style={{
      transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }], opacity: v,
      backgroundColor: '#FFF4D6', borderColor: '#E8B923', borderWidth: 2, borderRadius: 14, padding: 12,
      flexDirection: 'row', alignItems: 'center', gap: 10,
    }}>
      <Ionicons name="star" size={28} color="#E8B923" />
      <View style={{ flex: 1 }}>
        <T weight="700" size={16}>升級了！Lv {level}</T>
        <T size={13} color={C.inkSoft}>新稱號：{titleFor(level)}</T>
      </View>
    </Animated.View>
  );
}

/** 星星評價（0～3 顆） */
export function Stars({ n, size = 34 }: { n: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }} accessibilityLabel={`${n} 顆星`}>
      {[0, 1, 2].map((i) => <Ionicons key={i} name={i < n ? 'star' : 'star-outline'} size={size} color={i < n ? '#E8B923' : C.nightSoft} />)}
    </View>
  );
}
