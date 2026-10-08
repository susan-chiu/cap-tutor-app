import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { Field, LegalLinks } from '@/components/form';
import { APP_VERSION, contactSupport, supportAvailable } from '@/lib/support';
import { Button, Card, Chip, H1, H2, Screen, T } from '@/components/ui';
import { api, errorText, isPremiumProfile } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { shareText } from '@/lib/share';
import {
  disableReminders, enableReminders, loadReminderSettings, REMINDER_TIMES, remindersSupported, rescheduleReminders, parentWeeklyEnabled, setParentWeekly,
} from '@/lib/reminders';
import { ALL_SUBJECTS, C, GRADES, gradeLabel, isElementary, PERSONAS, subjectsFor, localToday } from '@/lib/theme';

export default function Me() {
  const { profile, refreshProfile, signOut } = useAuth();
  const [nickname, setNickname] = useState(profile?.nickname ?? '');
  const [saving, setSaving] = useState(false);
  const [parentWeekly, setParentWeeklyState] = useState(parentWeeklyEnabled);
  const [reminder, setReminder] = useState(loadReminderSettings);
  const isStudent = profile?.role === 'student';
  const premium = isPremiumProfile(profile, localToday());
  const subActive = !!profile?.subscription_until && new Date(profile.subscription_until) > new Date();
  const [parents, setParents] = useState<{ parent_id: string; nickname: string; linked_at: string }[]>([]);
  const [kids, setKids] = useState<{ student_id: string; nickname: string }[]>([]);

  useFocusEffect(useCallback(() => {
    refreshProfile();
    if (isStudent) api.myParents().then(setParents).catch(() => {});
    else api.myChildren().then(setKids).catch(() => {});
  }, [refreshProfile, isStudent]));

  function unlink(p: { parent_id: string; nickname: string }) {
    Alert.alert('解除綁定？', `「${p.nickname}」將看不到你的學習週報。`, [
      { text: '取消', style: 'cancel' },
      { text: '解除', style: 'destructive', onPress: async () => {
        try {
          await api.unlinkParent(p.parent_id);
          setParents((list) => list.filter((x) => x.parent_id !== p.parent_id));
        } catch (e) { Alert.alert('解除失敗', errorText(e)); }
      } },
    ]);
  }

  function unlinkKid(k: { student_id: string; nickname: string }) {
    Alert.alert('解除綁定？', `解除後就看不到「${k.nickname}」的學習狀況。之後要再看，請孩子給你新的邀請碼重新綁定。`, [
      { text: '取消', style: 'cancel' },
      { text: '解除', style: 'destructive', onPress: async () => {
        try {
          await api.unlinkChild(k.student_id);
          setKids((list) => list.filter((x) => x.student_id !== k.student_id));
        } catch (e) { Alert.alert('解除失敗', errorText(e)); }
      } },
    ]);
  }

  function rotateCode() {
    Alert.alert('換一組新的邀請碼？', '舊的代碼會立刻失效；已經綁定的家長不受影響。', [
      { text: '取消', style: 'cancel' },
      { text: '換新代碼', onPress: async () => {
        try { await api.rotateInviteCode(); await refreshProfile(); }
        catch (e) { Alert.alert('更換失敗', errorText(e)); }
      } },
    ]);
  }

  async function toggleParentWeekly(on: boolean) {
    const ok = await setParentWeekly(on);
    if (!ok) { Alert.alert('沒有開啟通知權限', '請到手機設定允許「會考小老師」傳送通知。'); return; }
    setParentWeeklyState(on);
  }

  async function update(patch: Parameters<typeof api.updateProfile>[0]) {
    setSaving(true);
    try { await api.updateProfile(patch); await refreshProfile(); }
    catch (e) { Alert.alert('儲存失敗', errorText(e)); }
    finally { setSaving(false); }
  }

  async function setReminderTime(hour: number, minute: number) {
    const ok = await enableReminders(hour, minute);
    if (!ok) { Alert.alert('沒有通知權限', '請到手機的「設定 → 通知」允許這個 App 傳送通知。'); return; }
    setReminder({ enabled: true, hour, minute });
    try {
      const h = await api.home();
      await rescheduleReminders({ todayMet: h.today_answered >= h.daily_goal, streak: h.streak });
    } catch { /* 下次打開首頁會再排 */ }
  }

  async function turnOffReminder() {
    await disableReminders();
    setReminder((r) => ({ ...r, enabled: false }));
  }

  function confirmDelete() {
    Alert.alert('刪除帳號', '所有練習紀錄、錯題本和申請資料都會永久刪除，無法復原。\n\n如果有訂閱，請另外到 App Store／Google Play 取消，刪除帳號不會自動停止扣款。\n\n確定要刪除嗎？', [
      { text: '取消', style: 'cancel' },
      {
        text: '永久刪除', style: 'destructive',
        onPress: async () => {
          try { await api.deleteAccount(); } catch (e) { Alert.alert('刪除失敗', errorText(e)); }
        },
      },
    ]);
  }

  if (!profile) return null;

  return (
    <Screen>
      <H1>我的</H1>

      <Card style={{ gap: 12 }}>
        <Field label="暱稱" value={nickname} onChangeText={setNickname} maxLength={20} />
        <Button title="儲存暱稱" kind="secondary" disabled={!nickname.trim() || nickname === profile.nickname}
          loading={saving} onPress={() => update({ nickname: nickname.trim() })} />
      </Card>

      {isStudent ? (
        <>
          <Card style={{ gap: 10 }}>
            <H2>年級</H2>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {GRADES.map((g) => (
                <Chip key={g} label={gradeLabel(g)} selected={profile.grade === g}
                  onPress={() => update(isElementary(g) === isElementary(profile.grade) ? { grade: g }
                    // 國小、國中切換時，每日練習科目跟著換
                    : { grade: g, daily_subjects: isElementary(g) ? ['chinese', 'math'] : ALL_SUBJECTS })} />
              ))}
            </View>
            <H2>小老師</H2>
            <View style={{ gap: 8 }}>
              {PERSONAS.map((p) => (
                <Chip key={p.id} label={`${p.label}・${p.desc}`} selected={profile.tutor_persona === p.id}
                  onPress={() => update({ tutor_persona: p.id })} style={{ alignSelf: 'flex-start' }} />
              ))}
            </View>
            <H2>每日練習科目</H2>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {subjectsFor(profile.grade).map((s) => {
                const all = subjectsFor(profile.grade).map((x) => x.id);
                const cur = (profile.daily_subjects?.length ? profile.daily_subjects : all).filter((x) => (all as string[]).includes(x));
                const on = cur.includes(s.id);
                return (
                  <Chip key={s.id} label={s.label} selected={on} onPress={() => {
                    if (saving) return;  // 上一次還在儲存，避免連點互相覆蓋
                    const next = on ? cur.filter((x) => x !== s.id) : [...cur, s.id];
                    if (next.length === 0) { Alert.alert('至少要選一科'); return; }
                    update({ daily_subjects: ALL_SUBJECTS.filter((x) => next.includes(x)) });
                  }} />
                );
              })}
            </View>
            <T size={13} color={C.muted}>每天 5 題會從勾選的科目平均出題；學期複習可以練任何一科。</T>
          </Card>

          {remindersSupported ? (
            <Card style={{ gap: 10 }}>
              <H2>每日練習提醒</H2>
              <T size={13} color={C.muted}>今天還沒完成 5 題時，在這個時間提醒你。已經完成就不打擾。</T>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                <Chip label="關閉" selected={!reminder.enabled} onPress={turnOffReminder} />
                {REMINDER_TIMES.map((t) => (
                  <Chip key={t.label} label={t.label}
                    selected={reminder.enabled && reminder.hour === t.hour && reminder.minute === t.minute}
                    onPress={() => setReminderTime(t.hour, t.minute)} />
                ))}
              </View>
            </Card>
          ) : null}

          <Card style={{ gap: 8 }}>
            <H2>方案</H2>
            {premium ? (
              <>
                <T color={C.greenDark}>完整版使用中{subActive ? '（訂閱）' : `，到 ${profile.premium_until}`}。</T>
                {subActive ? <T size={13} color={C.muted}>取消訂閱請到手機的 App Store／Google Play 訂閱設定。</T> : null}
              </>
            ) : (
              <>
                <T>免費版：每天 30 題、小老師 3 次（看廣告可再多 2 次）。</T>
                <Button title="升級完整版" onPress={() => router.push('/paywall')} />
                <Button title="全校前三名免費申請" kind="secondary" onPress={() => router.push('/top-three')} />
              </>
            )}
          </Card>

          <Card style={{ gap: 8 }}>
            <H2>給家長的邀請碼</H2>
            <T size={13} color={C.muted}>家長註冊「家長帳號」後輸入這組代碼，就能看到你的學習週報。</T>
            <T size={28} weight="700" style={{ letterSpacing: 6 }}>{profile.invite_code}</T>
            <Button title="分享給家長" kind="secondary"
              onPress={() => shareText(`我在「會考小老師」練習會考題，家長邀請碼：${profile.invite_code}`)} />
            <Button title="換一組新代碼" kind="ghost" onPress={rotateCode} />
          </Card>

          <Card style={{ gap: 8 }}>
            <H2>已綁定的家長</H2>
            {parents.length === 0 ? (
              <T size={13} color={C.muted}>還沒有家長綁定。</T>
            ) : parents.map((p) => (
              <View key={p.parent_id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <T style={{ flex: 1 }}>{p.nickname}</T>
                <Button title="解除綁定" kind="ghost" onPress={() => unlink(p)} accessibilityLabel={`解除綁定 ${p.nickname}`} />
              </View>
            ))}
          </Card>
        </>
      ) : null}

      {!isStudent ? (
        <Card style={{ gap: 8 }}>
          <H2>已綁定的孩子</H2>
          {kids.length === 0 ? (
            <T size={13} color={C.muted}>還沒有綁定孩子。到「首頁」輸入孩子的邀請碼就可以綁定。</T>
          ) : kids.map((k) => (
            <View key={k.student_id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <T style={{ flex: 1 }}>{k.nickname}</T>
              <Button title="解除綁定" kind="ghost" onPress={() => unlinkKid(k)} accessibilityLabel={`解除綁定 ${k.nickname}`} />
            </View>
          ))}
        </Card>
      ) : null}

      {!isStudent && remindersSupported ? (
        <Card style={{ gap: 10 }}>
          <H2>每週學習摘要提醒</H2>
          <T size={13} color={C.muted}>每週日晚上 8 點提醒你看看孩子這週的練習狀況。</T>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Chip label="關閉" selected={!parentWeekly} onPress={() => toggleParentWeekly(false)} />
            <Chip label="開啟" selected={parentWeekly} onPress={() => toggleParentWeekly(true)} />
          </View>
        </Card>
      ) : null}

      <Card style={{ gap: 4 }}>
        <Pressable accessibilityRole="button" onPress={() => router.push('/help')}
          style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <T weight="700">使用說明與常見問題</T>
          <T color={C.muted}>›</T>
        </Pressable>
        {supportAvailable ? (
          <Pressable accessibilityRole="button" onPress={() => contactSupport(profile?.id)}
            style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: C.line }}>
            <T weight="700">聯絡客服／意見回饋</T>
            <T color={C.muted}>›</T>
          </Pressable>
        ) : null}
      </Card>

      <Card style={{ gap: 10 }}>
        <LegalLinks />
        <Button title="登出" kind="secondary" onPress={signOut} />
        <Button title="刪除帳號" kind="ghost" onPress={confirmDelete} />
      </Card>
      <T size={12} color={C.faint} style={{ textAlign: 'center' }}>會考小老師 v{APP_VERSION}</T>
    </Screen>
  );
}
