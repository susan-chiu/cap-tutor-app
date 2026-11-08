import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Card, Chip, ErrorBox, H1, Loading, Screen, T, Tag } from '@/components/ui';
import { api, errorText, type MistakeRow } from '@/lib/api';
import { MONSTER, monsterState, MONSTER_STATE } from '@/lib/game';
import { C, ERROR_TYPE_LABEL, localToday, semesterLabel, SUBJECTS, subjectLabel } from '@/lib/theme';

const FILTERS: { id: 'raging' | 'weakened' | 'defeated' | null; label: string }[] = [
  { id: null, label: '全部' },
  { id: 'raging', label: '🔴 狂暴中' },
  { id: 'weakened', label: '🟡 已削弱' },
  { id: 'defeated', label: '🟢 已討伐' },
];

/** 魔物圖鑑（錯題本）：每道錯題是一隻考點魔物，弄懂、複習答對就能把牠討伐 */
export default function Mistakes() {
  const [filter, setFilter] = useState<'raging' | 'weakened' | 'defeated' | null>(null);
  const [subject, setSubject] = useState<string | null>(null);
  const [rows, setRows] = useState<MistakeRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setRows(await api.mistakes(null));
    } catch (e) { setError(errorText(e)); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const all = rows ?? [];
  const shown = all.filter((r) => (subject === null || r.question.subject === subject) && (filter === null || monsterState(r.status) === filter));
  // 只顯示有錯題的科目
  const subjectsWithRows = SUBJECTS.filter((s) => all.some((r) => r.question.subject === s.id))
    .map((s) => ({ ...s, label: subjectLabel(s.id, all.find((r) => r.question.subject === s.id)?.question.semester) }));
  const today = localToday();
  const due = all.filter((r) => monsterState(r.status) === 'weakened' && r.next_review <= today).length;
  const count = (st: string) => all.filter((r) => monsterState(r.status) === st).length;

  return (
    <Screen>
      <H1>魔物圖鑑</H1>
      <T size={13} color={C.muted}>答錯的題目會變成考點魔物被收進圖鑑。找小老師弄懂牠（削弱），再隔 1、3、7 天複習都答對，就能完全討伐！</T>

      {rows ? (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['raging', 'weakened', 'defeated'] as const).map((st) => (
            <View key={st} accessibilityLabel={`${MONSTER_STATE[st].label} ${count(st)} 隻`}
              style={{ flex: 1, padding: 10, borderRadius: 14, borderWidth: 1, borderColor: MONSTER_STATE[st].color, backgroundColor: C.card, alignItems: 'center' }}>
              <T size={22} weight="700" color={MONSTER_STATE[st].color}>{count(st)}</T>
              <T size={12} color={C.muted}>{MONSTER_STATE[st].label}</T>
            </View>
          ))}
        </View>
      ) : null}

      {due > 0 ? (
        <Button title={`討伐今天到期的 ${due} 隻魔物`} kind="green"
          onPress={() => router.push({ pathname: '/quiz', params: { mode: 'review' } })} />
      ) : null}

      {subjectsWithRows.length > 1 ? (
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Chip label="全部科目" selected={subject === null} onPress={() => setSubject(null)} />
          {subjectsWithRows.map((s) => (
            <Chip key={s.id} label={`${s.label} ${all.filter((r) => r.question.subject === s.id && r.status !== 'graduated').length}`}
              selected={subject === s.id} onPress={() => setSubject(s.id)} />
          ))}
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => <Chip key={f.label} label={f.label} selected={filter === f.id} onPress={() => setFilter(f.id)} />)}
      </View>

      {error ? <ErrorBox message={error} onRetry={load} /> : !rows ? <Loading /> : shown.length === 0 ? (
        <Card><T color={C.muted}>{all.length === 0 ? '圖鑑還是空的。去副本練習吧！答錯的題目會變成魔物被收進來。' : '這個分類沒有魔物。'}</T></Card>
      ) : shown.map((r) => <MonsterCard key={r.question.id} r={r} today={today} />)}
    </Screen>
  );
}

function MonsterCard({ r, today }: { r: MistakeRow; today: string }) {
  const m = MONSTER[r.question.subject] ?? MONSTER.math;
  const st = monsterState(r.status);
  const s = MONSTER_STATE[st];
  const sem = semesterLabel(r.question.semester);
  const caught = r.created_at ? r.created_at.slice(0, 10) : null;
  const action = r.status === 'pending' ? '單挑討伐（找小老師弄懂）›'
    : st === 'defeated' ? '再看一次 ›'
    : r.next_review <= today ? '今天可以複習討伐 ›' : `下次複習：${r.next_review} ›`;
  return (
    <Pressable accessibilityRole="button"
      accessibilityLabel={`${m.name}・${r.question.unit_title}，${s.label}，${action}`}
      onPress={() => router.push({ pathname: '/tutor', params: { questionId: r.question.id } })}>
      <Card style={{ gap: 8, borderColor: s.color, borderWidth: st === 'raging' ? 1.5 : 1, opacity: st === 'defeated' ? 0.75 : 1 }}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <View style={{ width: 50, height: 50, borderRadius: 14, backgroundColor: C.night, borderWidth: 2, borderColor: m.color, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={st === 'defeated' ? 'ribbon' : (m.icon as keyof typeof Ionicons.glyphMap)} size={26} color={m.color} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <T weight="700" numberOfLines={1}>{m.name}・{r.question.unit_title}</T>
            <T size={12} color={C.muted}>{subjectLabel(r.question.subject, r.question.semester)} {sem}{caught ? ` · ${caught} 捕獲` : ''}</T>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: s.color }} />
            <T size={12} weight="700" color={s.color}>{s.label}</T>
          </View>
        </View>
        <T numberOfLines={2} color={C.inkSoft}>{r.question.stem}</T>
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          {r.error_type ? <Tag label={ERROR_TYPE_LABEL[r.error_type] ?? r.error_type} tone="red" /> : null}
          {r.wrong_count > 1 ? <Tag label={`錯 ${r.wrong_count} 次`} tone="red" /> : null}
          {st === 'weakened' ? <Tag label={`剩 ${{ learning: 3, consolidating: 2, almost: 1 }[r.status] ?? 1} 次複習`} tone="accent" /> : null}
        </View>
        <T size={13} weight="700" color={C.accent}>{action}</T>
      </Card>
    </Pressable>
  );
}
