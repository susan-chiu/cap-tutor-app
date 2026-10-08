import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { Check, Field, LegalLinks } from '@/components/form';
import { Button, Card, Chip, H1, T, Screen } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { TERMS_VERSION } from '@/lib/support';
import { C } from '@/lib/theme';

type Mode = 'signin' | 'signup';

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('signin');
  const [role, setRole] = useState<'student' | 'parent'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [consent, setConsent] = useState(false);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  // 需要收確認信的 Email（顯示「重寄確認信」）
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [resendBusy, setResendBusy] = useState(false);
  const [resendAt, setResendAt] = useState(0);

  async function resend() {
    if (!pendingEmail || Date.now() < resendAt) {
      Alert.alert('請稍等一下', '剛剛已經寄出，1 分鐘後才能再寄一次。');
      return;
    }
    setResendBusy(true);
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: pendingEmail });
      if (error) throw error;
      setResendAt(Date.now() + 60_000);
      Alert.alert('已重新寄出', `請到 ${pendingEmail} 收信，也看一下「垃圾郵件」或「促銷內容」資料夾。`);
    } catch {
      Alert.alert('寄送失敗', '請確認 Email 有沒有打錯，或稍後再試。');
    } finally { setResendBusy(false); }
  }

  const validEmail = /^\S+@\S+\.\S+$/.test(email.trim());
  const canSubmit = validEmail && password.length >= 8 &&
    (mode === 'signin' || (nickname.trim().length > 0 && agree && (role === 'parent' || consent)));

  async function submit() {
    setBusy(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: {
            nickname: nickname.trim().slice(0, 20), role,
            parent_consent: role === 'student' ? String(consent) : 'false',
            // 記錄同意的條款版本（伺服器存下同意時間）
            terms_accepted: String(agree), terms_version: TERMS_VERSION,
          } },
        });
        if (error) throw error;
        if (!data.session) {
          Alert.alert('請收信確認', '我們寄了一封確認信到你的信箱，點信中的連結後再回來登入。沒收到可以按「重寄確認信」。');
          setPendingEmail(email.trim());
          setMode('signin');
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/Email not confirmed/i.test(msg)) setPendingEmail(email.trim());
      Alert.alert(mode === 'signin' ? '登入失敗' : '註冊失敗',
        /Invalid login/i.test(msg) ? '信箱或密碼不正確。'
          : /already registered/i.test(msg) ? '這個信箱已經註冊過了，請直接登入。'
          : /Email not confirmed/i.test(msg) ? '請先到信箱點確認連結。'
          : '請稍後再試。');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ paddingVertical: 24, gap: 6 }}>
        <T size={14} color={C.accent} weight="700">會考小老師</T>
        <H1>{mode === 'signin' ? '歡迎回來' : '建立帳號'}</H1>
        <T color={C.muted}>每天 5 題練習（國小五年級～國中會考），錯題有小老師陪你弄懂。</T>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Chip label="登入" selected={mode === 'signin'} onPress={() => setMode('signin')} />
        <Chip label="註冊" selected={mode === 'signup'} onPress={() => setMode('signup')} />
      </View>

      <Card style={{ gap: 12 }}>
        {mode === 'signup' ? (
          <>
            <T weight="700">我是</T>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Chip label="學生" selected={role === 'student'} onPress={() => setRole('student')} />
              <Chip label="家長" selected={role === 'parent'} onPress={() => setRole('parent')} />
            </View>
            <Field label="暱稱（不要用真實姓名）" value={nickname} onChangeText={setNickname} maxLength={20} />
          </>
        ) : null}
        <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
        <Field label="密碼（至少 8 個字元）" value={password} onChangeText={setPassword} secureTextEntry autoComplete={mode === 'signin' ? 'password' : 'new-password'} />

        {mode === 'signup' ? (
          <>
            {role === 'student' ? (
              <Check checked={consent} onToggle={() => setConsent(!consent)}
                label="我未滿 18 歲，已經取得爸爸媽媽或監護人同意使用這個 App。" />
            ) : null}
            <Check checked={agree} onToggle={() => setAgree(!agree)} label="我已閱讀並同意服務條款與隱私權政策。" />
            <LegalLinks />
          </>
        ) : null}

        <Button title={mode === 'signin' ? '登入' : '建立帳號'} onPress={submit} disabled={!canSubmit} loading={busy} />
        {mode === 'signin' ? (
          <Pressable accessibilityRole="button" onPress={() => router.push('/forgot')} style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
            <T size={14} color={C.accent} weight="700">忘記密碼？</T>
          </Pressable>
        ) : null}
        {mode === 'signin' && pendingEmail ? (
          <Button title="沒收到確認信？重寄一次" kind="ghost" loading={resendBusy} onPress={resend} />
        ) : null}
      </Card>
    </Screen>
  );
}
