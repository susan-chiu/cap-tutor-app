import { Tabs } from 'expo-router';
import { Image } from 'react-native';

import { TAB_IMG, WORLD_IMG } from '@/lib/art';
import { useAuth } from '@/lib/auth';
import { C } from '@/lib/theme';

/** 分頁圖示：選中時發光、沒選中時灰藍 */
const icon = (key: keyof typeof TAB_IMG) => function TabIcon({ focused }: { focused: boolean }) {
  return <Image source={focused ? TAB_IMG[key].on : TAB_IMG[key].off} accessibilityIgnoresInvertColors
    style={{ width: 34, height: 34, marginTop: 2 }} />;
};

export default function TabLayout() {
  const { profile } = useAuth();
  const isParent = profile?.role === 'parent';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: C.muted,
        tabBarStyle: { backgroundColor: '#0A1022', borderTopColor: C.nightLine, height: 66, paddingTop: 4 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        sceneStyle: { backgroundColor: C.bg },
      }}>
      <Tabs.Screen name="index" options={{ title: '大廳', tabBarIcon: icon('hall') }} />
      <Tabs.Screen name="map" options={{ title: '地圖', href: isParent ? null : undefined,
        tabBarIcon: ({ focused }) => <Image source={WORLD_IMG.flag} accessibilityIgnoresInvertColors
          style={{ width: 30, height: 30, marginTop: 2, opacity: focused ? 1 : 0.45 }} /> }} />
      <Tabs.Screen name="mistakes" options={{ title: '圖鑑', href: isParent ? null : undefined, tabBarIcon: icon('monster') }} />
      <Tabs.Screen name="me" options={{ title: '我的', tabBarIcon: icon('me') }} />
    </Tabs>
  );
}
