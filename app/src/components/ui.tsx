import { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View,
  type StyleProp, type TextStyle, type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { C, radius } from '@/lib/theme';

export function Screen({ children, scroll = true, padded = true, edges = ['top'] }: {
  children: ReactNode; scroll?: boolean; padded?: boolean; edges?: ('top' | 'bottom')[];
}) {
  const inner = <View style={[padded && styles.padded, { gap: 12 }]}>{children}</View>;
  return (
    <SafeAreaView style={styles.screen} edges={edges}>
      {scroll ? (
        // 鍵盤出現時把內容往上推，避免擋住密碼、學校名稱等輸入框
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          <ScrollView contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled">{inner}</ScrollView>
        </KeyboardAvoidingView>
      ) : inner}
    </SafeAreaView>
  );
}

export function Card({ children, style, dark }: { children: ReactNode; style?: StyleProp<ViewStyle>; dark?: boolean }) {
  return <View style={[styles.card, dark && styles.cardDark, style]}>{children}</View>;
}

export function T({ children, style, size = 15, weight = '400', color = C.ink, numberOfLines }: {
  children: ReactNode; style?: StyleProp<TextStyle>; size?: number; weight?: TextStyle['fontWeight'];
  color?: string; numberOfLines?: number;
}) {
  return (
    // 限制最大放大倍率：手機開大字體時仍可閱讀，又不會把版面擠爆
    <Text numberOfLines={numberOfLines} maxFontSizeMultiplier={1.6} style={[{ fontSize: size, fontWeight: weight, color, lineHeight: Math.round(size * 1.5) }, style]}>
      {children}
    </Text>
  );
}

export function H1({ children }: { children: ReactNode }) {
  return <T size={24} weight="700">{children}</T>;
}

export function H2({ children, color }: { children: ReactNode; color?: string }) {
  return <T size={17} weight="700" color={color}>{children}</T>;
}

type ButtonKind = 'primary' | 'secondary' | 'green' | 'danger' | 'ghost';

export function Button({ title, onPress, kind = 'primary', disabled, loading, style, accessibilityLabel }: {
  title: string; onPress: () => void; kind?: ButtonKind; disabled?: boolean; loading?: boolean;
  style?: StyleProp<ViewStyle>; accessibilityLabel?: string;
}) {
  const k = BUTTON_KINDS[kind];
  const off = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !!off }} aria-disabled={!!off}
      onPress={off ? undefined : onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: off ? '#E6E0D4' : k.bg, borderColor: off ? '#E6E0D4' : k.border },
        pressed && !off && { opacity: 0.85 },
        style,
      ]}>
      {loading ? <ActivityIndicator color={k.fg} /> : (
        <Text style={[styles.buttonText, { color: off ? '#6B7370' : k.fg }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const BUTTON_KINDS: Record<ButtonKind, { bg: string; fg: string; border: string }> = {
  primary: { bg: C.accent, fg: '#FFFFFF', border: C.accent },
  secondary: { bg: '#FFFFFF', fg: C.accent, border: C.accent },
  green: { bg: C.green, fg: '#FFFFFF', border: C.green },
  danger: { bg: C.red, fg: '#FFFFFF', border: C.red },
  ghost: { bg: 'transparent', fg: C.muted, border: 'transparent' },
};

export function Chip({ label, selected, onPress, style }: {
  label: string; selected?: boolean; onPress?: () => void; style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }} aria-selected={!!selected}
      onPress={onPress}
      style={[styles.chip, selected ? styles.chipOn : styles.chipOff, style]}>
      <Text style={{ fontSize: 14, fontWeight: selected ? '700' : '400', color: selected ? '#FFFFFF' : C.ink }}>{label}</Text>
    </Pressable>
  );
}

export function Tag({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'accent' | 'green' | 'red' }) {
  const t = {
    neutral: { bg: '#EFEBE2', fg: C.muted },
    accent: { bg: C.accentSoft, fg: C.accentDark },
    green: { bg: C.greenSoft, fg: C.greenDark },
    red: { bg: C.redSoft, fg: C.redDark },
  }[tone];
  return (
    <View style={{ backgroundColor: t.bg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' }}>
      <Text maxFontSizeMultiplier={1.6} style={{ fontSize: 12, fontWeight: '700', color: t.fg }}>{label}</Text>
    </View>
  );
}

export function ProgressBar({ value, color = C.green, height = 8 }: { value: number; color?: string; height?: number }) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }}
      style={{ height, backgroundColor: '#EFEBE2', borderRadius: 999, overflow: 'hidden' }}>
      <View style={{ width: `${pct * 100}%`, height, backgroundColor: color, borderRadius: 999 }} />
    </View>
  );
}

export function Loading({ label = '載入中…' }: { label?: string }) {
  return (
    <View style={{ padding: 40, alignItems: 'center', gap: 12 }}>
      <ActivityIndicator color={C.accent} />
      <T color={C.muted}>{label}</T>
    </View>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card style={{ backgroundColor: C.redSoft, borderColor: C.redSoft, gap: 8 }}>
      <T color={C.redDark}>{message}</T>
      {onRetry ? <Button title="再試一次" kind="secondary" onPress={onRetry} /> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  padded: { paddingHorizontal: 16, paddingTop: 12 },
  card: { backgroundColor: C.card, borderColor: C.line, borderWidth: 1, borderRadius: radius.lg, padding: 16 },
  cardDark: { backgroundColor: C.night, borderColor: C.night },
  button: { minHeight: 50, borderRadius: radius.md, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  buttonText: { fontSize: 16, fontWeight: '700' },
  chip: { minHeight: 40, paddingHorizontal: 14, borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  chipOn: { backgroundColor: C.accent, borderColor: C.accent },
  chipOff: { backgroundColor: '#FFFFFF', borderColor: C.lineStrong },
});
