import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

import { useEffect, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { Check, Field } from '@/components/form';
import { Button, Card, Chip, H1, Screen, T, Tag } from '@/components/ui';
import { api, errorText } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { C, GRADES, gradeLabel } from '@/lib/theme';
import { goBack } from '@/lib/nav';

interface Application { id: string; school: string; exam: string; school_rank: number; status: string; reviewer_note: string | null; created_at: string }

const STATUS: Record<string, { label: string; tone: 'accent' | 'green' | 'red' }> = {
  pending: { label: '審核中', tone: 'accent' },
  approved: { label: '已通過', tone: 'green' },
  rejected: { label: '未通過', tone: 'red' },
};

export default function TopThree() {
  const { profile, session, refreshProfile } = useAuth();
  const [apps, setApps] = useState<Application[]>([]);
  const [uri, setUri] = useState<string | null>(null);
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState<number>(profile?.grade ?? 8);
  const [exam, setExam] = useState('本學期第一次段考');
  const [rank, setRank] = useState<number | null>(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.myApplications().then((a) => setApps(a as Application[])).catch(() => {}); }, []);
  const pending = apps.some((a) => a.status === 'pending');

  async function pick(from: 'camera' | 'library') {
    const perm = from === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('需要權限', from === 'camera' ? '請到設定開啟相機權限。' : '請到設定開啟照片權限。'); return; }
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.6, allowsEditing: true };
    const r = from === 'camera' ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    if (!r.canceled) setUri(r.assets[0].uri);
  }

  async function submit() {
    if (!uri || !rank || !session) return;
    setBusy(true);
    try {
      const path = `${session.user.id}/${Date.now()}.jpg`;
      const body = await (await fetch(uri)).arrayBuffer();
      const up = await supabase.storage.from('proofs').upload(path, body, { contentType: 'image/jpeg' });
      if (up.error) throw new Error('bad_proof_path');
      await api.applyTopThree({ school: school.trim(), grade, exam: exam.trim(), rank, proofPath: path, parentConsent: consent });
      await refreshProfile();
      Alert.alert('已送出申請', process.env.EXPO_PUBLIC_DEMO === '1'
        ? '試用版會自動通過審核，完整版已經開通到學期結束。（正式版由管理員在 3 個工作天內人工審核）'
        : '我們會在 3 個工作天內審核，通過後自動開通完整版到學期結束。', [{ text: '好', onPress: () => goBack() }]);
    } catch (e) {
      Alert.alert('送出失敗', errorText(e));
    } finally { setBusy(false); }
  }

  const canSubmit = !!uri && !!rank && school.trim().length >= 2 && exam.trim().length >= 2 && consent && !pending;

  return (
    <Screen edges={['top', 'bottom']}>
      <Pressable accessibilityRole="button" accessibilityLabel="返回" onPress={() => goBack()} style={{ width: 44, height: 44, justifyContent: 'center' }}>
        <Ionicons name="chevron-back" size={24} color={C.ink} />
      </Pressable>
      <H1>全校前三名免費申請</H1>
      <Card dark style={{ gap: 4 }}>
        <T weight="700" color="#FFFFFF">段考或學期成績全校前三名</T>
        <T size={13} color="#C9D1CF">通過審核就能免費使用完整版到學期結束，每學期可以重新申請。</T>
      </Card>

      {apps.map((a) => (
        <Card key={a.id} style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <T weight="700">{a.exam} · 第 {a.school_rank} 名</T>
            <Tag label={STATUS[a.status]?.label ?? a.status} tone={STATUS[a.status]?.tone ?? 'accent'} />
          </View>
          <T size={13} color={C.muted}>{a.school} · {a.created_at.slice(0, 10)}</T>
          {a.reviewer_note ? <T size={13}>審核說明：{a.reviewer_note}</T> : null}
        </Card>
      ))}

      {pending ? null : (
        <>
          <Card style={{ gap: 10, alignItems: 'center' }}>
            {uri ? <Image source={{ uri }} style={{ width: '100%', height: 220, borderRadius: 12 }} contentFit="contain" /> : (
              <>
                <Ionicons name="cloud-upload-outline" size={30} color={C.accent} />
                <T weight="700">上傳成績單或獎狀照片</T>
                <T size={12} color={C.muted} style={{ textAlign: 'center' }}>需清楚看到：學校、全校排名、考試名稱。姓名以外的個資（地址、身分證字號）請先遮住。</T>
              </>
            )}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button title="拍照" onPress={() => pick('camera')} style={{ minHeight: 44 }} />
              <Button title="從相簿選擇" kind="secondary" onPress={() => pick('library')} style={{ minHeight: 44 }} />
            </View>
          </Card>

          <Card style={{ gap: 12 }}>
            <Field label="學校" value={school} onChangeText={setSchool} placeholder="例如：○○國中" maxLength={40} />
            <T size={13} weight="700">年級</T>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {GRADES.map((g) => <Chip key={g} label={gradeLabel(g)} selected={grade === g} onPress={() => setGrade(g)} />)}
            </View>
            <Field label="考試名稱" value={exam} onChangeText={setExam} maxLength={40} />
            <T size={13} weight="700">全校排名</T>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[1, 2, 3].map((r) => <Chip key={r} label={`第 ${r} 名`} selected={rank === r} onPress={() => setRank(r)} />)}
            </View>
            <Check checked={consent} onToggle={() => setConsent(!consent)} label="家長已同意我上傳成績證明。證明只用於審核，審核後依隱私權政策刪除。" />
          </Card>

          <Button title="送出申請" onPress={submit} disabled={!canSubmit} loading={busy} />
        </>
      )}
    </Screen>
  );
}
