
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { Field } from '@/components/form';
import { Button, Card, H1, Screen, T } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { C } from '@/lib/theme';
import { goBack } from '@/lib/nav';

// 重設密碼：寄 6 碼驗證碼到信箱 → 輸入驗證碼與新密碼（不需要處理網址跳轉）
export default function Forgot() {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function sendCode() {
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) throw error;
      setStep('code');
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      Alert.alert('寄送失敗', /rate limit|seconds/i.test(msg) ? '寄太多次了，請稍等一分鐘再試。' : '請確認信箱是否正確，稍後再試。');
    } finally { setBusy(false); }
  }

  async function reset() {
    setBusy(true);
    try {
      const { error: vErr } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'recovery' });
      if (vErr) throw new Error('bad_code');
      const { error: uErr } = await supabase.auth.updateUser({ password });
      if (uErr) throw uErr;
      Alert.alert('密碼已更新', '已經幫你登入了。');
    } catch (e) {
      Alert.alert('重設失敗', e instanceof Error && e.message === 'bad_code' ? '驗證碼錯誤或已過期，請重新寄送。' : '請稍後再試。');
    } finally { setBusy(false); }
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <Pressable accessibilityRole="button" onPress={() => goBack()} style={{ minHeight: 44, justifyContent: 'center' }}>
        <T color={C.accent} weight="700">‹ 回登入</T>
      </Pressable>
      <H1>忘記密碼</H1>
      {step === 'email' ? (
        <Card style={{ gap: 12 }}>
          <T color={C.muted}>輸入註冊用的 Email，我們會寄一組 6 位數驗證碼給你。</T>
          <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          <Button title="寄送驗證碼" onPress={sendCode} disabled={!/^\S+@\S+\.\S+$/.test(email.trim())} loading={busy} />
        </Card>
      ) : (
        <Card style={{ gap: 12 }}>
          <T color={C.muted}>驗證碼已寄到 {email}，沒收到請看垃圾郵件匣。</T>
          <Field label="6 位數驗證碼" value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={6} autoComplete="one-time-code" />
          <Field label="新密碼（至少 8 個字元）" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" />
          <Button title="更新密碼" onPress={reset} disabled={code.trim().length !== 6 || password.length < 8} loading={busy} />
          <View style={{ alignItems: 'center' }}>
            <Pressable accessibilityRole="button" onPress={sendCode} style={{ minHeight: 44, justifyContent: 'center' }}>
              <T size={14} color={C.accent}>重新寄送驗證碼</T>
            </Pressable>
          </View>
        </Card>
      )}
    </Screen>
  );
}
