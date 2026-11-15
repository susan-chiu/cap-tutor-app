import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, type ImageSourcePropType, useWindowDimensions, View, Pressable } from 'react-native';

import { T } from '@/components/ui';
import { FX_IMG, palImg } from '@/lib/art';
import type { Hero } from '@/lib/heroes';
import { BOSS_HEARTS } from '@/lib/game';
import { play } from '@/lib/sound';
import { C } from '@/lib/theme';

/** 舞台大小：矮螢幕（小手機）縮小，題目才不會被擠到畫面外 */
const stageSize = (height: number) => (height < 700 ? { h: 150, monster: 96 } : { h: 230, monster: 150 });

/** 每答對一題打掉的血量（畫面上的數字；魔物總血量＝題數 × 這個值） */
const HIT_DAMAGE = 100;
const DMG_SHADOW = { textShadowColor: 'rgba(0, 0, 0, 0.95)', textShadowRadius: 6, textShadowOffset: { width: 0, height: 2 } } as const;
/** 連擊播報的字與顏色 */
const streakCall = (combo: number) => (combo >= 5 ? '勢不可擋！' : combo === 4 ? '四連擊！' : combo === 3 ? '三連擊！' : combo === 2 ? '雙連擊！' : '命中！');
const streakColor = (combo: number) => (combo >= 4 ? '#FF7AF0' : combo === 3 ? C.gold : combo === 2 ? C.accent : '#FFFFFF');

/** 絕招鈕：顯示能量格；集滿會跳動發光，可以按；按下後變成「就緒」等下一次答對 */
function UltButton({ energy, need, armed, onPress }: { energy: number; need: number; armed: boolean; onPress?: () => void }) {
  const ready = energy >= need && !armed;
  const pulse = useBob(450);
  const label = armed ? '絕招已就緒，下一題答對就會發動' : ready ? '絕招集滿了，按一下準備發動' : `絕招能量 ${energy} / ${need}`;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={!ready || !onPress}
      onPress={() => { play('levelup', 0.5); onPress?.(); }} hitSlop={8}
      style={{ position: 'absolute', right: 8, bottom: 6, alignItems: 'center' }}>
      <Animated.View style={{ width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center',
        backgroundColor: armed ? '#4A3A00' : ready ? '#3A2E00' : 'rgba(5, 10, 24, 0.82)', borderWidth: armed || ready ? 3 : 2,
        borderColor: armed || ready ? C.gold : C.nightLine,
        transform: [{ scale: ready ? pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.14] }) : 1 }] }}>
        <Ionicons name="flash" size={22} color={armed || ready ? C.gold : energy > 0 ? C.accent : C.faint} />
        <View style={{ flexDirection: 'row', gap: 2, marginTop: 1 }}>
          {Array.from({ length: need }, (_, i) => (
            <View key={i} style={{ width: 7, height: 4, borderRadius: 2, backgroundColor: i < energy || armed ? (armed || ready ? C.gold : C.accent) : C.nightSoft }} />
          ))}
        </View>
      </Animated.View>
      {armed || ready ? <T size={10} weight="700" color={C.gold} style={DMG_SHADOW}>{armed ? '就緒' : '放絕招'}</T> : null}
    </Pressable>
  );
}

/** 角色頭上的血條（分格） */
function HeadBar({ value, color, segments }: { value: number; color: string; segments: number }) {
  return (
    <View style={{ height: 9, borderRadius: 3, backgroundColor: 'rgba(5, 8, 20, 0.85)', borderWidth: 1, borderColor: '#0A0F1E', overflow: 'hidden' }}>
      <View style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, height: '100%', backgroundColor: color }} />
      {Array.from({ length: Math.max(Math.min(segments, 15) - 1, 0) }, (_, i) => (
        <View key={i} style={{ position: 'absolute', top: 0, bottom: 0, width: 1, left: `${((i + 1) / Math.min(segments, 15)) * 100}%`, backgroundColor: 'rgba(5, 8, 20, 0.9)' }} />
      ))}
    </View>
  );
}

/** 原地上下浮動（待機動作） */
function useBob(duration: number) {
  const v = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(v, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [v, duration]);
  return v;
}

/**
 * 戰鬥舞台（橫向對戰）：勇者和出戰夥伴站在左邊，魔物（或魔王）在右邊。
 * 答對：勇者衝上前揮劍，劍光劃過、魔物被擊退閃白、跳出傷害字；連擊變成金色暴擊、整個畫面震動。
 * 答錯：魔物撲過來反擊，畫面閃紅、勇者被震退。血量歸零時魔物化成光點消散。
 */
export function BattleStage({ name, image, attackImage, arena, hp, maxHp, hearts, hit, crit, miss = 0, combo = 0, hero, pal, energy = 0, energyNeed = 3, ultArmed = false, onUlt }: {
  name: string; image: ImageSourcePropType; arena: ImageSourcePropType;
  /** 魔物反擊時的動作圖（沒有就用原圖撲過去） */
  attackImage?: ImageSourcePropType;
  hp: number; maxHp: number; hearts?: number | null;
  /** 每答對一題加 1，觸發攻擊特效 */
  hit: number;
  /** 這一擊是不是絕招 */
  crit: boolean;
  /** 每答錯一次加 1，觸發魔物反擊 */
  miss?: number;
  combo?: number;
  hero?: Hero;
  /** 出戰夥伴的種類（沒有就不顯示） */
  pal?: string | null;
  /** 絕招能量：集滿後按下絕招鈕，下一次答對就放絕招 */
  energy?: number; energyNeed?: number; ultArmed?: boolean; onUlt?: () => void;
}) {
  const { width: w, height } = useWindowDimensions();
  const { h: STAGE_H, monster } = stageSize(height);
  const k = monster / 150;
  const shake = useState(() => new Animated.Value(0))[0];      // 魔物被擊退
  const quake = useState(() => new Animated.Value(0))[0];      // 整個畫面震動
  const lunge = useState(() => new Animated.Value(0))[0];      // 勇者衝刺
  const bite = useState(() => new Animated.Value(0))[0];       // 魔物反擊
  const slash = useState(() => new Animated.Value(0))[0];
  const flash = useState(() => new Animated.Value(0))[0];
  const white = useState(() => new Animated.Value(0))[0];      // 魔物受擊閃白
  const red = useState(() => new Animated.Value(0))[0];        // 被反擊時畫面閃紅
  const dmg = useState(() => new Animated.Value(0))[0];        // 傷害字
  const fade = useState(() => new Animated.Value(1))[0];
  const dust = useState(() => new Animated.Value(0))[0];
  const hurt = useState(() => new Animated.Value(0))[0];       // 勇者受擊姿勢顯示的時間
  const dmgBad = useState(() => new Animated.Value(0))[0];     // 被反擊的字
  const banner = useState(() => new Animated.Value(0))[0];     // 連擊播報
  const idle = useBob(1100);
  const idleHero = useBob(1500);
  const defeated = hp <= 0;
  const wasDefeated = useRef(false);

  useEffect(() => {
    if (!hit) return;
    setTimeout(() => play('slash', 0.6), 120);
    setTimeout(() => play('hit', 0.6), 260);
    [slash, flash, white, dmg, lunge, banner].forEach((v) => v.setValue(0));
    Animated.parallel([
      // 勇者衝上前再退回
      Animated.sequence([
        Animated.timing(lunge, { toValue: 1, duration: 160, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.delay(120),
        Animated.timing(lunge, { toValue: 0, duration: 260, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(120),
        Animated.timing(slash, { toValue: 1, duration: 360, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(240),
        Animated.timing(flash, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.timing(flash, { toValue: 0, duration: 380, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(240),
        Animated.timing(white, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(white, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]),
      // 魔物被擊退
      Animated.sequence([
        Animated.delay(240),
        Animated.timing(shake, { toValue: 1, duration: 70, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -0.5, duration: 70, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0.3, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]),
      // 暴擊時整個畫面震動
      ...(crit ? [Animated.sequence([
        Animated.delay(240),
        Animated.timing(quake, { toValue: 1, duration: 40, useNativeDriver: true }),
        Animated.timing(quake, { toValue: -1, duration: 40, useNativeDriver: true }),
        Animated.timing(quake, { toValue: 0.6, duration: 40, useNativeDriver: true }),
        Animated.timing(quake, { toValue: 0, duration: 40, useNativeDriver: true }),
      ])] : []),
      Animated.sequence([
        Animated.delay(260),
        Animated.timing(dmg, { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
      // 連擊播報：大字從畫面中央彈出
      Animated.sequence([
        Animated.delay(420),
        Animated.timing(banner, { toValue: 1, duration: 1300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hit]);

  useEffect(() => {
    if (!miss) return;
    [bite, red, dmgBad, banner, hurt].forEach((v) => v.setValue(0));
    Animated.parallel([
      Animated.sequence([
        Animated.delay(150),
        Animated.timing(hurt, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.delay(520),
        Animated.timing(hurt, { toValue: 0, duration: 160, useNativeDriver: true }),
      ]),
      // 魔物撲向勇者再退回
      Animated.sequence([
        Animated.timing(bite, { toValue: 1, duration: 180, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.timing(bite, { toValue: 0, duration: 320, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(160),
        Animated.timing(red, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.timing(red, { toValue: 0, duration: 420, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(160),
        Animated.timing(quake, { toValue: 1, duration: 45, useNativeDriver: true }),
        Animated.timing(quake, { toValue: -1, duration: 45, useNativeDriver: true }),
        Animated.timing(quake, { toValue: 0.5, duration: 45, useNativeDriver: true }),
        Animated.timing(quake, { toValue: 0, duration: 45, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(160),
        Animated.timing(dmgBad, { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [miss]);

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

  const stageW = Math.min(w, 640);
  const heroH = STAGE_H * 0.86;
  const heroW = heroH * (2 / 3);
  const ground = 10;                                 // 角色腳底離舞台底部的距離
  const monsterX = stageW * 0.5 + stageW * 0.2 - monster / 2;   // 魔物在舞台右邊
  const monsterTop = STAGE_H - ground - monster - 6;
  const reach = Math.max(monsterX - heroW * 0.75, 30);          // 勇者衝刺的距離
  return (
    <View accessibilityLabel={`${name} 血量 ${Math.max(hp, 0)} / ${maxHp}${hearts != null ? `，你的愛心 ${hearts} 顆` : ''}`}
      style={{ height: STAGE_H, overflow: 'hidden', backgroundColor: C.night, alignItems: 'center' }}>
      <Animated.View style={{ width: w, height: STAGE_H, alignItems: 'center',
        transform: [{ translateX: quake.interpolate({ inputRange: [-1, 1], outputRange: [-7, 7] }) }] }}>
        {/* 戰場：只取場景上半部，下方加深當地面 */}
        <Image source={arena} accessibilityIgnoresInvertColors resizeMode="cover"
          style={{ position: 'absolute', top: -stageW * 0.1, left: -10, width: w + 20, height: w * 16 / 9 }} />
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: STAGE_H * 0.14, backgroundColor: 'rgba(5, 8, 20, 0.45)' }} />

        <View style={{ width: stageW, height: STAGE_H }}>
          {/* 腳下的影子，讓角色像站在地上 */}
          <View style={{ position: 'absolute', left: heroW * 0.14, bottom: ground - 6, width: heroW * 0.72, height: 14, borderRadius: 999, backgroundColor: 'rgba(0, 0, 0, 0.55)' }} />
          <Animated.View style={{ position: 'absolute', left: monsterX + monster * 0.14, bottom: ground - 6, width: monster * 0.72, height: 16, borderRadius: 999, backgroundColor: 'rgba(0, 0, 0, 0.55)',
            opacity: fade, transform: [{ scaleX: idle.interpolate({ inputRange: [0, 1], outputRange: [1, 0.86] }) }] }} />

          {/* 出戰夥伴：跟在勇者後面 */}
          {pal ? (
            <Animated.Image source={palImg(pal)} accessibilityIgnoresInvertColors
              style={{ position: 'absolute', left: heroW * 0.62, bottom: ground - 2, width: monster * 0.42, height: monster * 0.42,
                transform: [{ translateY: idle.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) },
                  { translateX: lunge.interpolate({ inputRange: [0, 1], outputRange: [0, reach * 0.3] }) }] }} />
          ) : null}

          {/* 絕招集氣：能量集滿或就緒時，勇者腳下出現光環 */}
          {hero && (ultArmed || energy >= energyNeed) ? (
            <Animated.Image source={FX_IMG.ultCharge} accessibilityIgnoresInvertColors resizeMode="contain"
              style={{ position: 'absolute', left: -heroW * 0.2, bottom: ground - heroW * 0.42, width: heroW * 1.25, height: heroW * 1.25,
                opacity: idle.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] }),
                transform: [{ scaleY: 0.45 }, { scale: idle.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1.06] }) }] }} />
          ) : null}

          {/* 勇者：平常是站姿；答對換成攻擊動作衝上前，被反擊換成受擊動作後退 */}
          {hero ? (
            <Animated.View style={{ position: 'absolute', left: -heroW * 0.08, bottom: ground - 4, width: heroW, height: heroH,
              transform: [
                { translateX: Animated.add(lunge.interpolate({ inputRange: [0, 1], outputRange: [0, reach] }),
                    hurt.interpolate({ inputRange: [0, 1], outputRange: [0, -12] })) },
                { translateY: idleHero.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) },
              ] }}>
              <Animated.Image source={hero.full} accessibilityIgnoresInvertColors resizeMode="contain"
                style={{ position: 'absolute', width: heroW, height: heroH,
                  opacity: Animated.subtract(1, Animated.add(lunge.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 1] }), hurt)).interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolate: 'clamp' }) }} />
              <Animated.Image source={hero.attack} accessibilityIgnoresInvertColors resizeMode="contain"
                style={{ position: 'absolute', left: -heroW * 0.15, top: -heroH * 0.1, width: heroW * 1.3, height: heroH * 1.2,
                  opacity: lunge.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 1] }) }} />
              <Animated.Image source={hero.hurt} accessibilityIgnoresInvertColors resizeMode="contain"
                style={{ position: 'absolute', width: heroW, height: heroH, opacity: hurt }} />
            </Animated.View>
          ) : null}

          {/* 魔物：待機時上下浮動，被打到會後退，答錯時撲過來 */}
          <Animated.View style={{ position: 'absolute', left: monsterX, top: monsterTop, width: monster, height: monster, opacity: fade,
            transform: [
              { translateX: Animated.add(shake.interpolate({ inputRange: [-1, 1], outputRange: [-16, 16] }),
                  bite.interpolate({ inputRange: [0, 1], outputRange: [0, -(monsterX - heroW * 0.55)] })) },
              { translateY: idle.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) },
              { scale: Animated.add(idle.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] }), bite.interpolate({ inputRange: [0, 1], outputRange: [0, 0.18] })) },
            ] }}>
            <Animated.Image source={image} accessibilityIgnoresInvertColors style={{ width: monster, height: monster,
              opacity: attackImage ? bite.interpolate({ inputRange: [0, 0.25, 1], outputRange: [1, 0, 0] }) : 1 }} />
            {attackImage ? <Animated.Image source={attackImage} accessibilityIgnoresInvertColors resizeMode="contain"
              style={{ position: 'absolute', left: -monster * 0.1, top: -monster * 0.1, width: monster * 1.2, height: monster * 1.2,
                opacity: bite.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0, 1, 1] }) }} /> : null}
            {/* 受擊閃白 */}
            <Animated.Image source={image} accessibilityIgnoresInvertColors
              style={{ position: 'absolute', width: monster, height: monster, tintColor: '#FFFFFF', opacity: white }} />
          </Animated.View>

          {/* 劍光 */}
          <Animated.Image source={crit ? FX_IMG.ultBurst : FX_IMG.slash} style={{
            position: 'absolute', left: monsterX - 20 * k, top: monsterTop - 18 * k, width: 190 * k, height: 190 * k,
            opacity: slash.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 1, 1, 0] }),
            transform: [
              { translateX: crit ? 0 : slash.interpolate({ inputRange: [0, 1], outputRange: [-40, 30] }) },
              { scale: slash.interpolate({ inputRange: [0, 1], outputRange: crit ? [0.5, 1.35] : [0.8, 1.15] }) },
            ],
          }} />
          {/* 命中閃光 */}
          <Animated.Image source={FX_IMG.hit} style={{
            position: 'absolute', left: monsterX, top: monsterTop, width: monster, height: monster, opacity: flash,
            transform: [{ scale: flash.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.3] }) }],
          }} />
          {/* 打倒後化成光點 */}
          <Animated.Image source={FX_IMG.dissolve} style={{
            position: 'absolute', left: monsterX - 10 * k, top: monsterTop - 10 * k, width: 170 * k, height: 170 * k,
            opacity: dust.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 1, 1, 0] }),
            transform: [{ translateY: dust.interpolate({ inputRange: [0, 1], outputRange: [20, -30] }) }],
          }} />

          {/* 傷害數字：打中魔物跳黃字（暴擊更大），被反擊在勇者頭上跳紅字 */}
          <Animated.View pointerEvents="none" style={{ position: 'absolute', top: monsterTop + monster * 0.1, left: monsterX - 20, width: monster + 40, alignItems: 'center',
            opacity: dmg.interpolate({ inputRange: [0, 0.1, 0.75, 1], outputRange: [0, 1, 1, 0] }),
            transform: [{ translateY: dmg.interpolate({ inputRange: [0, 1], outputRange: [10, -34] }) },
              { scale: dmg.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0.6, 1.3, 1] }) }] }}>
            <T size={crit ? 30 : 24} weight="700" color={crit ? C.gold : '#FFFFFF'} style={DMG_SHADOW}>-{crit ? HIT_DAMAGE * 3 : HIT_DAMAGE}</T>
            {crit ? <T size={13} weight="700" color={C.gold} style={DMG_SHADOW}>絕招</T> : null}
          </Animated.View>
          <Animated.View pointerEvents="none" style={{ position: 'absolute', top: STAGE_H * 0.3, left: 0, width: heroW, alignItems: 'center',
            opacity: dmgBad.interpolate({ inputRange: [0, 0.1, 0.75, 1], outputRange: [0, 1, 1, 0] }),
            transform: [{ translateY: dmgBad.interpolate({ inputRange: [0, 1], outputRange: [10, -30] }) },
              { scale: dmgBad.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0.6, 1.3, 1] }) }] }}>
            <T size={22} weight="700" color="#FF4D6D" style={DMG_SHADOW}>{hearts != null ? '-1 ♥' : '被反擊！'}</T>
          </Animated.View>

          {/* 頭上的血條：魔物紅色，勇者綠色（魔王戰顯示愛心） */}
          <Animated.View style={{ position: 'absolute', left: monsterX - 6, top: Math.max(monsterTop - 38, 2), width: monster + 12, opacity: fade }}>
            <T size={11} weight="700" color="#FFFFFF" numberOfLines={1} style={[DMG_SHADOW, { textAlign: 'center' }]}>{name}</T>
            <HeadBar value={maxHp ? Math.max(hp, 0) / maxHp : 0} color={C.red} segments={maxHp} />
            <T size={10} weight="700" color="#E6ECF7" style={[DMG_SHADOW, { textAlign: 'right', lineHeight: 13 }]}>HP {Math.max(hp, 0)} / {maxHp}</T>
          </Animated.View>
          {hero ? (
            <View style={{ position: 'absolute', left: 6, top: 4, width: heroW }}>
              <T size={11} weight="700" color="#FFFFFF" numberOfLines={1} style={[DMG_SHADOW, { textAlign: 'center' }]}>{hero.name}</T>
              <HeadBar value={hearts != null ? hearts / BOSS_HEARTS : 1} color={C.green} segments={hearts != null ? BOSS_HEARTS : 1} />
            </View>
          ) : null}

        </View>

        {/* 被反擊時畫面閃紅 */}
        <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#FF0033',
          opacity: red.interpolate({ inputRange: [0, 1], outputRange: [0, 0.32] }) }} />
      </Animated.View>

      {/* 絕招鈕：答對會集氣，集滿後按下去，下一次答對就放絕招 */}
      <UltButton energy={energy} need={energyNeed} armed={ultArmed} onPress={onUlt} />
      {/* 連擊播報：像對戰遊戲的擊殺播報，大字從中央彈出 */}
      <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: STAGE_H * 0.3, alignItems: 'center',
        opacity: banner.interpolate({ inputRange: [0, 0.08, 0.8, 1], outputRange: [0, 1, 1, 0] }),
        transform: [{ scale: banner.interpolate({ inputRange: [0, 0.12, 0.2, 1], outputRange: [2.2, 0.95, 1, 1] }) }] }}>
        <View style={{ paddingHorizontal: 22, paddingVertical: 4, backgroundColor: 'rgba(5, 8, 20, 0.6)', borderTopWidth: 2, borderBottomWidth: 2,
          borderColor: defeated || crit ? C.gold : streakColor(combo) }}>
          <T size={26} weight="700" color={defeated || crit ? C.gold : streakColor(combo)}
            style={[DMG_SHADOW, { letterSpacing: 4, fontStyle: 'italic' }]}>{defeated ? (crit ? '絕招擊敗！' : '擊敗！') : crit ? '絕招！' : streakCall(combo)}</T>
        </View>
      </Animated.View>
    </View>
  );
}
