import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Platform, Pressable, View } from 'react-native';

import { LegalLinks } from '@/components/form';
import { Button, Card, ErrorBox, H1, Loading, Screen, T } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { buy, getPlans, purchasesEnabled, restore, type Plan } from '@/lib/purchases';
import { C } from '@/lib/theme';
import { goBack } from '@/lib/nav';

const BENEFITS = [
  '每天練習題數不限',
  '錯題小老師每天最多 50 次',
  '沒有廣告',
];

export default function Paywall() {
  const { refreshProfile } = useAuth();
  const [plans, setPlans] = useState<Plan[] | null>(purchasesEnabled ? null : []);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    if (!purchasesEnabled) return;
    getPlans().then(setPlans).catch(() => setError('暫時無法取得方案，請確認網路後再試。'));
  }, []);

  async function purchase(plan: Plan) {
    if (busyRef.current) return;  // 防止連點重複購買
    busyRef.current = true;
    setBusy(plan.id);
    try {
      const r = await buy(plan);
      if (r === 'purchased') {
        await refreshProfile();
        Alert.alert('購買成功', '完整版已開通，謝謝你的支持！', [{ text: '好', onPress: () => goBack() }]);
      } else if (r === 'purchased_unsynced') {
        Alert.alert('付款成功，正在開通', '網路有點慢，完整版還在開通中。請稍後回到這一頁按「恢復購買」，不會重複扣款。');
      }
    } catch {
      Alert.alert('購買沒有完成', '商店沒有完成這筆交易，所以不會扣款。請稍後再試。');
    } finally { busyRef.current = false; setBusy(null); }
  }

  async function doRestore() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy('restore');
    try {
      const ok = await restore();
      await refreshProfile();
      Alert.alert(ok ? '已恢復購買' : '沒有找到購買紀錄', ok ? '完整版已開通。' : '這個商店帳號沒有有效的訂閱。');
    } catch {
      Alert.alert('恢復失敗', '請稍後再試。');
    } finally { busyRef.current = false; setBusy(null); }
  }

  const store = Platform.OS === 'ios' ? 'App Store' : 'Google Play';

  return (
    <Screen edges={['top', 'bottom']}>
      <Pressable accessibilityRole="button" accessibilityLabel="關閉" onPress={() => goBack()} style={{ width: 44, height: 44, justifyContent: 'center' }}>
        <Ionicons name="close" size={26} color={C.muted} />
      </Pressable>
      <H1>升級完整版</H1>

      <Card dark style={{ gap: 10 }}>
        {BENEFITS.map((b) => (
          <View key={b} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <Ionicons name="checkmark-circle" size={20} color={C.mint} />
            <T color="#FFFFFF">{b}</T>
          </View>
        ))}
      </Card>

      {error ? <ErrorBox message={error} /> : !plans ? <Loading /> : plans.length === 0 ? (
        <Card><T color={C.muted}>{Platform.OS === 'web' ? '網頁版不能購買，請在手機 App 裡升級。全校前三名可以先申請免費使用。' : '付費方案即將推出。全校前三名可以先申請免費使用。'}</T></Card>
      ) : plans.map((p) => (
        <Card key={p.id} style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <T size={17} weight="700">{p.title}</T>
            <T size={20} weight="700" color={C.accent}>{p.price}</T>
          </View>
          {p.period ? <T size={13} color={C.muted}>{p.period}</T> : null}
          {p.intro ? <T size={13} color={C.accent}>{p.intro}</T> : null}
          <Button title="購買" onPress={() => purchase(p)} loading={busy === p.id} disabled={!!busy && busy !== p.id} />
        </Card>
      ))}

      <Card style={{ gap: 10 }}>
        <Button title="全校前三名免費申請" kind="secondary" onPress={() => router.replace('/top-three')} />
        {purchasesEnabled ? <Button title="恢復購買" kind="ghost" onPress={doRestore} loading={busy === 'restore'} /> : null}
      </Card>

      {plans?.length ? <T size={12} color={C.muted}>
        付款會從你的 {store} 帳號扣款。自動續訂方案會在到期時自動續約並扣款，除非在到期前至少 24 小時到 {store} 帳號的訂閱設定中取消。
        學期方案不會自動續訂。未滿 18 歲請先取得家長同意再購買。
      </T> : null}
      <LegalLinks />
    </Screen>
  );
}
