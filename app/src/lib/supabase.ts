import 'expo-sqlite/localStorage/install';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isConfigured = !!supabaseUrl && !!supabasePublishableKey && /^https?:\/\//.test(supabaseUrl);

export const supabase = createClient(
  supabaseUrl ?? 'https://missing.supabase.co',
  supabasePublishableKey ?? 'missing',
  {
    auth: {
      // 網頁預先渲染時沒有 localStorage
      storage: typeof localStorage !== 'undefined' ? localStorage : undefined,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
