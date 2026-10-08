import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, BackHandler, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Feedback, QuestionView, SolutionCard } from '@/components/question';
import { Button, Card, ErrorBox, H1, Loading, ProgressBar, T } from '@/components/ui';
import { api, errorText, type AnswerResult } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { shareText } from '@/lib/share';
import { ALL_SUBJECTS, C, currentSemester } from '@/lib/theme';
import { goBack } from '@/lib/nav';

type Mode = 'daily' | 'unit' | 'exam' | 'review';
const DIFF_LABEL: Record<string, string> = { '1': '簡單', '2': '中等', '3': '困難' };

export default function Quiz() {
  const params = useLocalSearchParams<{ mode?: string; units?: string; count?: string; difficulty?: string; title?: string }>();
  const mode = (params.mode ?? 'daily') as Mode;
  const { profile } = useAuth();

  const [questions, setQuestions] = useState<Awaited<ReturnType<typeof fetchQuestions>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [combo, setCombo] = useState(0);
  const [stats, setStats] = useState({ answered: 0, correct: 0, xp: 0, streak: 0, streakUp: false });

  const [reloadKey, setReloadKey] = useState(0);
  const busyRef = useRef(false);
  const scrollRef = useRef<ScrollView>(null);

  // 注意：只用字串、數字當依賴。個人資料每次重新整理都是新物件，若直接依賴陣列，
  // 從小老師回來時會重新出題，學生做到一半題目就被換掉。
  const grade = profile?.grade ?? null;
  const subjectsKey = profile?.daily_subjects?.join(',') ?? '';
  useEffect(() => {
    let cancelled = false;
    fetchQuestions(mode, params.units, params.count, grade, subjectsKey, params.difficulty)
      .then((qs) => { if (!cancelled) { setQuestions(qs); setError(null); } })
      .catch((e) => { if (!cancelled) setError(errorText(e)); });
    return () => { cancelled = true; };
  }, [mode, params.units, params.count, grade, subjectsKey, params.difficulty, reloadKey]);

  function load() {
    setError(null);
    setQuestions(null);
    setReloadKey((k) => k + 1);
  }

  const q = questions?.[idx];
  const finished = questions && idx >= questions.length;

  async function check() {
    // 用 ref 擋連點：state 要等下一次畫面更新才生效，快速點兩下會送出兩次
    if (!q || !picked || result || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const r = await api.submit(q.id, picked, mode === 'review' ? 'review' : mode === 'exam' ? 'exam' : 'practice');
      setResult(r);
      // 答錯時捲到選項底部，長題目也看得到正確答案（不會被下方解析擋住）
      if (!r.correct) setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
      setCombo((c) => (r.correct ? c + 1 : 0));
      setStats((s) => ({
        answered: s.answered + 1, correct: s.correct + (r.correct ? 1 : 0), xp: s.xp + r.xp_gained,
        streak: r.streak, streakUp: s.streakUp || r.streak_up,
      }));
    } catch (e) {
      const msg = errorText(e);
      if (msg.includes('免費題數')) {
        Alert.alert('今天的免費題數用完了', '明天再來，或升級完整版無限練習。', [
          { text: '明天再來', onPress: () => goBack() },
          { text: '看看完整版', onPress: () => router.replace('/paywall') },
        ]);
      } else {
        Alert.alert('無法作答', msg);
      }
    } finally { busyRef.current = false; setBusy(false); }
  }

  function next() {
    setPicked(null);
    setResult(null);
    setIdx((i) => i + 1);
  }

  function leave() {
    if (stats.answered === 0 || finished) { goBack(); return; }
    Alert.alert('要離開練習嗎？', '已經作答的題目都會保存。', [
      { text: '繼續作答', style: 'cancel' },
      { text: '離開', style: 'destructive', onPress: () => goBack() },
    ]);
  }

  // Android 實體返回鍵也要先確認
  const needsConfirm = stats.answered > 0 && !finished;
  useEffect(() => {
    if (!needsConfirm) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert('要離開練習嗎？', '已經作答的題目都會保存。', [
        { text: '繼續作答', style: 'cancel' },
        { text: '離開', style: 'destructive', onPress: () => goBack() },
      ]);
      return true;
    });
    return () => sub.remove();
  }, [needsConfirm]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="離開練習" onPress={leave}
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="close" size={26} color={C.muted} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <ProgressBar value={questions?.length ? Math.min(idx + (result ? 1 : 0), questions.length) / questions.length : 0} height={12} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, minWidth: 56, justifyContent: 'flex-end' }}
          accessibilityLabel={`連對 ${combo} 題`}>
          <Ionicons name="flame" size={20} color={combo > 0 ? C.flame : C.lineStrong} />
          <T weight="700" color={combo > 0 ? C.accent : C.faint}>{combo}</T>
        </View>
      </View>

      {error ? <View style={{ padding: 16 }}><ErrorBox message={error} onRetry={load} /></View>
        : !questions ? <Loading label="出題中…" />
        : questions.length === 0 ? (
          <View style={{ padding: 16, gap: 12 }}>
            <Card><T>{mode === 'review' ? '今天沒有到期要複習的錯題，太棒了！' : '這個範圍目前沒有題目。'}</T></Card>
            <Button title="回上一頁" onPress={() => goBack()} />
          </View>
        ) : finished ? (
          <Summary stats={stats} total={questions.length} allSeen={mode !== 'review' && questions.every((x) => x.seen)} mode={mode} onAgain={() => { setIdx(0); setStats({ answered: 0, correct: 0, xp: 0, streak: 0, streakUp: false }); load(); }} />
        ) : q ? (
          <>
            <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 20, gap: 16 }}>
              <T size={13} color={C.muted}>第 {idx + 1} 題 / 共 {questions.length} 題{mode === 'review' ? ' · 錯題複習' : mode === 'exam' ? ` · ${params.title || '段考複習卷'}` : ''}{DIFF_LABEL[params.difficulty ?? ''] ? ` · ${DIFF_LABEL[params.difficulty ?? '']}` : ''}</T>
              <QuestionView q={q} picked={picked} result={result} onPick={setPicked} />
              {result && !result.correct ? <SolutionCard key={q.id} q={q} picked={picked} /> : null}
              {result ? (
                <Pressable accessibilityRole="button" onPress={() => reportQuestion(q.id)} style={{ minHeight: 40, justifyContent: 'center' }}>
                  <T size={13} color={C.muted}>題目或答案有誤？回報給我們</T>
                </Pressable>
              ) : null}
            </ScrollView>
            <View style={{ padding: 16, gap: 12, borderTopWidth: 1, borderTopColor: C.line, maxHeight: '60%',
              backgroundColor: result ? (result.correct ? C.greenSoft : C.redSoft) : C.bg }}>
              {result ? (
                <>
                  {/* 解析很長或字體放大時可以捲動，不會把題目整個擠掉 */}
                  <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={{ gap: 8 }}>
                    <Feedback result={result} compact />
                  </ScrollView>
                  {result.correct ? (
                    <Button title={idx + 1 >= questions.length ? '看結果' : '下一題'} kind="green" onPress={next} />
                  ) : (
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <Button title="找小老師" kind="secondary" style={{ flex: 1, borderColor: C.red }}
                        onPress={() => router.push({ pathname: '/tutor', params: { questionId: q.id, choice: picked ?? '' } })} />
                      <Button title={idx + 1 >= questions.length ? '看結果' : '先做下一題'} kind="danger" style={{ flex: 1 }} onPress={next} />
                    </View>
                  )}
                </>
              ) : (
                <Button title="檢查答案" onPress={check} disabled={!picked} loading={busy} />
              )}
            </View>
          </>
        ) : null}
    </SafeAreaView>
  );
}

async function fetchQuestions(mode: Mode, units: string | undefined, count: string | undefined,
  grade: number | null, subjectsKey: string, difficulty?: string) {
  if (mode === 'review') return (await api.dueReviews(10)).map((r) => ({ ...r.question, seen: true }));
  if (mode === 'daily') {
    // 每日 5 題：伺服器依學生選的科目平均輪流出題，只出各科版本已經教到的學期；題數不夠會自動補滿
    const subjects = subjectsKey ? subjectsKey.split(',') : ALL_SUBJECTS;
    const qs = await api.dailyQuestions(subjects, currentSemester(grade), 5);
    return qs.length ? qs : api.dailyQuestions(subjects, null, 5);
  }
  const ids = (units ?? '').split(',').filter(Boolean);
  const d = difficulty && /^[123]$/.test(difficulty) ? Number(difficulty) : null;
  return api.nextQuestions(ids, mode === 'exam' ? Number(count ?? 15) : 5, d);
}

function reportQuestion(questionId: string) {
  const send = (note: string) => api.report(questionId, 'question_wrong', note)
    .then(() => Alert.alert('謝謝回報', '老師會盡快檢查這一題。')).catch(() => {});
  Alert.alert('回報題目', '這題哪裡有問題？', [
    { text: '答案或解析錯了', onPress: () => { send('答案或解析錯了'); } },
    { text: '題目看不懂、有錯字', onPress: () => { send('題目看不懂或有錯字'); } },
    { text: '取消', style: 'cancel' },
  ]);
}

function Summary({ stats, total, allSeen, mode, onAgain }: {
  stats: { answered: number; correct: number; xp: number; streak: number; streakUp: boolean };
  total: number; allSeen: boolean; mode: Mode; onAgain: () => void;
}) {
  function share() {
    const streak = stats.streak > 0 ? `，連勝 ${stats.streak} 天` : '';
    shareText(`我在「會考小老師」答對 ${stats.correct} / ${total} 題${streak}！一起來練會考 💪`);
  }
  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
      <H1>這一輪完成了！</H1>
      <Card dark style={{ gap: 6 }}>
        <T size={40} weight="700" color="#FFFFFF" style={{ lineHeight: 48 }}>{stats.correct} / {total}</T>
        <T color="#C9D1CF">答對題數 · 獲得 {stats.xp} XP</T>
        {stats.streakUp ? <T weight="700" color={C.flame}>今天的目標完成，連勝 {stats.streak} 天！</T> : null}
      </Card>
      {stats.correct < stats.answered ? (
        <Card><T>答錯的 {stats.answered - stats.correct} 題已經收進錯題本，找小老師弄懂它們，就能讓錯題畢業。</T></Card>
      ) : null}
      {allSeen ? (
        <Card style={{ backgroundColor: C.accentSoft, borderColor: C.accentSoft, gap: 6 }}>
          <T weight="700" color={C.accentDark}>{mode === 'daily' ? '目前學期的題目你都做過一輪了' : '這個範圍的題目你都做過一輪了'}</T>
          <T size={14} color={C.accentDark}>接下來會重複出現做過的題目。可以去「錯題本」把錯題弄懂，或到「學期複習」預習下學期、練其他科目。</T>
        </Card>
      ) : null}
      <Button title="再來一輪" kind="green" onPress={onAgain} />
      <Button title="回首頁" kind="secondary" onPress={() => goBack()} />
      <Button title="分享成績" kind="ghost" onPress={share} />
    </ScrollView>
  );
}
