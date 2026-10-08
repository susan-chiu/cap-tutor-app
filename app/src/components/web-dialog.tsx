// 網頁版的確認視窗：react-native-web 的 Alert.alert 不會顯示任何東西（瀏覽器也常擋 alert/confirm），
// 所以在網頁上改成畫在頁面裡的對話框。手機版不受影響，仍使用系統對話框。
import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, View, type AlertButton } from 'react-native';

import { T } from '@/components/ui';
import { C } from '@/lib/theme';

interface DialogReq { title: string; message?: string; buttons: AlertButton[] }

let push: ((r: DialogReq) => void) | null = null;
const queue: DialogReq[] = [];

if (Platform.OS === 'web') {
  Alert.alert = (title: string, message?: string, buttons?: AlertButton[]) => {
    const req = { title, message, buttons: buttons?.length ? buttons : [{ text: '好' }] };
    if (push) push(req); else queue.push(req);
  };
}

export function WebDialogHost() {
  const [items, setItems] = useState<DialogReq[]>(() => queue.splice(0));
  useEffect(() => {
    push = (r) => setItems((x) => [...x, r]);
    return () => { push = null; };
  }, []);

  if (Platform.OS !== 'web' || items.length === 0) return null;
  const d = items[0];
  const close = (b: AlertButton) => {
    setItems((x) => x.slice(1));
    b.onPress?.();
  };
  // 取消放左邊、主要動作放右邊
  const ordered = [...d.buttons.filter((b) => b.style === 'cancel'), ...d.buttons.filter((b) => b.style !== 'cancel')];

  return (
    <View accessibilityViewIsModal style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
      backgroundColor: 'rgba(20, 30, 28, 0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <View accessibilityRole="alert" style={{ width: '100%', maxWidth: 360, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 20, gap: 10 }}>
        <T size={17} weight="700">{d.title}</T>
        {d.message ? <T size={14} color={C.inkSoft}>{d.message}</T> : null}
        <View style={{ flexDirection: ordered.length > 2 ? 'column' : 'row', gap: 8, marginTop: 6 }}>
          {ordered.map((b, i) => {
            const primary = b.style !== 'cancel' && i === ordered.length - 1;
            const danger = b.style === 'destructive';
            return (
              <Pressable key={`${b.text}-${i}`} accessibilityRole="button" onPress={() => close(b)}
                style={{ flex: ordered.length > 2 ? undefined : 1, minHeight: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
                  paddingHorizontal: 12,
                  backgroundColor: danger ? C.red : primary ? C.accent : '#FFFFFF',
                  borderWidth: danger || primary ? 0 : 1, borderColor: C.lineStrong }}>
                <T size={15} weight="700" color={danger || primary ? '#FFFFFF' : C.ink}>{b.text ?? '好'}</T>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
