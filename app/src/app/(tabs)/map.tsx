import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, Modal, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Polyline } from 'react-native-svg';

import { Button, Chip, ErrorBox, Loading, T } from '@/components/ui';
import { GoldPill, WildImage } from '@/components/world-fx';
import { api, errorText, type MapUnit, type WorldState } from '@/lib/api';
import { bossImg, mapImg, palImg, SUBJECT_IMG, WORLD_IMG } from '@/lib/art';
import { useAuth } from '@/lib/auth';
import { BOSS_NAMES, SUBJECT_FLOWER } from '@/lib/game';
import { play, startBgm, stopBgm } from '@/lib/sound';
import { C, currentSemester, isElementarySemester, semesterLabel, semestersFor, subjectLabel, validSemester, type SemesterId } from '@/lib/theme';
import { mapHeight, nodePosition, nodeStates, palName, type NodeState } from '@/lib/world';

const STATE_LABEL: Record<NodeState, string> = { invaded: '魔物入侵中', won: '已佔領', next: '可以出征', open: '還沒探索' };

/** 世界地圖：每個學期一塊大陸，每個單元是一塊領地。打贏領地戰就佔領，錯題該複習時魔物會回來入侵。 */
export default function WorldMap() {
  const { profile } = useAuth();
  const { width } = useWindowDimensions();
  const w = Math.min(width, 640);
  const semesters = semestersFor(profile?.grade);
  // 換了年級（國小、國中的學期不同）時，自動回到那個學制的學期
  const [pick, setSem] = useState<SemesterId>(() => currentSemester(profile?.grade) ?? semesters[0].id);
  const sem = validSemester(profile?.grade, pick, currentSemester(profile?.grade));
  const [units, setUnits] = useState<MapUnit[] | null>(null);
  const [world, setWorld] = useState<WorldState | null>(null);
  const [progress, setProgress] = useState<Record<string, { total: number; won: number }>>({});
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<MapUnit | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const scrolledFor = useRef<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [m, s, pr] = await Promise.all([api.worldMap(sem), api.worldState().catch(() => null), api.worldProgress().catch(() => [])]);
      setUnits(m);
      setWorld(s);
      setProgress(Object.fromEntries(pr.map((r) => [r.semester, r])));
    } catch (e) { setError(errorText(e)); }
  }, [sem]);
  useFocusEffect(useCallback(() => { load(); startBgm('battle'); return () => stopBgm(); }, [load]));

  const h = mapHeight(w, units?.length ?? 0);
  const states = useMemo(() => nodeStates(units ?? []), [units]);
  const points = useMemo(() => (units ?? []).map((_, i) => nodePosition(i, units!.length)), [units]);
  const won = (units ?? []).filter((u) => u.won).length;
  const invaded = states.filter((s) => s === 'invaded').length;

  // 第一次顯示某個學期時，捲到「下一塊可以出征」的領地（地圖由下往上走）
  useEffect(() => {
    if (!units?.length || scrolledFor.current === sem) return;
    scrolledFor.current = sem;
    const focus = Math.max(states.indexOf('invaded'), 0) || Math.max(states.indexOf('next'), 0);
    const y = points[focus].y * h - 320;
    setTimeout(() => scrollRef.current?.scrollTo({ y: Math.max(y, 0), animated: false }), 50);
  }, [units, sem, states, points, h]);

  function go(u: MapUnit) {
    setOpen(null);
    play('tap', 0.5);
    router.push({ pathname: '/quiz', params: { mode: 'conquer', units: u.unit_id, title: u.title } });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8, gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <T size={22} weight="700" style={{ letterSpacing: 2 }}>世界地圖</T>
            <T size={12} color={C.muted}>
              {units ? `${semesterLabel(sem)}大陸・已佔領 ${won} / ${units.length} 塊` : '載入中…'}
              {invaded ? <T size={12} weight="700" color={C.redDark}>・{invaded} 塊被入侵</T> : null}
            </T>
          </View>
          {world ? <GoldPill gold={world.gold} onPress={() => router.push('/shop')} /> : null}
          <Pressable accessibilityRole="button" accessibilityLabel="我的魔物夥伴" onPress={() => router.navigate({ pathname: '/mistakes', params: { tab: 'pals' } })}
            style={{ minHeight: 36, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: C.accent,
              backgroundColor: C.accentSoft, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="paw" size={14} color={C.accent} />
            <T size={12} weight="700" color={C.accentDark}>夥伴 {world?.pals.length ?? 0}</T>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 8 }}>
          {semesters.map((s) => (
            <Chip key={s.id} label={progress[s.id] ? `${s.label} ${progress[s.id].won}/${progress[s.id].total}` : `${s.label}大陸`} selected={s.id === sem}
              onPress={() => { if (s.id !== sem) { setUnits(null); setSem(s.id); } }} />
          ))}
        </ScrollView>
      </View>

      {error ? <View style={{ padding: 16 }}><ErrorBox message={error} onRetry={load} /></View>
        : !units ? <Loading label="展開地圖中…" />
        : units.length === 0 ? <View style={{ padding: 16 }}><T color={C.muted}>這塊大陸還沒有題目。</T></View>
        : (
          <ScrollView ref={scrollRef} contentContainerStyle={{ alignItems: 'center' }}>
            {/* 大陸頂端的魔王城：段考魔王、自選範圍、模擬考 */}
            <Pressable accessibilityRole="button" accessibilityLabel={`${semesterLabel(sem)}大陸的魔王城：挑戰段考魔王、自選範圍`}
              onPress={() => router.push({ pathname: '/trials', params: { sem } })}
              style={({ pressed }) => ({ width: w - 24, marginVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 18,
                borderWidth: 2, borderColor: C.purple, backgroundColor: '#1A1033', opacity: pressed ? 0.85 : 1 })}>
              <Image source={bossImg(isElementarySemester(sem) ? BOSS_NAMES.finalterm : BOSS_NAMES.final)} accessibilityIgnoresInvertColors style={{ width: 64, height: 64 }} />
              <View style={{ flex: 1, gap: 2 }}>
                <T size={17} weight="700">{semesterLabel(sem)}魔王城</T>
                <T size={12} color={C.inkSoft}>段考魔王・自己選範圍{isElementarySemester(sem) ? '' : '・會考模擬考'}</T>
              </View>
              <Ionicons name="chevron-forward" size={22} color={C.ink} />
            </Pressable>
            <View style={{ width: w, height: h }}>
              <Image source={mapImg(sem)} accessibilityIgnoresInvertColors resizeMode="cover"
                style={{ position: 'absolute', width: w, height: h, opacity: 0.9 }} />
              <Svg width={w} height={h} style={{ position: 'absolute' }}>
                <Polyline points={points.map((p) => `${p.x * w},${p.y * h}`).join(' ')} fill="none"
                  stroke="rgba(255,255,255,0.55)" strokeWidth={4} strokeDasharray="10 8" />
              </Svg>
              {units.map((u, i) => (
                <MapNode key={u.unit_id} unit={u} state={states[i]} masterDays={world?.master_days ?? 3} left={points[i].x * w} top={points[i].y * h}
                  onPress={() => { play('tap', 0.4); setOpen(u); }} />
              ))}
              {/* 新手提示：第一次來地圖，指出要點哪裡 */}
              {world && world.territories === 0 && states.indexOf('next') >= 0 ? (
                <View pointerEvents="none" style={{ position: 'absolute', left: Math.min(Math.max(points[states.indexOf('next')].x * w - 95, 8), w - 198),
                  top: points[states.indexOf('next')].y * h - 96, width: 190, padding: 8, borderRadius: 12, backgroundColor: C.accent }}>
                  <T size={13} weight="700" color="#04121F" style={{ textAlign: 'center' }}>點這塊發亮的領地，打第一場！</T>
                </View>
              ) : null}
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 16, justifyContent: 'center' }}>
              <Legend img={WORLD_IMG.flag} label="已佔領" />
              <Legend img={WORLD_IMG.invade} label="魔物入侵（該複習了）" color={C.redDark} />
              <Legend img={WORLD_IMG.next} label="建議下一塊" color={C.accentDark} />
            </View>
          </ScrollView>
        )}

      <NodeSheet unit={open} state={open ? states[units?.findIndex((x) => x.unit_id === open.unit_id) ?? 0] ?? 'won' : 'open'} world={world} onClose={() => setOpen(null)} onGo={go}
        onGuard={async (u, species) => {
          try {
            await api.setGuard(u.unit_id, species);
            play('tap', 0.5);
            setOpen({ ...u, guard: species });
            await load();
          } catch (e) { setError(errorText(e)); }
        }} />
    </SafeAreaView>
  );
}

function Legend({ img, label, color = C.muted }: { img: number | { uri: string } | object; label: string; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Image source={img as never} accessibilityIgnoresInvertColors style={{ width: 22, height: 22 }} />
      <T size={12} color={color}>{label}</T>
    </View>
  );
}

function MapNode({ unit, state, masterDays, left, top, onPress }: {
  unit: MapUnit; state: NodeState; masterDays: number; left: number; top: number; onPress: () => void;
}) {
  const color = SUBJECT_FLOWER[unit.subject] ?? C.accent;
  const pulse = useState(() => new Animated.Value(0))[0];
  const lively = state === 'invaded' || state === 'next';
  useEffect(() => {
    if (!lively) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [lively, pulse]);
  const ring = state === 'invaded' ? C.red : state === 'open' ? '#5A6785' : color;
  const marker = state === 'invaded' ? WORLD_IMG.invade : state === 'won' ? (unit.mastery >= masterDays ? WORLD_IMG.master : WORLD_IMG.flag)
    : state === 'next' ? WORLD_IMG.next : null;
  return (
    <Pressable accessibilityRole="button" onPress={onPress}
      accessibilityLabel={`${subjectLabel(unit.subject)}，${unit.title}，${STATE_LABEL[state]}`}
      style={{ position: 'absolute', left: left - 52, top: top - 36, width: 104, alignItems: 'center', gap: 3 }}>
      <Animated.View style={{ width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#0C1430', borderWidth: state === 'open' ? 2 : 3, borderColor: ring,
        opacity: state === 'open' ? 0.85 : 1,
        transform: [{ scale: lively ? pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) : 1 }] }}>
        {state === 'invaded' ? <WildImage species={unit.species} size={56} />
          : <Image source={SUBJECT_IMG[unit.subject]} accessibilityIgnoresInvertColors style={{ width: 36, height: 36, opacity: state === 'open' ? 0.7 : 1 }} />}
        {marker ? <Image source={marker} accessibilityIgnoresInvertColors
          style={{ position: 'absolute', top: -18, right: -16, width: 36, height: 36 }} /> : null}
        {unit.guard ? <View style={{ position: 'absolute', bottom: -10, left: -14, width: 34, height: 34, borderRadius: 17, backgroundColor: '#0B1426',
          borderWidth: 2, borderColor: C.gold, alignItems: 'center', justifyContent: 'center' }}>
          <Image source={palImg(unit.guard)} accessibilityIgnoresInvertColors style={{ width: 26, height: 26 }} /></View> : null}
      </Animated.View>
      <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, backgroundColor: 'rgba(5, 10, 24, 0.88)', maxWidth: 104 }}>
        <T size={11} numberOfLines={2} weight={lively ? '700' : '400'} style={{ textAlign: 'center', lineHeight: 14 }}
          color={state === 'invaded' ? C.redDark : state === 'next' ? C.accentDark : state === 'open' ? C.muted : C.inkSoft}>
          {state === 'invaded' ? `野生${palName(unit.species)}入侵！` : unit.title}
        </T>
      </View>
    </Pressable>
  );
}

/** 點領地後從下方滑出的說明：這塊領地的狀態、會遇到的魔物、出征按鈕 */
function NodeSheet({ unit, state, world, onClose, onGo, onGuard }: {
  unit: MapUnit | null; state: NodeState; world: WorldState | null; onClose: () => void; onGo: (u: MapUnit) => void;
  onGuard: (u: MapUnit, species: string | null) => void;
}) {
  if (!unit) return null;
  const color = SUBJECT_FLOWER[unit.subject] ?? C.accent;
  const masterDays = world?.master_days ?? 3;
  const mastered = unit.mastery >= masterDays;
  const reward = !unit.won ? '打贏就佔領這塊領地，還能收服這隻魔物當夥伴。'
    : unit.rewarded_today ? '今天已經在這裡收服過了，再打可以練功、賺答題金幣。'
    : state === 'invaded' ? `有 ${unit.due} 題錯題該複習了。打贏就把領地收回來，還能再收服一次。`
    : '再打贏一次可以多收服一隻，夥伴會越來越強。';
  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <Pressable accessibilityLabel="關閉" onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.55)' }} />
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: C.card, borderTopLeftRadius: 20, borderTopRightRadius: 20,
        borderTopWidth: 2, borderColor: state === 'invaded' ? C.red : color }}>
        <View style={{ padding: 18, gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Image source={SUBJECT_IMG[unit.subject]} accessibilityIgnoresInvertColors style={{ width: 44, height: 44 }} />
            <View style={{ flex: 1 }}>
              <T size={18} weight="700">{unit.title}</T>
              <T size={13} color={state === 'invaded' ? C.redDark : C.muted}>
                {subjectLabel(unit.subject)}・{STATE_LABEL[state]}{unit.wins ? `・打贏 ${unit.wins} 次` : ''}
              </T>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14,
            backgroundColor: C.night, borderWidth: 1, borderColor: C.nightLine }}>
            <Image source={palImg(unit.species)} accessibilityIgnoresInvertColors style={{ width: 72, height: 72 }} />
            <View style={{ flex: 1, gap: 2 }}>
              <T weight="700">這裡出沒：{palName(unit.species)}</T>
              <T size={13} color={C.inkSoft}>{reward}</T>
            </View>
          </View>
          {unit.won ? (
            <>
              {/* 熟練度：在不同的日子打贏幾次；滿了就變金旗 */}
              <View accessibilityLabel={`熟練度 ${Math.min(unit.mastery, masterDays)} / ${masterDays}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <T size={13} weight="700" color={mastered ? C.gold : C.inkSoft}>熟練度</T>
                {Array.from({ length: masterDays }, (_, i) => (
                  <Ionicons key={i} name={i < unit.mastery ? 'star' : 'star-outline'} size={18} color={i < unit.mastery ? C.gold : C.faint} />
                ))}
                <T size={12} color={C.muted} style={{ flex: 1 }}>{mastered ? '已熟練，金旗領地' : `在 ${masterDays} 個不同的日子打贏就熟練（+50 金幣）`}</T>
              </View>
              {/* 守護者：派一隻夥伴駐守，收回這塊領地時多 10 金幣 */}
              {world?.pals.length ? (
                <View style={{ gap: 6 }}>
                  <T size={13} weight="700" color={C.inkSoft}>守護者 <T size={12} color={C.muted}>（收回這塊領地時多 10 金幣；一隻夥伴只能守一塊）</T></T>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    <Pressable accessibilityRole="button" accessibilityLabel="不派守護者" onPress={() => onGuard(unit, null)}
                      style={{ width: 64, height: 64, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: unit.guard ? 1 : 2,
                        borderColor: unit.guard ? C.line : C.gold, backgroundColor: C.bg }}>
                      <T size={12} color={C.muted}>不派</T>
                    </Pressable>
                    {world.pals.map((p) => (
                      <Pressable key={p.species} accessibilityRole="button" accessibilityLabel={`派 ${palName(p.species)} 駐守${unit.guard === p.species ? '，駐守中' : ''}`}
                        onPress={() => onGuard(unit, p.species)}
                        style={{ width: 64, height: 64, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: unit.guard === p.species ? 2 : 1,
                          borderColor: unit.guard === p.species ? C.gold : C.line, backgroundColor: C.bg }}>
                        <Image source={palImg(p.species)} accessibilityIgnoresInvertColors style={{ width: 48, height: 48 }} />
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              ) : null}
            </>
          ) : null}
          <T size={12} color={C.muted} style={{ textAlign: 'center' }}>領地戰最多 5 題，答對 3 題就贏</T>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button title="關閉" kind="secondary" style={{ flex: 1 }} onPress={onClose} />
            <Button title={state === 'invaded' ? '收回領地' : unit.won ? '再挑戰一次' : '出征'} kind={state === 'invaded' ? 'danger' : 'primary'}
              style={{ flex: 2 }} onPress={() => onGo(unit)} />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
