import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import { api, type Profile } from './api';
import { identifyPurchaser } from './purchases';
import { disableReminders } from './reminders';
import { supabase } from './supabase';

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  /** 第一次讀取個人資料失敗（例如沒有網路）；已有資料時重新整理失敗不會設定 */
  profileError: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  session: null,
  profile: null,
  loading: true,
  profileError: false,
  refreshProfile: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);
  const lastUserId = useRef<string | null | undefined>(undefined);
  const profileRef = useRef<Profile | null>(null);

  const loadProfile = useCallback(async (s: Session | null) => {
    const uid = s?.user.id ?? null;
    // 帳號換了才重新綁定購買身分（避免每次重新整理都呼叫 RevenueCat）
    if (uid !== lastUserId.current) {
      lastUserId.current = uid;
      identifyPurchaser(uid);
      if (!uid) { profileRef.current = null; setProfile(null); }
    }
    if (!uid) { setProfileError(false); return; }
    try {
      const p = await api.profile(uid);
      profileRef.current = p;
      setProfile(p);
      setProfileError(false);
    } catch {
      // 讀取失敗時保留原本的資料（例如搭捷運短暫斷線），只有完全沒資料時才顯示錯誤畫面
      if (profileRef.current?.id !== uid) {
        profileRef.current = null;
        setProfile(null);
        setProfileError(true);
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession()
      .then(async ({ data }) => {
        if (!mounted) return;
        setSession(data.session);
        await loadProfile(data.session);
      })
      .catch(() => { if (mounted) setProfileError(true); })
      .finally(() => { if (mounted) setLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === 'INITIAL_SESSION') return; // 上面的 getSession 已經處理
      // 不在回呼裡直接 await Supabase 呼叫，避免鎖死
      setTimeout(() => { loadProfile(s); }, 0);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [loadProfile]);

  const refreshProfile = useCallback(() => loadProfile(session), [loadProfile, session]);
  const signOut = useCallback(async () => {
    // 同一支手機換帳號時，不要留下前一個人的提醒
    await disableReminders().catch(() => {});
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ session, profile, loading, profileError, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
