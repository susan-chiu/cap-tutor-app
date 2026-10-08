import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import * as WebBrowser from 'expo-web-browser';

import { T } from '@/components/ui';
import { C } from '@/lib/theme';

export function Field({ label, ...props }: { label: string } & ComponentProps<typeof TextInput>) {
  return (
    <View style={{ gap: 4 }}>
      <T size={13} weight="700">{label}</T>
      <TextInput accessibilityLabel={label} placeholderTextColor={C.faint} style={styles.input} {...props} />
    </View>
  );
}

export function Check({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} aria-checked={checked} onPress={onToggle}
      style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start', minHeight: 44 }}>
      <View style={[styles.box, checked && { backgroundColor: C.accent, borderColor: C.accent }]}>
        {checked ? <T size={14} color="#FFFFFF" weight="700">✓</T> : null}
      </View>
      <T size={14} style={{ flex: 1 }}>{label}</T>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  input: { minHeight: 48, borderWidth: 1, borderColor: C.lineStrong, borderRadius: 10, paddingHorizontal: 12, fontSize: 16, backgroundColor: '#FFFFFF', color: C.ink },
  box: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: C.lineStrong, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
});

const TERMS_URL = process.env.EXPO_PUBLIC_TERMS_URL;
const PRIVACY_URL = process.env.EXPO_PUBLIC_PRIVACY_URL;
if (__DEV__ && (!TERMS_URL || !PRIVACY_URL)) {
  console.warn('EXPO_PUBLIC_TERMS_URL / EXPO_PUBLIC_PRIVACY_URL 還沒設定：上架前一定要填，否則審核會被退');
}

export function LegalLinks() {
  if (!TERMS_URL && !PRIVACY_URL) return null;
  return (
    <View style={{ flexDirection: 'row', gap: 16 }}>
      {TERMS_URL ? (
        <Pressable accessibilityRole="link" onPress={() => openLegal('terms')} style={{ minHeight: 44, justifyContent: 'center' }}>
          <T size={13} color={C.accent} weight="700">服務條款（使用者授權合約）</T>
        </Pressable>
      ) : null}
      {PRIVACY_URL ? (
        <Pressable accessibilityRole="link" onPress={() => openLegal('privacy')} style={{ minHeight: 44, justifyContent: 'center' }}>
          <T size={13} color={C.accent} weight="700">隱私權政策</T>
        </Pressable>
      ) : null}
    </View>
  );
}

export function openLegal(kind: 'terms' | 'privacy') {
  const url = kind === 'terms' ? TERMS_URL : PRIVACY_URL;
  if (url) WebBrowser.openBrowserAsync(url);
}
