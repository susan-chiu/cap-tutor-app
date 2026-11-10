import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Image, Pressable, Switch, View } from 'react-native';

import { Card, ErrorBox, H1, Loading, Screen, T } from '@/components/ui';
import { api, errorText, type Leaderboard } from '@/lib/api';
import { MEDAL_IMG } from '@/lib/art';
import { titleFor } from '@/lib/game';
import { goBack } from '@/lib/nav';
import { C } from '@/lib/theme';


/** 匿名週排行：只顯示植物代號與等級（不顯示暱稱），每週一重新開始；國中、國小分開排 */
export default function LeaderboardScreen() {
  const [data, setData] = useState<Leaderboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try { setError(null); setData(await api.leaderboard()); } catch (e) { setError(errorText(e)); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function toggleHidden(hidden: boolean) {
    setBusy(true);
    try { await api.setLeaderboardHidden(hidden); await load(); }
    catch (e) { Alert.alert('設定失敗', errorText(e)); }
    finally { setBusy(false); }
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <Pressable accessibilityRole="button" accessibilityLabel="返回" onPress={() => goBack()}
        style={{ width: 44, height: 44, justifyContent: 'center' }}>
        <Ionicons name="chevron-back" size={26} color={C.ink} />
      </Pressable>
      <H1>本週排行</H1>
      <T color={C.muted}>
        比的是這週（從星期一開始）得到的 XP，每週一重新開始。{data?.school === 'elementary' ? '這是國小組。' : '這是國中組。'}
        排行榜只顯示植物代號和等級，不會出現你的暱稱。
      </T>

      {error ? <ErrorBox message={error} onRetry={load} /> : !data ? <Loading /> : (
        <>
          <Card dark style={{ gap: 6 }}>
            <T size={13} color="#C9D1CF">我的代號</T>
            <T size={22} weight="700" color="#FFFFFF">{data.me.alias}</T>
            <T color="#C9D1CF">
              Lv {data.me.level} {titleFor(data.me.level)} · 本週 {data.me.xp} XP
              {data.me.hidden ? ' · 已隱藏' : data.me.rank ? ` · 第 ${data.me.rank} 名` : ' · 這週還沒上榜，答對一題就能上榜'}
            </T>
          </Card>

          <Card style={{ gap: 0, paddingVertical: 4 }}>
            {data.top.length === 0 ? <T color={C.muted} style={{ paddingVertical: 12 }}>這週還沒有人上榜，第一名就是你！</T> : null}
            {data.top.map((r, i) => (
              <View key={`${r.rank}-${r.alias}`} accessibilityLabel={`第 ${r.rank} 名 ${r.alias}，等級 ${r.level}，本週 ${r.xp} XP${r.me ? '，是你' : ''}`}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10,
                  borderTopWidth: i ? 1 : 0, borderTopColor: C.line,
                  backgroundColor: r.me ? C.accentSoft : undefined, marginHorizontal: -16, paddingHorizontal: 16 }}>
                <View style={{ width: 30, alignItems: 'center' }}>
                  {r.rank <= 3 ? <Image source={MEDAL_IMG[r.rank - 1]} accessibilityLabel={`第 ${r.rank} 名`} style={{ width: 30, height: 34 }} />
                    : <T weight="700" color={C.muted}>{r.rank}</T>}
                </View>
                <View style={{ flex: 1 }}>
                  <T weight="700">{r.alias}{r.me ? '（你）' : ''}</T>
                  <T size={12} color={C.muted}>Lv {r.level} {titleFor(r.level)}</T>
                </View>
                <T weight="700" color={C.accent}>{r.xp} XP</T>
              </View>
            ))}
          </Card>

          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <T weight="700">不要出現在排行榜</T>
              <T size={13} color={C.muted}>打開後別人看不到你，你的 XP 和等級照樣累積。</T>
            </View>
            <Switch value={data.me.hidden} disabled={busy} onValueChange={toggleHidden}
              accessibilityLabel="不要出現在排行榜" trackColor={{ true: C.green }} />
          </Card>
        </>
      )}
    </Screen>
  );
}
