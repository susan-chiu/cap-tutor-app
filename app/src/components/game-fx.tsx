import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Animated, Easing, Image, type ImageSourcePropType, Platform, Pressable, View } from 'react-native';

import { T } from '@/components/ui';
import { BOSS_HEARTS, titleFor } from '@/lib/game';
import { BTN_IMG, CHEST_IMG, CORNER_IMG, FX_IMG } from '@/lib/art';
import type { Hero } from '@/lib/heroes';
import { play } from '@/lib/sound';
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
export function BossBar({ name, hp, maxHp, hearts, hit, image }: {
  name: string; hp: number; maxHp: number; hearts?: number | null; hit: number; image?: ImageSourcePropType;
}) {
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
    <View accessibilityLabel={`${name} 血量 ${hp} / ${maxHp}${hearts != null ? `，你的愛心 ${hearts} 顆` : ''}`}
      style={{ marginHorizontal: 16, marginBottom: 6, padding: 10, borderRadius: 14, backgroundColor: C.night, borderWidth: 1, borderColor: C.nightLine, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Animated.View style={{ transform: [{ translateX: shake }] }}>
        {image ? (
          <Image source={image} accessibilityIgnoresInvertColors style={{ width: 48, height: 48, opacity: defeated ? 0.4 : 1 }} />
        ) : <Ionicons name={defeated ? 'skull-outline' : 'skull'} size={30} color={defeated ? C.faint : C.red} />}
      </Animated.View>
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
export function LevelUpBanner({ level, hero }: { level: number; hero?: Hero }) {
  const v = useState(() => new Animated.Value(0))[0];
  useEffect(() => { Animated.spring(v, { toValue: 1, useNativeDriver: true, friction: 5 }).start(); }, [v]);
  return (
    <Animated.View accessibilityLiveRegion="polite" style={{
      transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }], opacity: v,
      backgroundColor: C.goldSoft, borderColor: C.gold, borderWidth: 2, borderRadius: 14, padding: 12,
      flexDirection: 'row', alignItems: 'center', gap: 10,
    }}>
      <View style={{ width: 72, height: 72, alignItems: 'center', justifyContent: 'center' }}>
        <Image source={FX_IMG.levelup} accessibilityIgnoresInvertColors style={{ position: 'absolute', width: 96, height: 96, top: -20 }} />
        {hero ? <Image source={hero.happy} accessibilityIgnoresInvertColors style={{ width: 64, height: 64 }} />
          : <Ionicons name="star" size={28} color={C.gold} />}
      </View>
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
      {[0, 1, 2].map((i) => <Ionicons key={i} name={i < n ? 'star' : 'star-outline'} size={size} color={i < n ? C.gold : C.nightSoft} />)}
    </View>
  );
}

/** 心眼提示：答錯時主角跳出來給提示，可以再答一次 */
export function EyeHint({ hero, hint, onRetry, onGiveUp }: { hero: Hero; hint: string | null; onRetry: () => void; onGiveUp: () => void }) {
  const v = useState(() => new Animated.Value(0))[0];
  useEffect(() => { Animated.spring(v, { toValue: 1, useNativeDriver: true, friction: 6 }).start(); }, [v]);
  return (
    <Animated.View accessibilityLiveRegion="polite" style={{ gap: 10, opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
        <Image source={hero.cheer} accessibilityIgnoresInvertColors style={{ width: 84, height: 84 }} />
        <View style={{ flex: 1, padding: 12, borderRadius: 14, backgroundColor: C.night, borderWidth: 1, borderColor: hero.color, gap: 4 }}>
          <T weight="700" color={hero.color}>心眼發動！{hero.name}・{hero.eyeFx}</T>
          <T size={14} weight="700" color={C.ink}>「{hero.eye}」</T>
          <T size={14} color={C.inkSoft}>{hint ?? '再讀一次題目，注意關鍵字和條件。'}</T>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable accessibilityRole="button" onPress={onGiveUp}
          style={{ flex: 1, minHeight: 48, borderRadius: 14, borderWidth: 1.5, borderColor: C.lineStrong, alignItems: 'center', justifyContent: 'center' }}>
          <T weight="700" color={C.muted}>直接看解析</T>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onRetry}
          style={{ flex: 1, minHeight: 48, borderRadius: 14, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' }}>
          <T weight="700" color={C.onAccent}>再挑戰一次</T>
        </Pressable>
      </View>
    </Animated.View>
  );
}

/** 寶箱獎勵：先顯示關著的寶箱，點一下打開 */
export function ChestReward({ title, detail }: { title: string; detail: string }) {
  const [open, setOpen] = useState(false);
  const pulse = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={open ? `${title}，${detail}` : '打開寶箱'} disabled={open}
      onPress={() => { setOpen(true); play('chest'); buzz('levelup'); }}
      style={{ alignItems: 'center', gap: 6, padding: 10, borderRadius: 16, backgroundColor: C.goldSoft, borderWidth: 1, borderColor: C.gold }}>
      <Animated.View style={{ transform: [{ scale: open ? 1 : pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.07] }) }] }}>
        <Image source={open ? CHEST_IMG.open : CHEST_IMG.closed} accessibilityIgnoresInvertColors style={{ width: 130, height: 130 }} />
      </Animated.View>
      {open ? (
        <>
          <T weight="700" color={C.gold} style={{ textAlign: 'center' }}>{title}</T>
          <T size={13} color={C.inkSoft} style={{ textAlign: 'center' }}>{detail}</T>
        </>
      ) : <T weight="700" color={C.gold}>獲得寶箱！點一下打開</T>}
    </Pressable>
  );
}

/** 金邊大按鈕：左右兩端是裝飾，中段可拉長 */
export function GoldButton({ title, onPress, accessibilityLabel, height = 72 }: {
  title: string; onPress: () => void; accessibilityLabel?: string; height?: number;
}) {
  const cap = height * 0.9;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? title} onPress={() => { play('tap', 0.5); onPress(); }}
      style={({ pressed }) => ({ height, flexDirection: 'row', opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] })}>
      <Image source={BTN_IMG.left} accessibilityIgnoresInvertColors style={{ width: cap, height }} />
      <Image source={BTN_IMG.mid} accessibilityIgnoresInvertColors resizeMode="stretch" style={{ flex: 1, height }} />
      <Image source={BTN_IMG.right} accessibilityIgnoresInvertColors style={{ width: cap, height }} />
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
        <T size={21} weight="700" color="#FFFFFF" style={{ textShadowColor: 'rgba(0, 40, 60, 0.9)', textShadowRadius: 6, textShadowOffset: { width: 0, height: 1 } }}>{title}</T>
      </View>
    </Pressable>
  );
}

/** 卡片四角的金色角飾（放在 Card 裡面最後） */
export function FrameCorners({ size = 26 }: { size?: number }) {
  const base = { position: 'absolute' as const, width: size, height: size };
  return (
    <>
      <Image source={CORNER_IMG} accessibilityIgnoresInvertColors style={{ ...base, top: -2, left: -2 }} />
      <Image source={CORNER_IMG} accessibilityIgnoresInvertColors style={{ ...base, top: -2, right: -2, transform: [{ scaleX: -1 }] }} />
      <Image source={CORNER_IMG} accessibilityIgnoresInvertColors style={{ ...base, bottom: -2, left: -2, transform: [{ scaleY: -1 }] }} />
      <Image source={CORNER_IMG} accessibilityIgnoresInvertColors style={{ ...base, bottom: -2, right: -2, transform: [{ scaleX: -1 }, { scaleY: -1 }] }} />
    </>
  );
}

/** 慢慢旋轉的法陣（壓扁成橢圓，像鋪在地上） */
export function MagicCircle({ size }: { size: number }) {
  const spin = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 16000, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [spin]);
  return (
    <View style={{ width: size, height: size * 0.32, alignItems: 'center', justifyContent: 'center', overflow: 'visible' }}>
      <View style={{ transform: [{ scaleY: 0.32 }] }}>
        <Animated.Image source={FX_IMG.magicCircle} accessibilityIgnoresInvertColors
          style={{ width: size, height: size, opacity: 0.85, transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }} />
      </View>
    </View>
  );
}
