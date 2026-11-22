import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, View } from 'react-native';

import { Card, ProgressBar, T } from '@/components/ui';
import { api, errorText, type Quest } from '@/lib/api';
import { WORLD_IMG } from '@/lib/art';
import { play } from '@/lib/sound';
import { C } from '@/lib/theme';

const QUEST_TEXT: Record<Quest['id'], (goal: number) => string> = {
  review: (g) => `削弱 ${g} 隻野生魔物（複習答對錯題）`,
  answer: (g) => `今天作答 ${g} 題`,
  correct: (g) => `今天答對 ${g} 題`,
  conquer: (g) => `在世界地圖打贏 ${g} 塊領地`,
};

/** 每日任務：三個小任務，完成後按「領取」拿金幣。進度由伺服器依今天的作答計算。 */
export function DailyQuests({ quests, onClaimed }: { quests: Quest[]; onClaimed: (quests: Quest[], gold: number) => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const done = quests.filter((q) => q.claimed).length;

  async function claim(q: Quest) {
    if (busy) return;
    setBusy(q.id);
    try {
      const r = await api.claimQuest(q.id);
      play('coin', 0.7);
      onClaimed(r.quests, r.gold);
    } catch (e) { Alert.alert('領不了', errorText(e)); }
    finally { setBusy(null); }
  }

  return (
    <Card style={{ gap: 10, borderColor: C.gold, backgroundColor: '#0E1530' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="flash" size={18} color={C.accent} />
          <T weight="700" size={17}>今日任務</T>
        </View>
        <T size={13} weight="700" color={done === quests.length ? C.green : C.muted}>{done === quests.length ? '全部完成！' : `已領 ${done} / ${quests.length}`}</T>
      </View>
      {quests.map((q) => {
        const ready = q.progress >= q.goal && !q.claimed;
        return (
          <View key={q.id} accessibilityLabel={`${QUEST_TEXT[q.id](q.goal)}，進度 ${q.progress} / ${q.goal}，獎勵 ${q.gold} 金幣${q.claimed ? '，已領取' : ''}`}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ flex: 1, gap: 4 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <T size={14} color={q.claimed ? C.muted : C.ink}>{QUEST_TEXT[q.id](q.goal)}</T>
                <T size={13} color={C.muted}>{q.progress}/{q.goal}</T>
              </View>
              <ProgressBar value={q.goal ? q.progress / q.goal : 0} color={q.claimed ? C.lineStrong : ready ? C.gold : C.accent} />
            </View>
            {q.claimed ? (
              <View style={{ width: 76, alignItems: 'center' }}><Ionicons name="checkmark-circle" size={26} color={C.green} /></View>
            ) : ready ? (
              <Pressable accessibilityRole="button" accessibilityLabel={`領取 ${q.gold} 金幣`} disabled={!!busy} onPress={() => claim(q)}
                style={({ pressed }) => ({ width: 76, minHeight: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 3,
                  backgroundColor: C.gold, opacity: busy === q.id || pressed ? 0.7 : 1 })}>
                <T size={13} weight="700" color="#2A1D00">領 +{q.gold}</T>
              </Pressable>
            ) : (
              <Pressable accessibilityRole="button" accessibilityLabel={q.id === 'conquer' ? '去世界地圖' : q.id === 'review' ? '去複習野生魔物' : `獎勵 ${q.gold} 金幣`}
                disabled={q.id !== 'conquer' && q.id !== 'review'}
                onPress={() => (q.id === 'review' ? router.push({ pathname: '/quiz', params: { mode: 'review' } }) : router.push('/map'))}
                style={{ width: 76, minHeight: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 3,
                  borderWidth: 1, borderColor: C.line }}>
                <Image source={WORLD_IMG.coin} accessibilityIgnoresInvertColors style={{ width: 16, height: 16 }} />
                <T size={13} weight="700" color={C.gold}>{q.gold}</T>
              </Pressable>
            )}
          </View>
        );
      })}
    </Card>
  );
}

/** 新手任務：還沒佔領過任何領地時，在大廳帶學生去打第一場 */
export function StarterGuide({ heroName }: { heroName: string }) {
  const steps: [string, boolean][] = [
    [`選好勇者：${heroName}`, true],
    ['到世界地圖，點發亮的領地出征', false],
    ['答對 3 題打贏，收服第一隻魔物夥伴', false],
  ];
  return (
    <Card style={{ gap: 10, borderColor: C.accent, backgroundColor: C.accentSoft }}>
      <T weight="700" size={17} color={C.accentDark}>新手任務：收服你的第一隻夥伴</T>
      {steps.map(([text, ok], i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
            backgroundColor: ok ? C.green : 'transparent', borderWidth: ok ? 0 : 2, borderColor: C.accent }}>
            {ok ? <Ionicons name="checkmark" size={16} color="#04121F" /> : <T size={12} weight="700" color={C.accentDark}>{i + 1}</T>}
          </View>
          <T size={14} color={ok ? C.muted : C.ink} style={{ flex: 1 }}>{text}</T>
        </View>
      ))}
      <Pressable accessibilityRole="button" accessibilityLabel="去世界地圖打第一場" onPress={() => router.push('/map')}
        style={({ pressed }) => ({ minHeight: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6,
          backgroundColor: C.accent, opacity: pressed ? 0.85 : 1 })}>
        <Image source={WORLD_IMG.next} accessibilityIgnoresInvertColors style={{ width: 24, height: 24 }} />
        <T weight="700" color="#04121F">去世界地圖打第一場</T>
      </Pressable>
    </Card>
  );
}
