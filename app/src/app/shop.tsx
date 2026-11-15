import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Image, Pressable, View } from 'react-native';

import { Card, ErrorBox, H1, Loading, Screen, T } from '@/components/ui';
import { GoldPill } from '@/components/world-fx';
import { api, errorText, type ShopItem, type WorldState } from '@/lib/api';
import { FURNITURE_IMG, WORLD_IMG } from '@/lib/art';
import { goBack } from '@/lib/nav';
import { play } from '@/lib/sound';
import { C } from '@/lib/theme';
import { FURNITURE, SOUP } from '@/lib/world';

/** 大廳商店：金幣只能靠答題賺，用來買家具佈置勇者大廳，或喝熱湯今天多練幾題 */
export default function Shop() {
  const [world, setWorld] = useState<WorldState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try { setError(null); setWorld(await api.worldState()); } catch (e) { setError(errorText(e)); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  /** 還不能買的原因（可以買回傳 null） */
  function blocked(i: ShopItem, w: WorldState): string | null {
    if (i.kind === 'furniture' && w.owned.includes(i.id)) return '已擁有';
    if (i.need_correct > w.total_correct) return `再答對 ${i.need_correct - w.total_correct} 題解鎖`;
    if (i.need_pals > w.pals.length) return `收服 ${i.need_pals} 種夥伴解鎖`;
    if (i.id === 'soup' && w.premium) return '完整版不需要';
    if (i.id === 'soup' && w.soups_left <= 0) return '今天喝完了';
    return null;
  }

  function buy(i: ShopItem) {
    if (!world || busy) return;
    const name = i.id === 'soup' ? SOUP.name : FURNITURE[i.id]?.name ?? i.id;
    if (world.gold < i.price) {
      Alert.alert('金幣不夠', `「${name}」要 ${i.price} 金幣，還差 ${i.price - world.gold}。去世界地圖出征、多答對幾題就有了！`);
      return;
    }
    Alert.alert(`買「${name}」？`, `花 ${i.price} 金幣，買完剩 ${world.gold - i.price}。`, [
      { text: '先不要', style: 'cancel' },
      { text: '買', onPress: async () => {
        setBusy(i.id);
        try {
          const w = await api.buyItem(i.id);
          setWorld(w);
          play(i.id === 'soup' ? 'soup' : 'buy', 0.7);
          Alert.alert(i.id === 'soup' ? '喝了熱湯！' : '買好了！',
            i.id === 'soup' ? `今天可以再多練 ${w.soup_questions} 題。` : i.id === 'bed' ? `床已經擺進大廳，從今天起每天多 ${w.bed_questions} 題。` : `「${name}」已經擺進勇者大廳。`);
        } catch (e) { Alert.alert('買不了', errorText(e)); }
        finally { setBusy(null); }
      } },
    ]);
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable accessibilityRole="button" accessibilityLabel="返回" onPress={() => goBack()}
          style={{ width: 44, height: 44, justifyContent: 'center' }}>
          <Ionicons name="chevron-back" size={26} color={C.ink} />
        </Pressable>
        {world ? <GoldPill gold={world.gold} /> : null}
      </View>
      <H1>大廳商店</H1>
      <T color={C.muted}>金幣只能靠答題和出征賺（答對 1 題 +{world?.gold_correct ?? 5}），不能用錢買。買的家具會擺在勇者大廳。</T>

      {error ? <ErrorBox message={error} onRetry={load} /> : !world ? <Loading /> : (
        <>
          <Card style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 }}>
            <T size={13} color={C.muted}>今天賺了 {world.gold_today} / {world.gold_daily_max} 金幣</T>
            <T size={13} color={C.muted}>家具 {world.owned.length} / {world.shop.filter((i) => i.kind === 'furniture').length}</T>
          </Card>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {world.shop.map((i) => {
              const f = i.id === 'soup' ? { name: SOUP.name, desc: `今天多練 ${world.soup_questions} 題（剩 ${world.soups_left} 碗）` }
                : i.id === 'bed' ? { name: FURNITURE.bed.name, desc: `每天免費題數 +${world.bed_questions}` } : FURNITURE[i.id];
              if (!f) return null;
              const why = blocked(i, world);
              const owned = why === '已擁有';
              return (
                <Pressable key={i.id} accessibilityRole="button" disabled={!!why || !!busy} onPress={() => buy(i)}
                  accessibilityLabel={`${f.name}，${f.desc}，${why ?? `${i.price} 金幣`}`}
                  style={({ pressed }) => ({ width: '47%', flexGrow: 1, alignItems: 'center', gap: 4, padding: 10, borderRadius: 16,
                    backgroundColor: C.card, borderWidth: 1, borderColor: owned ? C.green : why ? C.line : C.gold,
                    opacity: busy === i.id || pressed ? 0.7 : 1 })}>
                  <Image source={i.id === 'soup' ? WORLD_IMG.soup : FURNITURE_IMG[i.id]} accessibilityIgnoresInvertColors resizeMode="contain"
                    style={{ width: 96, height: 96, opacity: why && !owned ? 0.45 : 1 }} />
                  <T weight="700">{f.name}</T>
                  <T size={12} color={C.muted} style={{ textAlign: 'center' }}>{f.desc}</T>
                  {why ? <T size={13} weight="700" color={owned ? C.green : C.redDark}>{why}</T> : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Image source={WORLD_IMG.coin} accessibilityIgnoresInvertColors style={{ width: 18, height: 18 }} />
                      <T size={15} weight="700" color={world.gold >= i.price ? C.gold : C.muted}>{i.price}</T>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </>
      )}
    </Screen>
  );
}
