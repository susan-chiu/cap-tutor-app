// 會考模擬考：仿會考各科題數與時間，作答中不公布答案，交卷後看成績、各單元表現與錯題
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, BackHandler, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { QuestionView, SolutionCard } from '@/components/question';
import { EXAM_SUBJECT_LABEL, ScoreChart } from '@/components/score-chart';
import { Button, Card, Chip, H1, H2, Loading, ProgressBar, T, Tag } from '@/components/ui';
import { api, errorText, isPremiumProfile, type AnswerResult, type MockExamRow, type PublicQuestion } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { C, currentSemester, localToday, isElementarySemester } from '@/lib/theme';
import { goBack } from '@/lib/nav';

// 會考各科選擇題的題數與作答時間（數學另有 2 題非選擇題、英語另有聽力，本 App 不含）
type ExamKey = 'chinese' | 'english' | 'english_listening' | 'math' | 'social' | 'science';
const EXAM_KEYS: ExamKey[] = ['chinese', 'english', 'english_listening', 'math', 'social', 'science'];
const SPEC: Record<ExamKey, { n: number; min: number; note?: string }> = {
  chinese: { n: 42, min: 70 },
  english: { n: 43, min: 60, note: '英語閱讀（聽力另外考）' },
  english_listening: { n: 21, min: 25, note: '用手機語音播放，請戴耳機；可重複播放（會考每題播 2 次）' },
  math: { n: 25, min: 80, note: '只含選擇題，不含 2 題非選擇題' },
  social: { n: 54, min: 70 },
  science: { n: 50, min: 70 },
};
const MINI = 10;

type Stage = 'setup' | 'loading' | 'exam' | 'submitting' | 'result';
const isListeningUnit = (unitId: string) => /^EN-\dL-/.test(unitId);

export default function MockExam() {
  const { profile } = useAuth();
  const premium = isPremiumProfile(profile, localToday());
  const grade = profile?.grade ?? 9;

  const [stage, setStage] = useState<Stage>('setup');
  const [subject, setSubject] = useState<ExamKey>('math');
  const [full, setFull] = useState(premium);
  const [allRange, setAllRange] = useState(grade >= 9);
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [idx, setIdx] = useState(0);
  const [overview, setOverview] = useState(false);
  const [limitSec, setLimitSec] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(0);
  const [results, setResults] = useState<Record<string, AnswerResult>>({});
  const [progress, setProgress] = useState(0);
  const [stopped, setStopped] = useState<string | null>(null);
  const [usedSec, setUsedSec] = useState(0);
  const [saved, setSaved] = useState<{ score: number; previous_score: number | null } | null>(null);
  const [history, setHistory] = useState<MockExamRow[] | null>(null);

  // 歷次成績（選科目時與交卷後重新讀取）
  useEffect(() => {
    if (stage !== 'setup') return;
    let cancelled = false;
    api.myMockExams(subject, 30).then((r) => { if (!cancelled) setHistory(r); }).catch(() => { if (!cancelled) setHistory([]); });
    return () => { cancelled = true; };
  }, [subject, stage]);

  // 交卷需要的最新資料放在 ref（計時器到時間時也能讀到最新作答）
  const live = useRef({ questions: [] as PublicQuestion[], answers: {} as Record<string, string>, startedAt: 0, limitSec: 0,
    submitted: true, key: 'math' as ExamKey, full: false });

  const spec = SPEC[subject];
  const count = full ? spec.n : MINI;
  const minutes = full ? spec.min : Math.max(Math.round((spec.min * MINI) / spec.n), 10);

  async function start() {
    setStage('loading');
    try {
      const base = subject === 'english_listening' ? 'english' : subject;
      const version = base === 'chinese' ? null : profile?.textbook_versions?.[base] ?? null;
      // 英語閱讀與聽力分開出題
      // 會考模擬考只出國中單元（國小題不算進來）
      const units = (await api.units(base, version)).filter((u) => !isElementarySemester(u.semester)).filter((u) =>
        base !== 'english' ? true : subject === 'english_listening' ? isListeningUnit(u.id) : !isListeningUnit(u.id));
      const maxSem = allRange ? null : currentSemester(profile?.grade);
      const ids = units.filter((u) => !maxSem || u.semester <= maxSem).map((u) => u.id);
      const qs = await api.nextQuestions(ids.length ? ids : units.map((u) => u.id), count);
      if (qs.length === 0) throw new Error('這個範圍目前沒有題目');
      setQuestions(qs);
      setAnswers({});
      setResults({});
      setIdx(0);
      setStopped(null);
      const lim = Math.round(minutes * 60 * (qs.length / count));
      setLimitSec(lim);
      const t = Date.now();
      live.current = { questions: qs, answers: {}, startedAt: t, limitSec: lim, submitted: false, key: subject, full };
      setSaved(null);
      setStartedAt(t);
      setNow(t);
      setStage('exam');
    } catch (e) {
      setStage('setup');
      Alert.alert('無法出題', e instanceof Error && !/[a-z_]{6,}/.test(e.message) ? e.message : errorText(e));
    }
  }

  const remaining = stage === 'exam' ? Math.max(limitSec - Math.floor((now - startedAt) / 1000), 0) : 0;

  // 交卷：依序送出作答（沒作答的不送，算答錯）
  const submitAll = useCallback(async () => {
    const L = live.current;
    if (L.submitted) return;  // 防止時間到與按交卷同時觸發
    L.submitted = true;
    const used = Math.min(Math.floor((Date.now() - L.startedAt) / 1000), L.limitSec);
    setUsedSec(used);
    setStage('submitting');
    const out: Record<string, AnswerResult> = {};
    let done = 0;
    let failed = false;
    for (const q of L.questions) {
      const choice = L.answers[q.id];
      if (choice) {
        try {
          out[q.id] = await api.submit(q.id, choice, 'exam');
        } catch (e) {
          setStopped(errorText(e));
          failed = true;
          break;
        }
      }
      done += 1;
      setProgress(done / L.questions.length);
    }
    // 全部批改完成才記錄成績（伺服器依剛剛的作答重新計分）
    if (!failed) {
      try {
        const r = await api.saveMockExam(L.key, L.full, L.questions.map((q) => q.id), used);
        setSaved({ score: r.score, previous_score: r.previous_score });
      } catch { /* 成績沒存到不影響看結果 */ }
    }
    setResults(out);
    setStage('result');
  }, []);

  function pick(id: string, key: string) {
    const next = { ...live.current.answers, [id]: key };
    live.current.answers = next;
    setAnswers(next);
  }

  // 計時：每秒更新，時間到自動交卷
  useEffect(() => {
    if (stage !== 'exam') return;
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t - startedAt >= limitSec * 1000) submitAll();
    }, 1000);
    return () => clearInterval(id);
  }, [stage, startedAt, limitSec, submitAll]);

  function confirmSubmit() {
    const left = questions.length - Object.keys(answers).length;
    Alert.alert('確定交卷？', left > 0 ? `還有 ${left} 題沒作答，沒作答的會算錯。` : '交卷後就不能再修改答案。', [
      { text: '繼續作答', style: 'cancel' },
      { text: '交卷', onPress: () => { submitAll(); } },
    ]);
  }

  function leave() {
    if (stage !== 'exam') { goBack(); return; }
    Alert.alert('要離開模擬考嗎？', '這次的作答不會保存。', [
      { text: '繼續作答', style: 'cancel' },
      { text: '離開', style: 'destructive', onPress: () => goBack() },
    ]);
  }

  // Android 返回鍵：作答中先確認
  const inExam = stage === 'exam';
  useEffect(() => {
    if (!inExam) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert('要離開模擬考嗎？', '這次的作答不會保存。', [
        { text: '繼續作答', style: 'cancel' },
        { text: '離開', style: 'destructive', onPress: () => goBack() },
      ]);
      return true;
    });
    return () => sub.remove();
  }, [inExam]);

  const q = questions[idx];
  const answered = Object.keys(answers).length;
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="離開模擬考" onPress={leave}
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="close" size={26} color={C.muted} />
        </Pressable>
        <T weight="700" style={{ flex: 1 }}>會考模擬考{stage !== 'setup' ? `・${EXAM_SUBJECT_LABEL[subject]}` : ''}</T>
        {stage === 'exam' ? (
          <View accessibilityLabel={`剩下 ${mm} 分 ${ss} 秒`}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, minHeight: 36, borderRadius: 999,
              backgroundColor: remaining < 300 ? C.redSoft : '#EFEBE2' }}>
            <Ionicons name="time-outline" size={16} color={remaining < 300 ? C.red : C.ink} />
            <T weight="700" color={remaining < 300 ? C.red : C.ink}>{mm}:{ss}</T>
          </View>
        ) : null}
      </View>

      {stage === 'setup' ? (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
          <H1>會考模擬考</H1>
          <T color={C.muted}>照會考的題數和時間作答，過程中不公布答案，交卷後一次看成績、各單元表現和錯題解析。</T>
          <Card style={{ gap: 10 }}>
            <H2>科目</H2>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {EXAM_KEYS.map((k) => <Chip key={k} label={EXAM_SUBJECT_LABEL[k]} selected={subject === k} onPress={() => setSubject(k)} />)}
            </View>
            <H2>長度</H2>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Chip label={`迷你 ${MINI} 題`} selected={!full} onPress={() => setFull(false)} />
              <Chip label={`完整 ${spec.n} 題${premium ? '' : '（完整版）'}`} selected={full}
                onPress={() => { if (premium) setFull(true); else router.push('/paywall'); }} />
            </View>
            <H2>範圍</H2>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Chip label="已經學過的學期" selected={!allRange} onPress={() => setAllRange(false)} />
              <Chip label="七上到九下全部" selected={allRange} onPress={() => setAllRange(true)} />
            </View>
            <T size={13} color={C.muted}>
              {`${count} 題・${minutes} 分鐘${full ? '（和會考相同）' : ''}${spec.note ? `。${spec.note}` : ''}。`}
            </T>
            {!premium ? <T size={13} color={C.muted}>免費版的迷你模擬考會算進每天的免費題數。</T> : null}
          </Card>
          <Button title="開始作答" onPress={start} />

          <Card style={{ gap: 10 }}>
            <H2>{EXAM_SUBJECT_LABEL[subject]}・歷次成績</H2>
            {!history ? <Loading /> : history.length === 0 ? (
              <T size={14} color={C.muted}>還沒有考過{EXAM_SUBJECT_LABEL[subject]}模擬考。考完會在這裡看到分數變化。</T>
            ) : (
              <>
                <ScoreChart rows={history} />
                {history[0].by_unit.length ? (
                  <T size={13} color={C.inkSoft}>
                    最近一次最弱的單元：{history[0].by_unit.filter((u) => u.ok < u.n).slice(0, 3).map((u) => `${u.title}（${u.ok}/${u.n}）`).join('、') || '全部答對 🎉'}
                  </T>
                ) : null}
              </>
            )}
          </Card>
        </ScrollView>
      ) : stage === 'loading' ? <Loading label="出題中…" />
        : stage === 'submitting' ? (
          <View style={{ padding: 24, gap: 12 }}>
            <T weight="700">交卷中，正在批改…</T>
            <ProgressBar value={progress} />
          </View>
        ) : stage === 'exam' && q ? (
          <>
            <View style={{ paddingHorizontal: 20, gap: 6 }}>
              <ProgressBar value={answered / questions.length} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <T size={13} color={C.muted}>第 {idx + 1} 題 / 共 {questions.length} 題</T>
                <Pressable accessibilityRole="button" onPress={() => setOverview(!overview)} style={{ minHeight: 32, justifyContent: 'center' }}>
                  <T size={13} weight="700" color={C.accent}>{overview ? '回到題目' : `題目總覽（已答 ${answered}）`}</T>
                </Pressable>
              </View>
            </View>
            {overview ? (
              <ScrollView contentContainerStyle={{ padding: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {questions.map((x, i) => (
                  <Pressable key={x.id} accessibilityRole="button" accessibilityLabel={`第 ${i + 1} 題${answers[x.id] ? '，已作答' : '，未作答'}`}
                    onPress={() => { setIdx(i); setOverview(false); }}
                    style={{ width: 48, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
                      backgroundColor: answers[x.id] ? C.green : '#FFFFFF', borderWidth: i === idx ? 2 : 1,
                      borderColor: i === idx ? C.accent : C.lineStrong }}>
                    <T weight="700" color={answers[x.id] ? '#FFFFFF' : C.ink}>{i + 1}</T>
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
                <QuestionView q={q} picked={answers[q.id] ?? null} result={null}
                  onPick={(k) => pick(q.id, k)} />
              </ScrollView>
            )}
            <View style={{ padding: 16, gap: 10, borderTopWidth: 1, borderTopColor: C.line, flexDirection: 'row' }}>
              <Button title="上一題" kind="secondary" style={{ flex: 1 }} disabled={idx === 0} onPress={() => setIdx(idx - 1)} />
              {idx + 1 < questions.length ? (
                <Button title="下一題" style={{ flex: 1 }} onPress={() => setIdx(idx + 1)} />
              ) : (
                <Button title="交卷" kind="green" style={{ flex: 1 }} onPress={confirmSubmit} />
              )}
            </View>
            {idx + 1 < questions.length ? (
              <Pressable accessibilityRole="button" onPress={confirmSubmit} style={{ minHeight: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                <T size={13} weight="700" color={C.muted}>提早交卷</T>
              </Pressable>
            ) : null}
          </>
        ) : stage === 'result' ? (
          <Result questions={questions} answers={answers} results={results} usedSec={usedSec} stopped={stopped} saved={saved}
            onAgain={() => setStage('setup')} />
        ) : null}
    </SafeAreaView>
  );
}

function Result({ questions, answers, results, usedSec, stopped, saved, onAgain }: {
  questions: PublicQuestion[]; answers: Record<string, string>; results: Record<string, AnswerResult>;
  usedSec: number; stopped: string | null; saved: { score: number; previous_score: number | null } | null; onAgain: () => void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const correct = questions.filter((q) => results[q.id]?.correct).length;
  const unanswered = questions.filter((q) => !answers[q.id]).length;
  const pct = Math.round((correct / questions.length) * 100);
  const byUnit = useMemo(() => {
    const m = new Map<string, { title: string; ok: number; n: number }>();
    for (const q of questions) {
      const u = m.get(q.unit_id) ?? { title: q.unit_title, ok: 0, n: 0 };
      u.n += 1;
      if (results[q.id]?.correct) u.ok += 1;
      m.set(q.unit_id, u);
    }
    return [...m.values()].sort((a, b) => a.ok / a.n - b.ok / b.n);
  }, [questions, results]);
  const wrong = questions.filter((q) => !results[q.id]?.correct);

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
      <H1>交卷完成</H1>
      {stopped ? (
        <Card style={{ backgroundColor: C.redSoft, borderColor: C.redSoft }}>
          <T color={C.redDark}>有部分題目沒有批改完成：{stopped}</T>
        </Card>
      ) : null}
      <Card dark style={{ gap: 6 }}>
        <T size={40} weight="700" color="#FFFFFF" style={{ lineHeight: 48 }}>{pct} 分</T>
        <T color="#C9D1CF">答對 {correct} / {questions.length} 題・未作答 {unanswered} 題・用時 {Math.floor(usedSec / 60)} 分 {usedSec % 60} 秒</T>
        {saved && saved.previous_score !== null ? (
          <T weight="700" color={saved.score >= saved.previous_score ? C.mint : '#FFB4A8'}>
            {saved.score > saved.previous_score ? `比上一次進步 ${saved.score - saved.previous_score} 分！`
              : saved.score === saved.previous_score ? '和上一次一樣，繼續保持！' : `比上一次少 ${saved.previous_score - saved.score} 分，看看下面的弱點單元。`}
          </T>
        ) : null}
        {saved ? <T size={12} color="#C9D1CF">成績已記錄，可以在模擬考首頁看進步曲線。</T> : null}
      </Card>

      <Card style={{ gap: 10 }}>
        <H2>各單元表現（由弱到強）</H2>
        {byUnit.map((u) => (
          <View key={u.title} style={{ gap: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
              <T size={14} style={{ flex: 1 }}>{u.title}</T>
              <T size={14} weight="700" color={u.ok / u.n < 0.6 ? C.red : C.greenDark}>{u.ok} / {u.n}</T>
            </View>
            <ProgressBar value={u.ok / u.n} color={u.ok / u.n < 0.6 ? C.red : C.green} height={6} />
          </View>
        ))}
      </Card>

      {wrong.length ? (
        <Card style={{ gap: 4 }}>
          <H2>錯題與解析（{wrong.length} 題）</H2>
          <T size={13} color={C.muted}>作答錯的題目已收進錯題本；點題目看完整詳解（錯在哪、解題步驟），或找小老師講解。</T>
          {wrong.map((q) => {
            const r = results[q.id];
            const mine = answers[q.id];
            const isOpen = open === q.id;
            return (
              <View key={q.id} style={{ borderTopWidth: 1, borderTopColor: C.line, paddingVertical: 10, gap: 6 }}>
                <Pressable accessibilityRole="button" accessibilityState={{ expanded: isOpen }} aria-expanded={isOpen} onPress={() => setOpen(isOpen ? null : q.id)} style={{ gap: 6 }}>
                  <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                    <Tag label={q.unit_title} />
                    <Tag label={mine ? `你選 ${mine}` : '未作答'} tone="red" />
                    {r ? <Tag label={`答案 ${r.answer}`} tone="green" /> : null}
                  </View>
                  <T numberOfLines={isOpen ? undefined : 2}>{q.stem}</T>
                </Pressable>
                {isOpen ? (
                  <>
                    <T size={14} color={C.inkSoft}>{q.options.map((o) => `(${o.key}) ${o.text}`).join('　')}</T>
                    {r ? <SolutionCard q={q} picked={mine ?? null} /> : <T size={14} color={C.muted}>沒作答的題目不會公布解析，可以在學期複習再練一次。</T>}
                    {mine && r ? (
                      <Button title="找小老師講這題" kind="secondary"
                        onPress={() => router.push({ pathname: '/tutor', params: { questionId: q.id, choice: mine } })} />
                    ) : null}
                  </>
                ) : null}
              </View>
            );
          })}
        </Card>
      ) : null}

      <Button title="再考一次／看歷次成績" kind="green" onPress={onAgain} />
      <Button title="回上一頁" kind="secondary" onPress={() => goBack()} />
    </ScrollView>
  );
}
