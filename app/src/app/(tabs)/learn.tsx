import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button, Card, Chip, ErrorBox, H1, H2, Loading, ProgressBar, Screen, T, Tag } from '@/components/ui';
import { api, errorText, type UnitPartRow, type UnitRow } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { currentStage, DIFFICULTIES, splitElementaryStages, splitStages, splitStagesByPart, stageStats, type Difficulty, type Stage } from '@/lib/stages';
import {
  C, currentSemester, isElementary, semestersFor, subjectsFor, validSemester, validSubject, TEXTBOOK_VERSIONS, VERSIONED_SUBJECTS, type SemesterId, type SubjectId,
} from '@/lib/theme';

const STATUS = {
  todo: { label: '未開始', tone: 'neutral' as const },
  doing: { label: '複習中', tone: 'accent' as const },
  done: { label: '已完成', tone: 'green' as const },
};
const pctText = (v: number | null) => (v === null ? '—' : `${Math.round(v * 100)}%`);
// 社會科每次段考都考地理、歷史、公民，各考該單元的一段課次
const PART_LABEL: Record<number, string> = { 1: '前段課次', 2: '中段課次', 3: '後段課次' };
const PART_SUBJECTS = ['social'];

export default function Learn() {
  const { profile, refreshProfile } = useAuth();
  const elementary = isElementary(profile?.grade);
  const SEMESTERS = semestersFor(profile?.grade);
  const SUBJECTS = subjectsFor(profile?.grade);
  const nowSem = currentSemester(profile?.grade);
  const nowIdx = SEMESTERS.findIndex((s) => s.id === nowSem);
  const [semPick, setSem] = useState<SemesterId>(nowSem ?? SEMESTERS[0].id);
  // 在「我的」切換國小／國中後，原本選的學期可能不在清單裡，改用目前學期
  const sem = validSemester(profile?.grade, semPick, nowSem);
  const [units, setUnits] = useState<UnitRow[] | null>(null);
  const [parts, setParts] = useState<UnitPartRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [customMode, setCustomMode] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [count, setCount] = useState(15);
  const [subjectPick, setSubject] = useState<SubjectId>('math');
  const grade = profile?.grade ?? null;
  const subject = useMemo(() => validSubject(grade, subjectPick), [grade, subjectPick]);
  // 剛選的版本先記在這裡，畫面立刻切換，不用等存檔與重新讀取個人資料
  const [picks, setPicks] = useState<Record<string, string | null>>({});
  const picksRef = useRef(picks);
  const versioned = !elementary && VERSIONED_SUBJECTS.includes(subject);
  const version = !versioned ? null
    : subject in picks ? picks[subject] : profile?.textbook_versions?.[subject] ?? null;
  const subjectLabel = SUBJECTS.find((s) => s.id === subject)?.label ?? '';
  const semLabel = SEMESTERS.find((s) => s.id === sem)?.label ?? '';

  // 只採用最後一次請求的結果（快速切換科目或版本時，舊的回應不會蓋掉新的）
  const reqId = useRef(0);
  const load = useCallback(async () => {
    const id = ++reqId.current;
    try {
      setError(null);
      const [rows, partRows] = await Promise.all([
        api.units(subject, version),
        // 社會科分段考範圍只用在國中（國小只有期中、期末，照單元前後分）
        !elementary && PART_SUBJECTS.includes(subject) ? api.unitParts(subject) : Promise.resolve(null),
      ]);
      if (id === reqId.current) { setUnits(rows); setParts(partRows); }
    } catch (e) { if (id === reqId.current) setError(errorText(e)); }
  }, [subject, version, elementary]);

  async function chooseVersion(v: string | null) {
    if (v === version) return;
    const nextPicks = { ...picksRef.current, [subject]: v };
    picksRef.current = nextPicks;
    setPicks(nextPicks);
    setUnits(null);
    setPicked([]);
    // 以伺服器上的設定為底，套上這次畫面上所有選擇後一起存（連續切換兩科也不會互相覆蓋）
    const merged: Record<string, string> = { ...(profile?.textbook_versions ?? {}) };
    for (const [k, val] of Object.entries(nextPicks)) { if (val) merged[k] = val; else delete merged[k]; }
    try { await api.updateProfile({ textbook_versions: merged }); refreshProfile(); }
    catch (e) { setError(errorText(e)); }
  }
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const list = useMemo(() => (units ?? []).filter((u) => u.semester === sem), [units, sem]);
  const stages = useMemo(() => (elementary ? splitElementaryStages(list)
    : parts?.length ? splitStagesByPart(list, parts) : splitStages(list)), [elementary, list, parts]);
  const semStats = useMemo(() => stageStats(list), [list]);
  const now = useMemo(() => currentStage(stages), [stages]);
  const diffLabel = DIFFICULTIES.find((d) => d.id === difficulty)?.label ?? '混合';

  function practice(unitIds: string[], n: number, title: string, part?: number) {
    router.push({ pathname: '/quiz', params: {
      mode: 'exam', units: unitIds.join(','), count: String(n), title,
      ...(difficulty ? { difficulty: String(difficulty) } : {}),
      ...(part ? { part: String(part) } : {}),
    } });
  }

  function practiceUnit(u: UnitRow & { part?: number }) {
    router.push({ pathname: '/quiz', params: {
      mode: 'unit', units: u.id, title: u.part ? `${u.title}（${PART_LABEL[u.part]}）` : u.title,
      ...(difficulty ? { difficulty: String(difficulty) } : {}),
      ...(u.part ? { part: String(u.part) } : {}),
    } });
  }

  function toggle(id: string) {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  return (
    <Screen>
      <H1>學期複習</H1>
      {elementary ? null : (
        <Pressable accessibilityRole="button" onPress={() => router.push('/mock-exam')}>
          <Card dark style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Ionicons name="timer-outline" size={28} color={C.flame} />
            <View style={{ flex: 1, gap: 2 }}>
              <T weight="700" color="#FFFFFF">會考模擬考</T>
              <T size={12} color="#C9D1CF">照會考題數計時作答，交卷看成績與弱點單元</T>
            </View>
            <T color="#FFFFFF">›</T>
          </Card>
        </Pressable>
      )}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {SUBJECTS.map((s) => (
          <Chip key={s.id} label={s.label} selected={subject === s.id}
            onPress={() => { if (s.id !== subject) { setSubject(s.id); setUnits(null); setPicked([]); setCustomMode(false); setOpen(null); } }} />
        ))}
      </View>

      {versioned ? (
        <Card style={{ gap: 8 }}>
          <T size={12} color={C.muted}>{subjectLabel}課本版本（照你的課本排章節與段考範圍）</T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {TEXTBOOK_VERSIONS.map((v) => (
              <Chip key={v} label={v} selected={version === v} onPress={() => chooseVersion(v)} />
            ))}
            <Chip label="不分版本" selected={!version} onPress={() => chooseVersion(null)} />
          </View>
          <T size={12} color={C.muted}>每個學校用的書局不同，選你學校的版本，段考範圍會照那個版本的章節順序。</T>
        </Card>
      ) : (
        <T size={12} color={C.muted}>{elementary
          ? '國小題目依 108 課綱分單元，各版本通用；段考範圍照一般學校進度估算。'
          : '國文依會考能力（字音字形、修辭、文言文…）分單元，各版本通用。'}</T>
      )}

      <Card style={{ gap: 8 }}>
        <T size={12} color={C.muted}>選擇學期{nowSem ? `（目前：${SEMESTERS[nowIdx].label}）` : ''}</T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {SEMESTERS.map((s, i) => (
            <Chip key={s.id} label={s.label + (nowIdx >= 0 && i > nowIdx ? '（預習）' : '')} selected={sem === s.id}
              onPress={() => { setSem(s.id); setPicked([]); setOpen(null); }} style={{ minWidth: 96 }} />
          ))}
        </View>
        <T size={12} color={C.muted} style={{ marginTop: 4 }}>題目難度</T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {DIFFICULTIES.map((d) => (
            <Chip key={d.label} label={d.label} selected={difficulty === d.id} onPress={() => setDifficulty(d.id)} />
          ))}
        </View>
      </Card>

      {error ? <ErrorBox message={error} onRetry={load} /> : !units ? <Loading /> : list.length === 0 ? (
        <Card><T color={C.muted}>這個學期沒有{subjectLabel}的新單元{versioned && version ? `（${version}版）` : ''}，可以選其他學期看看。</T></Card>
      ) : (
        <>
          {/* 這學期的整體進度：複習到哪個階段、答對率 */}
          <Card dark style={{ gap: 8 }}>
            <T size={12} color="#C9D1CF">{semLabel} · {subjectLabel}{version ? ` · ${version}` : ''}</T>
            <T size={22} weight="700" color="#FFFFFF">
              {semStats.status === 'done' ? '這學期都複習完了！' : now ? `目前階段：${now.label}` : ''}
            </T>
            <ProgressBar value={semStats.progress} color={C.mint} height={8} />
            <T size={12} color={C.mint}>
              整學期熟練 {semStats.mastered} / {semStats.total} 題 · 答對率 {pctText(semStats.accuracy)}
            </T>
            {semStats.weakest ? (
              <T size={12} color="#FFD7C2">最需要加強：{semStats.weakest.title}（答對 {pctText(semStats.weakest.accuracy)}）</T>
            ) : null}
          </Card>

          {stages.map((st) => (
            <StageCard key={st.key} stage={st} current={now?.key === st.key} expanded={open === st.key}
              onToggle={() => setOpen(open === st.key ? null : st.key)}
              onPractice={() => practice(st.units.map((u) => u.id), st.key === 'final' ? 25 : 15, `${semLabel}${st.label}`, st.units[0]?.part)}
              onUnit={practiceUnit} diffLabel={diffLabel} version={version} />
          ))}

          <T size={12} color={C.muted}>
            {elementary
              ? '考試範圍依一般學校進度估算（國小一學期期中考、期末考各一次，前半學期的單元考期中、後半考期末），實際範圍以學校公告為準；'
              : `段考範圍依一般學校進度估算（一學期 3 次段考，照${version ? `${version}版` : '課本'}章節順序平均分配${parts?.length ? '；社會科每次段考都含地理、歷史、公民' : ''}），實際範圍以學校公告為準；`}
            範圍不一樣可以用下面的「自己選範圍」。
          </T>

          <Card style={{ gap: 10 }}>
            <Pressable accessibilityRole="button" onPress={() => { setCustomMode(!customMode); setPicked([]); }}
              style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <T weight="700">自己選範圍</T>
              <T color={C.accent} weight="700">{customMode ? '收起' : '展開'}</T>
            </Pressable>
            {customMode ? (
              <>
                {list.map((u) => {
                  const on = picked.includes(u.id);
                  return (
                    <Pressable key={u.id} accessibilityRole="checkbox" accessibilityState={{ checked: on }} aria-checked={on} onPress={() => toggle(u.id)}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 }}>
                      <Ionicons name={on ? 'checkbox' : 'square-outline'} size={24} color={on ? C.accent : C.lineStrong} />
                      <T style={{ flex: 1 }}>{u.title}</T>
                    </Pressable>
                  );
                })}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {[10, 15, 25].map((n) => <Chip key={n} label={`${n} 題`} selected={count === n} onPress={() => setCount(n)} />)}
                </View>
                <Button title={`開始作答 · ${count} 題 · ${diffLabel}`} disabled={picked.length === 0}
                  onPress={() => practice(picked, count, `${semLabel}自選範圍`)} />
              </>
            ) : null}
          </Card>
        </>
      )}
    </Screen>
  );
}

function StageCard({ stage, current, expanded, onToggle, onPractice, onUnit, diffLabel, version }: {
  stage: Stage<UnitRow & { part?: number }>; current: boolean; expanded: boolean; onToggle: () => void; onPractice: () => void;
  onUnit: (u: UnitRow & { part?: number }) => void; diffLabel: string; version: string | null;
}) {
  const s = stageStats(stage.units);
  const status = STATUS[s.status];
  const final = stage.key === 'final';
  return (
    <Card style={{ gap: 10, borderWidth: current ? 2 : 1, borderColor: current ? C.accent : C.line }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ionicons name={final ? 'trophy-outline' : 'flag-outline'} size={20} color={final ? C.flame : C.accent} />
        <View style={{ flex: 1 }}><H2>{stage.label}</H2></View>
        {current ? <Tag label="目前階段" tone="accent" /> : null}
        <Tag label={status.label} tone={status.tone} />
      </View>
      <T size={13} color={C.inkSoft} numberOfLines={expanded ? undefined : 2}>
        範圍：{final ? '整學期全部單元' : stage.units.map((u) => (u.part ? `${u.title.split('：')[0]}（${PART_LABEL[u.part]}）` : u.title)).join('、')}
      </T>
      {stage.note ? <T size={12} color={C.muted}>{stage.note}</T> : null}
      <ProgressBar value={s.progress} color={s.progress >= 0.8 ? C.green : C.accent} height={8} />
      <T size={12} color={C.muted}>熟練 {s.mastered} / {s.total} 題 · 作答 {s.answered} 次 · 答對率 {pctText(s.accuracy)}</T>
      {s.weakest ? (
        <T size={13} weight="700" color={C.redDark}>需要加強：{s.weakest.title}（答對 {pctText(s.weakest.accuracy)}）</T>
      ) : null}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button title={`${final ? '總複習' : '段考複習'} · ${final ? 25 : 15} 題`} kind={final ? 'primary' : 'green'} style={{ flex: 1 }} onPress={onPractice}
          accessibilityLabel={`開始${stage.label}・${diffLabel}`} />
        <Button title={expanded ? '收起單元' : '看單元'} kind="secondary" style={{ flex: 1 }} onPress={onToggle}
          accessibilityLabel={`${expanded ? '收起' : '看'}${stage.label}的單元`} />
      </View>
      {expanded ? stage.units.map((u) => {
        const acc = u.answered ? u.correct / u.answered : null;
        const pct = u.total ? u.mastered / u.total : 0;
        return (
          <Pressable key={u.id} accessibilityRole="button" accessibilityLabel={`練習單元 ${u.title}`} onPress={() => onUnit(u)}
            style={{ borderTopWidth: 1, borderTopColor: C.line, paddingTop: 10, gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <T weight="700" style={{ flex: 1 }}>{u.title}{u.part ? `（${PART_LABEL[u.part]}）` : ''}</T>
              <T size={13} weight="700" color={acc !== null && acc < 0.7 ? C.redDark : C.greenDark}>{pctText(acc)}</T>
              <T color={C.muted}>›</T>
            </View>
            {u.chapter ? (
              <T size={12} color={C.muted} numberOfLines={2}>{version} {/^\d/.test(u.chapter) ? `第 ${u.chapter} 章` : u.chapter}・{u.chapter_title}</T>
            ) : null}
            <ProgressBar value={pct} color={pct >= 0.8 ? C.green : C.accent} height={6} />
            <T size={12} color={C.muted}>熟練 {u.mastered} / {u.total} 題 · 點一下練 10 題</T>
          </Pressable>
        );
      }) : null}
    </Card>
  );
}
