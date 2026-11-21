import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Card, Chip, T, Tag } from '@/components/ui';
import { WildImage } from '@/components/world-fx';
import type { MistakeRow } from '@/lib/api';
import { SUBJECT_IMG } from '@/lib/art';
import { monsterState, MONSTER_STATE } from '@/lib/game';
import { C, ERROR_TYPE_LABEL, semesterLabel, SUBJECTS, subjectLabel } from '@/lib/theme';
import { palName, wildSpecies } from '@/lib/world';

type State = 'raging' | 'weakened' | 'defeated';
const FILTERS: { id: State | null; label: string }[] = [
  { id: null, label: '全部' },
  { id: 'raging', label: '狂暴中' },
  { id: 'weakened', label: '已削弱' },
  { id: 'defeated', label: '已淨化' },
];

/**
 * 野生魔物（錯題本）：每道錯題是那個單元的夥伴被染黑的野生版。
 * 找小老師弄懂（削弱），再隔 1、3、7 天複習都答對，就能淨化牠，力量回到夥伴身上。
 */
export function WildPanel({ rows, today, purifyXp }: { rows: MistakeRow[]; today: string; purifyXp: number }) {
  const [filter, setFilter] = useState<State | null>(null);
  const [subject, setSubject] = useState<string | null>(null);
  const shown = rows.filter((r) => (subject === null || r.question.subject === subject) && (filter === null || monsterState(r.status) === filter));
  const subjectsWithRows = SUBJECTS.filter((s) => rows.some((r) => r.question.subject === s.id))
    .map((s) => ({ ...s, label: subjectLabel(s.id, rows.find((r) => r.question.subject === s.id)?.question.semester) }));
  // 今天可以複習的：已經弄懂（削弱）而且到期的；還沒弄懂的要先找小老師
  const due = rows.filter((r) => monsterState(r.status) === 'weakened' && r.next_review <= today).length;
  const count = (st: State) => rows.filter((r) => monsterState(r.status) === st).length;

  return (
    <View style={{ gap: 12 }}>
      <T size={13} color={C.muted}>答錯的題目會變成那個單元夥伴的「野生版」。找小老師弄懂牠（削弱），再隔 1、3、7 天複習都答對，就能淨化牠：夥伴 +{purifyXp} 經驗，還沒收服的直接收服。</T>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(['raging', 'weakened', 'defeated'] as const).map((st) => (
          <View key={st} accessibilityLabel={`${MONSTER_STATE[st].label} ${count(st)} 隻`}
            style={{ flex: 1, padding: 10, borderRadius: 14, borderWidth: 1, borderColor: MONSTER_STATE[st].color, backgroundColor: C.card, alignItems: 'center' }}>
            <T size={22} weight="700" color={MONSTER_STATE[st].color}>{count(st)}</T>
            <T size={12} color={C.muted}>{MONSTER_STATE[st].label}</T>
          </View>
        ))}
      </View>
      {due > 0 ? (
        <Button title={`複習今天該打的 ${due} 隻野生魔物`} kind="green" onPress={() => router.push({ pathname: '/quiz', params: { mode: 'review' } })} />
      ) : null}
      {subjectsWithRows.length > 1 ? (
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Chip label="全部科目" selected={subject === null} onPress={() => setSubject(null)} />
          {subjectsWithRows.map((s) => (
            <Chip key={s.id} image={SUBJECT_IMG[s.id]} label={`${s.label} ${rows.filter((r) => r.question.subject === s.id && r.status !== 'graduated').length}`}
              selected={subject === s.id} onPress={() => setSubject(s.id)} />
          ))}
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => <Chip key={f.label} label={f.label} selected={filter === f.id} onPress={() => setFilter(f.id)} />)}
      </View>
      {shown.length === 0 ? (
        <Card><T color={C.muted}>{rows.length === 0 ? '還沒有野生魔物。到地圖出征吧！答錯的題目會變成野生魔物跑進來。' : '這個分類沒有魔物。'}</T></Card>
      ) : shown.map((r) => <WildCard key={r.question.id} r={r} today={today} />)}
    </View>
  );
}

function WildCard({ r, today }: { r: MistakeRow; today: string }) {
  const species = wildSpecies(r.species, r.question.subject);
  const st = monsterState(r.status);
  const s = MONSTER_STATE[st];
  const caught = r.created_at ? r.created_at.slice(0, 10) : null;
  const action = r.status === 'pending' ? '找小老師弄懂牠 ›'
    : st === 'defeated' ? '再看一次 ›'
    : r.next_review <= today ? '今天可以複習 ›' : `下次複習：${r.next_review} ›`;
  const name = st === 'defeated' ? palName(species) : `野生${palName(species)}`;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${name}・${r.question.unit_title}，${s.label}，${action}`}
      onPress={() => router.push({ pathname: '/tutor', params: { questionId: r.question.id } })}>
      <Card style={{ gap: 8, borderColor: s.color, borderWidth: st === 'raging' ? 1.5 : 1 }}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <View style={{ width: 54, height: 54, borderRadius: 14, backgroundColor: C.night, borderWidth: 2, borderColor: s.color, alignItems: 'center', justifyContent: 'center' }}>
            <WildImage species={species} size={52} purified={st === 'defeated'} />
            {st === 'defeated' ? <Ionicons name="sparkles" size={18} color={C.gold} style={{ position: 'absolute', right: -6, bottom: -6 }} /> : null}
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <T weight="700" numberOfLines={1}>{name}・{r.question.unit_title}</T>
            <T size={12} color={C.muted}>{subjectLabel(r.question.subject, r.question.semester)} {semesterLabel(r.question.semester)}{caught ? ` · ${caught} 出現` : ''}</T>
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
          {st === 'weakened' ? <Tag label={`再複習 ${{ learning: 3, consolidating: 2, almost: 1 }[r.status] ?? 1} 次就淨化`} tone="accent" /> : null}
        </View>
        <T size={13} weight="700" color={C.accent}>{action}</T>
      </Card>
    </Pressable>
  );
}
