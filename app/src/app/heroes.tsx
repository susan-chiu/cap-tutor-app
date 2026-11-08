import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Alert, Image, Pressable, View } from 'react-native';

import { Button, Card, H1, Screen, T } from '@/components/ui';
import { api, errorText } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { HEROES, heroOf } from '@/lib/heroes';
import { goBack } from '@/lib/nav';
import { C } from '@/lib/theme';

/** 選擇戰鬥夥伴：八位勇者，選中的會站在大廳、答錯時用「心眼」給提示 */
export default function Heroes() {
  const { profile, refreshProfile } = useAuth();
  const current = heroOf(profile?.hero);
  const [sel, setSel] = useState(current.id);
  const [busy, setBusy] = useState(false);
  const h = heroOf(sel);

  async function choose() {
    setBusy(true);
    try { await api.updateProfile({ hero: h.id }); await refreshProfile(); goBack(); }
    catch (e) { Alert.alert('儲存失敗', errorText(e)); }
    finally { setBusy(false); }
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <Pressable accessibilityRole="button" accessibilityLabel="返回" onPress={() => goBack()}
        style={{ width: 44, height: 44, justifyContent: 'center' }}>
        <Ionicons name="chevron-back" size={26} color={C.ink} />
      </Pressable>
      <H1>選擇你的戰鬥夥伴</H1>
      <T color={C.muted}>夥伴會站在勇者大廳陪你修煉，答錯時用自己的方式發動「心眼」給你提示。隨時可以更換。</T>

      <Card style={{ gap: 10, borderColor: h.color, borderWidth: 1.5 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Image source={h.image} accessibilityIgnoresInvertColors
            style={{ width: 120, height: 130, borderRadius: 12, borderWidth: 1, borderColor: h.color }} />
          <View style={{ flex: 1, gap: 4 }}>
            <T size={12} color={h.color} weight="700">{h.no} · {h.job}</T>
            <T size={22} weight="700">{h.name}</T>
            <T size={12} color={C.muted}>{h.look}</T>
            <T size={13} color={C.inkSoft}>個性：{h.persona}</T>
            <T size={13} color={C.inkSoft}>心眼：{h.eyeFx}</T>
          </View>
        </View>
        <View style={{ padding: 10, borderRadius: 12, backgroundColor: C.night, borderWidth: 1, borderColor: C.nightLine }}>
          <T color={C.accentDark}>「{h.eye}」</T>
        </View>
        <Button title={h.id === current.id ? `目前的夥伴：${h.name}` : `選擇${h.name}當夥伴`} onPress={choose}
          disabled={h.id === current.id} loading={busy} />
      </Card>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {HEROES.map((x) => {
          const on = x.id === sel;
          return (
            <Pressable key={x.id} accessibilityRole="button" accessibilityState={{ selected: on }}
              accessibilityLabel={`${x.name}，${x.job}${x.id === current.id ? '（目前的夥伴）' : ''}`} onPress={() => setSel(x.id)}
              style={{ width: '23%', flexGrow: 1, minWidth: 76, borderRadius: 12, overflow: 'hidden', borderWidth: on ? 2 : 1,
                borderColor: on ? x.color : C.line, backgroundColor: C.card }}>
              <Image source={x.image} accessibilityIgnoresInvertColors resizeMode="cover" style={{ width: '100%', height: 104 }} />
              <View style={{ padding: 6, alignItems: 'center' }}>
                <T size={13} weight="700" color={on ? x.color : C.ink}>{x.name}</T>
                <T size={10} color={C.muted} numberOfLines={1}>{x.job}</T>
              </View>
              {x.id === current.id ? (
                <View style={{ position: 'absolute', top: 4, right: 4, backgroundColor: x.color, borderRadius: 999, padding: 2 }}>
                  <Ionicons name="checkmark" size={12} color={C.onAccent} />
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}
