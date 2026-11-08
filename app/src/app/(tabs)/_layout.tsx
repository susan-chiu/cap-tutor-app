import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

import { useAuth } from '@/lib/auth';
import { C } from '@/lib/theme';

export default function TabLayout() {
  const { profile } = useAuth();
  const isParent = profile?.role === 'parent';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: C.muted,
        tabBarStyle: { backgroundColor: C.card, borderTopColor: C.line },
        sceneStyle: { backgroundColor: C.bg },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: '大廳', tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: '副本',
          href: isParent ? null : undefined,
          tabBarIcon: ({ color, size }) => <Ionicons name="map-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mistakes"
        options={{
          title: '魔物圖鑑',
          href: isParent ? null : undefined,
          tabBarIcon: ({ color, size }) => <Ionicons name="skull-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="me"
        options={{ title: '我的', tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }}
      />
    </Tabs>
  );
}
