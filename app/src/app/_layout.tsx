import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Button, Card, H1, Loading, Screen, T } from '@/components/ui';
import { WebDialogHost } from '@/components/web-dialog';
import { AuthProvider, useAuth } from '@/lib/auth';
import { Sentry } from '@/lib/sentry';
import { isConfigured } from '@/lib/supabase';
import { C } from '@/lib/theme';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { session, profile, loading, profileError, refreshProfile, signOut } = useAuth();

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync();
  }, [loading]);

  if (!isConfigured) return <SetupNeeded />;
  if (!loading && session && !profile && profileError) {
    return <OfflineScreen onRetry={refreshProfile} onSignOut={signOut} />;
  }
  if (loading || (session && !profile)) {
    return <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center' }}><Loading /></View>;
  }

  const signedIn = !!session;
  const needsOnboarding = signedIn && profile?.role === 'student' && !profile.grade;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg } }}>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={needsOnboarding}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
      <Stack.Protected guard={signedIn && !needsOnboarding}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="quiz" options={{ gestureEnabled: false }} />
        <Stack.Screen name="tutor" />
        <Stack.Screen name="top-three" />
        <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
        <Stack.Screen name="help" />
        <Stack.Screen name="mock-exam" options={{ gestureEnabled: false }} />
      </Stack.Protected>
    </Stack>
  );
}

function OfflineScreen({ onRetry, onSignOut }: { onRetry: () => Promise<void>; onSignOut: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  return (
    <Screen>
      <H1>連不上網路</H1>
      <Card style={{ gap: 12 }}>
        <T>讀取資料失敗，可能是網路不穩。確認連線後再試一次。</T>
        <Button title="再試一次" loading={busy} onPress={async () => {
          setBusy(true);
          try { await onRetry(); } finally { setBusy(false); }
        }} />
        <Button title="登出" kind="secondary" onPress={() => { onSignOut(); }} />
      </Card>
    </Screen>
  );
}

function SetupNeeded() {
  return (
    <Screen>
      <H1>還差一步設定</H1>
      <Card style={{ gap: 8 }}>
        <T>App 還沒有連上後端。請在 app 資料夾建立 .env 檔，填入：</T>
        <T weight="700">EXPO_PUBLIC_SUPABASE_URL</T>
        <T weight="700">EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY</T>
        <T color={C.muted}>詳細步驟請看專案根目錄的 README.md。</T>
      </Card>
    </Screen>
  );
}

// 網頁試用版（EXPO_PUBLIC_DEMO=1）：最上方提示資料只存在這個瀏覽器
const IS_DEMO = process.env.EXPO_PUBLIC_DEMO === '1';
function DemoBanner() {
  if (!IS_DEMO) return null;
  return (
    <View style={{ backgroundColor: C.night, paddingHorizontal: 12, paddingVertical: 6 }}>
      <T size={12} color="#FFFFFF" style={{ textAlign: 'center' }}>
        試用版・資料只存在這個瀏覽器・小老師為示範回覆（正式版是 AI）・忘記密碼驗證碼輸入任意 6 位數
      </T>
    </View>
  );
}

function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <DemoBanner />
        <RootNavigator />
        <WebDialogHost />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(RootLayout);
