import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Card, Chip, ErrorBox, H1, Loading, Screen, T, Tag } from '@/components/ui';
import { api, errorText, type MistakeRow } from '@/lib/api';
import { C, ERROR_TYPE_LABEL, localToday, MISTAKE_STATUS_LABEL, semesterLabel, SUBJECTS, subjectLabel } from '@/lib/theme';

const FILTERS: { id: string | null; label: string }[] = [
  { id: null, label: '全部' },
  { id: 'pending', label: '待講解' },
  { id: 'learning', label: '學習中' },
  { id: 'graduated', label: '已畢業' },
];

export default function Mistakes() {
  const [filter, setFilter] = useState<string | null>(null);
  const [subject, setSubject] = useState<string | null>(null);
  const [rows, setRows] = useState<MistakeRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const all = await api.mistakes(null);
      setRows(all);
    } catch (e) { setError(errorText(e)); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const shown = (rows ?? []).filter((r) =>
    (subject === null || r.question.subject === subject) &&
    (filter === null ? true : filter === 'learning' ? ['learning', 'consolidating', 'almost'].includes(r.status) : r.status === filter));
  // 只顯示有錯題的科目
  const subjectsWithRows = SUBJECTS.filter((s) => (rows ?? []).some((r) => r.question.subject === s.id))
    .map((s) => ({ ...s, label: subjectLabel(s.id, (rows ?? []).find((r) => r.question.subject === s.id)?.question.semester) }));
  const today = localToday();
  const due = (rows ?? []).filter((r) => ['learning', 'consolidating', 'almost'].includes(r.status) && r.next_review <= today).length;

  return (
    <Screen>
      <H1>錯題本</H1>
      <T size={13} color={C.muted}>錯題要隔幾天連續答對 3 次才會畢業：第 1 天、第 3 天、第 7 天各複習一次。</T>

      {due > 0 ? (
        <Button title={`複習今天到期的 ${due} 題`} kind="green"
          onPress={() => router.push({ pathname: '/quiz', params: { mode: 'review' } })} />
      ) : null}

      {subjectsWithRows.length > 1 ? (
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Chip label="全部科目" selected={subject === null} onPress={() => setSubject(null)} />
          {subjectsWithRows.map((s) => (
            <Chip key={s.id} label={`${s.label} ${(rows ?? []).filter((r) => r.question.subject === s.id && r.status !== 'graduated').length}`}
              selected={subject === s.id} onPress={() => setSubject(s.id)} />
          ))}
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => <Chip key={f.label} label={f.label} selected={filter === f.id} onPress={() => setFilter(f.id)} />)}
      </View>

      {error ? <ErrorBox message={error} onRetry={load} /> : !rows ? <Loading /> : shown.length === 0 ? (
        <Card><T color={C.muted}>{rows.length === 0 ? '還沒有錯題。去練習吧！答錯的題目會自動收進來。' : '這個分類沒有題目。'}</T></Card>
      ) : shown.map((r) => {
        const tone = r.status === 'graduated' ? 'green' : r.status === 'pending' ? 'accent' : 'neutral';
        const sem = semesterLabel(r.question.semester);
        return (
          <Pressable key={r.question.id} accessibilityRole="button"
            onPress={() => router.push({ pathname: '/tutor', params: { questionId: r.question.id } })}>
            <Card style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                <Tag label={MISTAKE_STATUS_LABEL[r.status] ?? r.status} tone={tone} />
                <Tag label={`${subjectLabel(r.question.subject, r.question.semester)} ${sem} · ${r.question.unit_title}`.trim()} />
                {r.error_type ? <Tag label={ERROR_TYPE_LABEL[r.error_type] ?? r.error_type} tone="red" /> : null}
                {r.wrong_count > 1 ? <Tag label={`錯 ${r.wrong_count} 次`} tone="red" /> : null}
              </View>
              <T numberOfLines={2}>{r.question.stem}</T>
              <T size={13} weight="700" color={C.accent}>
                {r.status === 'pending' ? '找小老師講解 ›' : r.status === 'graduated' ? '再看一次 ›' : `下次複習：${r.next_review} ›`}
              </T>
            </Card>
          </Pressable>
        );
      })}
    </Screen>
  );
}
