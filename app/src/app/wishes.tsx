import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, TextInput, View } from 'react-native';

import { Button, Card, Chip, ErrorBox, H1, H2, Loading, ProgressBar, Screen, T, Tag } from '@/components/ui';
import { api, errorText, type Wish, type WishGoal } from '@/lib/api';
import { WISH_GOAL, WISH_STATUS } from '@/lib/game';
import { goBack } from '@/lib/nav';
import { C } from '@/lib/theme';

const EXAMPLES = ['週末多玩 1 小時手機', '吃一次鹹酥雞', '週末看一部電影', '買一本想看的漫畫'];

/** 許願池：學生許願＋設定目標，家長核准後開始計算，達成後請家長兌現 */
export default function Wishes() {
  const [list, setList] = useState<Wish[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [goalType, setGoalType] = useState<WishGoal>('correct');
  const [goal, setGoal] = useState(WISH_GOAL.correct.presets[1]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try { setError(null); setList(await api.myWishes()); } catch (e) { setError(errorText(e)); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function make() {
    setBusy(true);
    try {
      await api.makeWish(title.trim(), goalType, goal);
      setTitle('');
      Alert.alert('願望送出了！', '請爸媽打開 App 核准，核准之後開始計算進度。（家長要先用你的邀請碼綁定帳號）');
      await load();
    } catch (e) { Alert.alert('送出失敗', errorText(e)); } finally { setBusy(false); }
  }

  function cancel(w: Wish) {
    Alert.alert('取消這個願望？', w.title, [
      { text: '保留', style: 'cancel' },
      { text: '取消願望', style: 'destructive', onPress: () => { api.cancelWish(w.id).then(load).catch((e) => Alert.alert('取消失敗', errorText(e))); } },
    ]);
  }

  const g = WISH_GOAL[goalType];
  return (
    <Screen edges={['top', 'bottom']}>
      <Pressable accessibilityRole="button" accessibilityLabel="返回" onPress={() => goBack()}
        style={{ width: 44, height: 44, justifyContent: 'center' }}>
        <Ionicons name="chevron-back" size={26} color={C.ink} />
      </Pressable>
      <H1>許願池</H1>
      <T color={C.muted}>許一個願望、設定修煉目標，請爸媽核准。達成之後，爸媽就會幫你兌現！</T>

      <Card style={{ gap: 10 }}>
        <H2>許新的願望</H2>
        <TextInput value={title} onChangeText={setTitle} maxLength={40} accessibilityLabel="願望內容"
          placeholder="例如：週末多玩 1 小時手機" placeholderTextColor={C.faint}
          style={{ minHeight: 48, borderWidth: 1, borderColor: C.lineStrong, borderRadius: 10, paddingHorizontal: 12, fontSize: 16, backgroundColor: C.bg, color: C.ink }} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {EXAMPLES.map((x) => <Chip key={x} label={x} selected={title === x} onPress={() => setTitle(x)} />)}
        </View>
        <T size={13} weight="700" color={C.inkSoft}>要達成的目標</T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {(Object.keys(WISH_GOAL) as WishGoal[]).map((k) => (
            <Chip key={k} label={WISH_GOAL[k].label} selected={goalType === k}
              onPress={() => { setGoalType(k); setGoal(WISH_GOAL[k].presets[1]); }} />
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {g.presets.map((n) => <Chip key={n} label={`${n} ${g.unit}`} selected={goal === n} onPress={() => setGoal(n)} />)}
        </View>
        <Button title="送給爸媽核准" onPress={make} disabled={!title.trim()} loading={busy} />
      </Card>

      {error ? <ErrorBox message={error} onRetry={load} /> : !list ? <Loading /> : list.length === 0 ? (
        <Card><T color={C.muted}>還沒有願望。許一個吧！</T></Card>
      ) : list.map((w) => (
        <Card key={w.id} style={{ gap: 8, borderColor: w.reached && w.status === 'approved' ? C.gold : C.line }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name={w.status === 'fulfilled' ? 'gift' : 'sparkles'} size={20} color={C.gold} />
            <T weight="700" style={{ flex: 1 }}>{w.title}</T>
            <Tag label={w.status === 'approved' && w.reached ? '達成！等兌現' : WISH_STATUS[w.status]}
              tone={w.status === 'fulfilled' || w.reached ? 'green' : w.status === 'rejected' ? 'red' : 'accent'} />
          </View>
          <T size={13} color={C.muted}>目標：{WISH_GOAL[w.goal_type].label} {w.goal} {WISH_GOAL[w.goal_type].unit}</T>
          {w.status === 'approved' || w.status === 'fulfilled' ? (
            <>
              <ProgressBar value={w.progress / w.goal} color={w.reached ? C.gold : C.accent} />
              <T size={12} color={C.muted}>{w.progress} / {w.goal} {WISH_GOAL[w.goal_type].unit}（爸媽核准之後開始算）</T>
            </>
          ) : null}
          {w.status !== 'fulfilled' ? (
            <Pressable accessibilityRole="button" onPress={() => cancel(w)} style={{ minHeight: 36, justifyContent: 'center' }}>
              <T size={13} color={C.muted}>取消這個願望</T>
            </Pressable>
          ) : null}
        </Card>
      ))}
    </Screen>
  );
}
