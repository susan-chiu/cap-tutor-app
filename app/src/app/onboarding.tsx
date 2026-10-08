import { useState } from 'react';
import { Alert, View } from 'react-native';

import { Button, Card, Chip, H1, H2, Screen, T } from '@/components/ui';
import { api, errorText } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { C, GRADES, gradeLabel, isElementary, PERSONAS } from '@/lib/theme';

const VERSIONS = ['康軒', '南一', '翰林'] as const;

export default function Onboarding() {
  const { profile, refreshProfile } = useAuth();
  const [grade, setGrade] = useState<number | null>(null);
  const [version, setVersion] = useState<string | null>(null);
  const [persona, setPersona] = useState<string>('gentle');
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!grade) return;
    setBusy(true);
    try {
      await api.updateProfile(isElementary(grade)
        // 國小版：國語、數學，題目各版本通用
        ? { grade, textbook_version: null, tutor_persona: persona, textbook_versions: {}, daily_subjects: ['chinese', 'math'] }
        : {
          grade, textbook_version: version, tutor_persona: persona,
          // 先把數學、英語、自然、社會都設成同一版本；各科不同可以在「學期複習」個別調整
          textbook_versions: version ? { math: version, english: version, science: version, social: version } : {},
        });
      await refreshProfile();
    } catch (e) {
      Alert.alert('儲存失敗', errorText(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ paddingVertical: 16, gap: 4 }}>
        <T color={C.muted}>嗨，{profile?.nickname ?? '同學'}</T>
        <H1>先設定一下</H1>
      </View>

      <Card style={{ gap: 10 }}>
        <H2>你現在幾年級？</H2>
        <T size={13} color={C.muted}>國小</T>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {GRADES.filter((g) => g <= 6).map((g) => (
            <Chip key={g} label={gradeLabel(g)} selected={grade === g} onPress={() => setGrade(g)} />
          ))}
        </View>
        <T size={13} color={C.muted}>國中</T>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {GRADES.filter((g) => g >= 7).map((g) => (
            <Chip key={g} label={gradeLabel(g)} selected={grade === g} onPress={() => setGrade(g)} />
          ))}
        </View>
        {isElementary(grade) ? (
          <T size={13} color={C.muted}>國小版目前有國語、數學（五、六年級），題目各版本通用。</T>
        ) : null}
      </Card>

      {isElementary(grade) ? null : <Card style={{ gap: 10 }}>
        <H2>學校用哪一個版本的課本？</H2>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {VERSIONS.map((v) => <Chip key={v} label={v} selected={version === v} onPress={() => setVersion(v)} />)}
          <Chip label="不確定" selected={version === null} onPress={() => setVersion(null)} />
        </View>
        <T size={13} color={C.muted}>會考不分版本，題目都通用；選了之後，學期複習會照你課本的章節排，每日練習只出你的版本已經教到的學期。各科版本不同，之後可以在「學期複習」個別調整。</T>
      </Card>}

      <Card style={{ gap: 10 }}>
        <H2>選一位錯題小老師</H2>
        {PERSONAS.map((p) => (
          <Chip key={p.id} label={`${p.label}・${p.desc}`} selected={persona === p.id} onPress={() => setPersona(p.id)}
            style={{ alignSelf: 'flex-start' }} />
        ))}
      </Card>

      <Button title="開始練習" onPress={save} disabled={!grade} loading={busy} />
    </Screen>
  );
}
