import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, TextInput, View } from 'react-native';

import { EXAM_SUBJECT_LABEL, ScoreChart } from '@/components/score-chart';
import { Button, Card, ErrorBox, H1, H2, Loading, ProgressBar, Screen, T } from '@/components/ui';
import { api, errorText, type ChildSummary, type MockExamRow } from '@/lib/api';
import { C, ERROR_TYPE_LABEL, isElementary, semesterLabel } from '@/lib/theme';

const SUBJECT_LABEL: Record<string, string> = { math: '數學', chinese: '國文', english: '英語', science: '自然', social: '社會' };

export function ParentHome() {
  const [children, setChildren] = useState<{ id: string; summary: ChildSummary; exams: MockExamRow[] }[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const ids = await api.children();
      const list = await Promise.all(ids.map(async (id) => {
        const [summary, exams] = await Promise.all([api.childSummary(id), api.childMockExams(id, 60).catch(() => [])]);
        return { id, summary, exams };
      }));
      setChildren(list);
    } catch (e) { setError(errorText(e)); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function link() {
    setBusy(true);
    try {
      const r = await api.linkChild(code);
      setCode('');
      if (children?.some((c) => c.id === r.student_id)) Alert.alert('已經綁定過了', `${r.nickname} 已經在你的孩子名單裡。`);
      else Alert.alert('綁定成功', `已綁定 ${r.nickname}`);
      await load();
    } catch (e) { Alert.alert('綁定失敗', errorText(e)); } finally { setBusy(false); }
  }

  if (error) return <Screen><ErrorBox message={error} onRetry={load} /></Screen>;
  if (!children) return <Screen><Loading /></Screen>;

  return (
    <Screen>
      <T size={13} color={C.muted}>家長端</T>
      <H1>孩子的學習狀況</H1>

      {children.map(({ id, summary, exams }) => <ChildCard key={id} s={summary} exams={exams} />)}

      <Card style={{ gap: 10 }}>
        <H2>{children.length ? '再綁定一位孩子' : '綁定孩子的帳號'}</H2>
        <T size={13} color={C.muted}>請孩子打開 App →「我的」，把 8 碼邀請碼告訴你。</T>
        <TextInput
          value={code} onChangeText={(t) => setCode(t.toUpperCase().replace(/\s/g, ''))} maxLength={8} autoCapitalize="characters"
          accessibilityLabel="孩子的邀請碼" placeholder="例如 K7P2QX9M" placeholderTextColor={C.faint}
          style={{ height: 48, borderWidth: 1, borderColor: C.lineStrong, borderRadius: 10, paddingHorizontal: 12, fontSize: 18, letterSpacing: 4, backgroundColor: '#FFFFFF', color: C.ink }}
        />
        <Button title="綁定" onPress={link} disabled={code.replace(/\s/g, '').length !== 8} loading={busy} />
      </Card>
    </Screen>
  );
}

function ChildCard({ s, exams }: { s: ChildSummary; exams: MockExamRow[] }) {
  const practiced = s.days.filter((d) => d.answered > 0).length;
  const frozen = s.days.filter((d) => d.froze && d.answered === 0).length;
  const total = s.days.reduce((a, d) => a + d.answered, 0);
  const correct = s.days.reduce((a, d) => a + d.correct, 0);
  const max = Math.max(1, ...s.days.map((d) => d.answered));
  const semLabel = semesterLabel;
  const topError = s.error_types ? Object.entries(s.error_types).sort((a, b) => b[1] - a[1])[0] : null;

  return (
    <View style={{ gap: 12 }}>
      <Card dark style={{ gap: 4 }}>
        <T size={12} color="#C9D1CF">{s.nickname} · 最近 7 天</T>
        <T size={30} weight="700" color="#FFFFFF">{practiced} / 7 天有練習</T>
        {frozen ? <T size={12} color="#C9D1CF">另有 {frozen} 天用保護卡保住連勝</T> : null}
        <T size={12} color={C.mint}>連勝 {s.streak} 天 · 共 {total} 題 · 答對率 {total ? Math.round((100 * correct) / total) : 0}% · 錯題畢業 {s.graduated_this_week} 題</T>
      </Card>

      <Card style={{ gap: 10 }}>
        <H2>每天練習題數</H2>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 90 }}>
          {s.days.map((d) => (
            <View key={d.day} style={{ alignItems: 'center', gap: 4 }} accessibilityLabel={`${d.day} ${d.answered} 題`}>
              <T size={11} color={C.muted}>{d.answered || ''}</T>
              <View style={{ width: 22, height: Math.max(6, (60 * d.answered) / max), borderRadius: 6, backgroundColor: d.answered ? C.green : C.lineStrong }} />
              <T size={11} color={C.muted}>{d.day.slice(5).replace('-', '/')}</T>
            </View>
          ))}
        </View>
      </Card>

      {s.by_subject?.length ? (
        <Card style={{ gap: 10 }}>
          <H2>各科答對率（7 天）</H2>
          {s.by_subject.map((b) => {
            const pct = b.answered ? b.correct / b.answered : 0;
            return (
              <View key={b.subject} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <T size={13} style={{ width: 36 }}>{b.subject === 'chinese' && isElementary(s.grade) ? '國語' : SUBJECT_LABEL[b.subject] ?? b.subject}</T>
                <View style={{ flex: 1 }}><ProgressBar value={pct} color={pct < 0.7 ? C.accent : C.green} height={10} /></View>
                <T size={13} weight="700" style={{ width: 44, textAlign: 'right' }}>{Math.round(pct * 100)}%</T>
              </View>
            );
          })}
        </Card>
      ) : null}

      {isElementary(s.grade) ? null : <MockExams nickname={s.nickname} exams={exams} />}

      {s.weak_units?.length ? (
        <Card style={{ gap: 8 }}>
          <H2>需要加強</H2>
          {s.weak_units.map((w) => (
            <View key={w.title} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <T size={14}>{semLabel(w.semester)} · {w.title}</T>
              <T size={13} weight="700" color={C.accentDark}>答對 {w.pct}%</T>
            </View>
          ))}
          {topError ? (
            <T size={13} color={C.inkSoft}>最近錯題最常見的原因是「{ERROR_TYPE_LABEL[topError[0]] ?? topError[0]}」。</T>
          ) : null}
        </Card>
      ) : null}
    </View>
  );
}

// 孩子的會考模擬考成績：各科最近一次與變化，點科目看進步曲線
function MockExams({ nickname, exams }: { nickname: string; exams: MockExamRow[] }) {
  const subjects = Object.keys(EXAM_SUBJECT_LABEL).filter((k) => exams.some((e) => e.subject === k));
  const [sel, setSel] = useState<string | null>(null);
  const current = sel && subjects.includes(sel) ? sel : subjects[0];
  if (!subjects.length) {
    return (
      <Card style={{ gap: 6 }}>
        <H2>會考模擬考</H2>
        <T size={13} color={C.muted}>{nickname} 還沒有考過模擬考。可以鼓勵孩子到「練習 → 會考模擬考」試試看。</T>
      </Card>
    );
  }
  return (
    <Card style={{ gap: 10 }}>
      <H2>會考模擬考</H2>
      {subjects.map((k) => {
        const rows = exams.filter((e) => e.subject === k);
        const diff = rows.length > 1 ? rows[0].score - rows[1].score : null;
        return (
          <Pressable key={k} accessibilityRole="button" accessibilityState={{ selected: current === k }} aria-selected={current === k} onPress={() => setSel(k)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 40,
              borderRadius: 10, paddingHorizontal: 8, backgroundColor: current === k ? C.accentSoft : 'transparent' }}>
            <T size={14} style={{ flex: 1 }}>{EXAM_SUBJECT_LABEL[k]}</T>
            <T size={13} color={C.muted}>共 {rows.length} 次</T>
            <T size={15} weight="700" style={{ width: 44, textAlign: 'right' }}>{rows[0].score}</T>
            <T size={13} weight="700" style={{ width: 40, textAlign: 'right' }} color={diff === null ? C.faint : diff >= 0 ? C.greenDark : C.red}>
              {diff === null ? '—' : `${diff > 0 ? '+' : ''}${diff}`}
            </T>
          </Pressable>
        );
      })}
      <ScoreChart rows={exams.filter((e) => e.subject === current)} height={90} />
    </Card>
  );
}
