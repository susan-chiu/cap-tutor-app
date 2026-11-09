import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, View } from 'react-native';

import { Card, ErrorBox, H1, Loading, ProgressBar, Screen, T } from '@/components/ui';
import { api, errorText, type Badge } from '@/lib/api';
import { ITEM_IMG } from '@/lib/art';
import { goBack } from '@/lib/nav';
import { C } from '@/lib/theme';

const GROUP_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  連勝: 'flame', 答題: 'checkmark-done', 錯題: 'school', 花園: 'flower', 魔王: 'skull', 等級: 'star',
};
const GOLD = C.gold;

/** 成就徽章：全部由作答紀錄算出，達成就點亮 */
export default function Badges() {
  const [list, setList] = useState<Badge[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try { setError(null); setList(await api.achievements()); } catch (e) { setError(errorText(e)); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const groups = useMemo(() => {
    const m = new Map<string, Badge[]>();
    for (const b of list ?? []) m.set(b.group, [...(m.get(b.group) ?? []), b]);
    return [...m.entries()];
  }, [list]);
  const done = (list ?? []).filter((b) => b.done).length;

  return (
    <Screen edges={['top', 'bottom']}>
      <Pressable accessibilityRole="button" accessibilityLabel="返回" onPress={() => goBack()}
        style={{ width: 44, height: 44, justifyContent: 'center' }}>
        <Ionicons name="chevron-back" size={26} color={C.ink} />
      </Pressable>
      <H1>成就徽章</H1>
      <T color={C.muted}>每天練習、讓錯題畢業、種花、打魔王，都能點亮徽章。</T>
      {error ? <ErrorBox message={error} onRetry={load} /> : !list ? <Loading /> : (
        <>
          <Card style={{ gap: 8 }}>
            <T size={13} color={C.muted}>已點亮</T>
            <T size={28} weight="700">{done} <T size={15} color={C.muted}>/ {list.length} 個</T></T>
            <ProgressBar value={list.length ? done / list.length : 0} color={GOLD} />
          </Card>
          {groups.map(([g, bs]) => (
            <View key={g} style={{ gap: 8 }}>
              <T weight="700" size={17}>{g}</T>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {bs.map((b) => <BadgeTile key={b.id} b={b} icon={GROUP_ICON[g] ?? 'ribbon'} />)}
              </View>
            </View>
          ))}
        </>
      )}
    </Screen>
  );
}

function BadgeTile({ b, icon }: { b: Badge; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View accessible accessibilityLabel={`${b.title}，${b.desc}，${b.done ? '已達成' : `進度 ${b.progress} / ${b.goal}`}`}
      style={{
        width: '31%', minWidth: 100, flexGrow: 1, maxWidth: 160, padding: 10, gap: 4, alignItems: 'center', borderRadius: 14,
        borderWidth: b.done ? 2 : 1, borderColor: b.done ? GOLD : C.line, backgroundColor: b.done ? C.goldSoft : C.card,
      }}>
      <View style={{ width: 64, height: 64, alignItems: 'center', justifyContent: 'center', opacity: b.done ? 1 : 0.35 }}>
        <Image source={ITEM_IMG.badgeFrame} accessibilityIgnoresInvertColors style={{ position: 'absolute', width: 64, height: 64 }} />
        <Ionicons name={b.done ? icon : 'lock-closed'} size={22} color={b.done ? GOLD : C.inkSoft} style={{ marginTop: -6 }} />
      </View>
      <T size={13} weight="700" style={{ textAlign: 'center' }}>{b.title}</T>
      <T size={11} color={C.muted} numberOfLines={3} style={{ textAlign: 'center', minHeight: 30 }}>{b.desc}</T>
      {b.done ? <T size={11} weight="700" color={C.gold}>已達成 ✦</T> : (
        <View style={{ alignSelf: 'stretch', gap: 2 }}>
          <ProgressBar value={b.goal ? b.progress / b.goal : 0} color={GOLD} height={5} />
          <T size={11} color={C.muted} style={{ textAlign: 'center' }}>{b.progress} / {b.goal}</T>
        </View>
      )}
    </View>
  );
}
