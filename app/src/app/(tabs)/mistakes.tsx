import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';

import { BossPanel } from '@/components/dex/boss-panel';
import { PalsPanel } from '@/components/dex/pals-panel';
import { WildPanel } from '@/components/dex/wild-panel';
import { ErrorBox, H1, Loading, Screen, T } from '@/components/ui';
import { api, errorText, type MistakeRow, type WorldState } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { C, isElementary, localToday, subjectsFor } from '@/lib/theme';

type Tab = 'pals' | 'wild' | 'boss';
const TABS: { id: Tab; label: string }[] = [
  { id: 'pals', label: '夥伴' },
  { id: 'wild', label: '野生魔物' },
  { id: 'boss', label: '魔王' },
];

/**
 * 圖鑑：同一個世界的三種魔物。
 * 夥伴＝已收服的（出戰隊伍在這裡排）；野生魔物＝錯題（弄懂、複習答對就淨化成夥伴的力量）；魔王＝段考魔王的最好紀錄。
 */
export default function Dex() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const { profile } = useAuth();
  // 目前的頁籤放在網址參數裡（?tab=wild），從別的畫面也能直接帶到那一頁
  const tab: Tab = params.tab === 'wild' || params.tab === 'boss' ? params.tab : 'pals';
  const [world, setWorld] = useState<WorldState | null>(null);
  const [rows, setRows] = useState<MistakeRow[] | null>(null);
  const [bests, setBests] = useState<{ boss_key: string; best_stars: number; clears: number }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [w, m, b] = await Promise.all([api.worldState(), api.mistakes(null), api.bossBests().catch(() => [])]);
      setWorld(w); setRows(m); setBests(b);
    } catch (e) { setError(errorText(e)); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const wildOpen = (rows ?? []).filter((r) => r.status !== 'graduated').length;
  const count: Record<Tab, string> = {
    pals: world ? String(world.pals.length) : '',
    wild: rows ? String(wildOpen) : '',
    boss: String(new Set(bests.map((b) => b.boss_key.split('-').pop())).size || ''),
  };
  const subjects = subjectsFor(profile?.grade).map((s) => s.id as string);

  return (
    <Screen>
      <H1>圖鑑</H1>
      <View accessibilityRole="tablist" style={{ flexDirection: 'row', padding: 4, gap: 4, borderRadius: 14, backgroundColor: C.card, borderWidth: 1, borderColor: C.line }}>
        {TABS.map((t) => {
          const on = tab === t.id;
          return (
            <Pressable key={t.id} accessibilityRole="tab" accessibilityState={{ selected: on }} aria-selected={on}
              onPress={() => router.setParams({ tab: t.id })}
              style={{ flex: 1, minHeight: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4,
                backgroundColor: on ? C.accent : 'transparent' }}>
              <T weight="700" size={14} color={on ? '#04121F' : C.inkSoft}>{t.label}</T>
              {count[t.id] ? <T size={12} weight="700" color={on ? '#04121F' : t.id === 'wild' && wildOpen ? C.red : C.muted}>{count[t.id]}</T> : null}
            </Pressable>
          );
        })}
      </View>

      {error ? <ErrorBox message={error} onRetry={load} />
        : !world || !rows ? <Loading />
        : tab === 'pals' ? <PalsPanel world={world} subjects={subjects} onChange={(w) => (w ? setWorld(w) : load())} />
        : tab === 'wild' ? <WildPanel rows={rows} today={localToday()} purifyXp={world.pal_xp.purify} />
        : <BossPanel bests={bests} elementary={isElementary(profile?.grade)} />}
    </Screen>
  );
}
