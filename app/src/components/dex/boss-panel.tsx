import { router } from 'expo-router';
import { Image, View } from 'react-native';

import { Stars } from '@/components/game-fx';
import { Button, Card, T } from '@/components/ui';
import { bossImg } from '@/lib/art';
import { BOSS_NAMES } from '@/lib/game';
import { C, semesterLabel, subjectLabel } from '@/lib/theme';

type Best = { boss_key: string; best_stars: number; clears: number };

/** 魔王圖鑑：每一種段考魔王打過的最好紀錄。魔王住在每塊大陸頂端的魔王城（地圖上）。 */
export function BossPanel({ bests, elementary }: { bests: Best[]; elementary: boolean }) {
  const kinds = elementary ? ['midterm', 'finalterm'] : ['exam1', 'exam2', 'exam3', 'final'];
  return (
    <View style={{ gap: 12 }}>
      <T size={13} color={C.muted}>魔王住在每塊大陸頂端的魔王城。選科目和段考，打一整份段考範圍的卷子；三顆星打敗魔王第一次會送保護卡。</T>
      {kinds.map((k) => {
        // 魔王代號：學期-科目-階段（例如 7A-math-exam1）
        const mine = bests.filter((b) => b.boss_key.endsWith(`-${k}`));
        const best = mine.reduce((m, b) => Math.max(m, b.best_stars), 0);
        const three = mine.filter((b) => b.best_stars === 3);
        const name = BOSS_NAMES[k];
        return (
          <Card key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, opacity: mine.length ? 1 : 0.8 }}>
            <View style={{ width: 72, height: 72, borderRadius: 14, backgroundColor: C.night, alignItems: 'center', justifyContent: 'center' }}>
              <Image source={bossImg(name)} accessibilityIgnoresInvertColors
                style={{ width: 66, height: 66, ...(mine.length ? null : { tintColor: '#2B3A62' }) }} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <T weight="700">{mine.length ? name : '？？？'}</T>
              {mine.length ? (
                <>
                  <Stars n={best} size={16} />
                  <T size={12} color={C.muted}>挑戰 {mine.reduce((n, b) => n + b.clears, 0)} 次・三星 {three.length} 個範圍</T>
                  {three.length ? (
                    <T size={11} color={C.muted} numberOfLines={2}>
                      {three.slice(0, 4).map((b) => { const [sem, sub] = b.boss_key.split('-'); return `${semesterLabel(sem)}${subjectLabel(sub, sem)}`; }).join('、')}
                    </T>
                  ) : null}
                </>
              ) : <T size={12} color={C.muted}>還沒遇過。到地圖的魔王城挑戰牠。</T>}
            </View>
          </Card>
        );
      })}
      <Button title="去魔王城" kind="secondary" onPress={() => router.push('/trials')} />
    </View>
  );
}
