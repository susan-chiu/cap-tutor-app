import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, BackHandler, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BossBar, buzz, EyeHint, LevelUpBanner, Stars, XpPop } from '@/components/game-fx';
import { Feedback, QuestionView, SolutionCard } from '@/components/question';
import { Button, Card, ErrorBox, H1, Loading, ProgressBar, T } from '@/components/ui';
import { api, errorText, type AnswerResult, type BossResult } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { BOSS_HEARTS, bossStars, comboMessage, levelFor } from '@/lib/game';
import { heroOf } from '@/lib/heroes';
import { shareText } from '@/lib/share';
import { ALL_SUBJECTS, C, currentSemester } from '@/lib/theme';
import { goBack } from '@/lib/nav';

type Mode = 'daily' | 'unit' | 'exam' | 'review';
const DIFF_LABEL: Record<string, string> = { '1': '簡單', '2': '中等', '3': '困難' };

export default function Quiz() {
  const params = useLocalSearchParams<{ mode?: string; units?: string; count?: string; difficulty?: string; title?: string; part?: string; boss?: string; bosskey?: string }>();
  const mode = (params.mode ?? 'daily') as Mode;
  const { profile } = useAuth();

  const [questions, setQuestions] = useState<Awaited<ReturnType<typeof fetchQuestions>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [combo, setCombo] = useState(0);
  // 遊戲效果：飄起的 +XP、升級提示、Boss 被打的震動
  const [pop, setPop] = useState<{ seq: number; text: string; sub: string | null }>({ seq: 0, text: '', sub: null });
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const [bossHit, setBossHit] = useState(0);
  const boss = mode === 'exam' && params.boss ? params.boss : null;
  // 心眼：答錯後先給提示、可以再答一次（第二次答對 +3 XP）
  const [eye, setEye] = useState<{ first: string; hint: string | null; phase: 'hint' | 'retry' | 'done'; ok?: boolean; bonus?: number } | null>(null);
  const [eyeBusy, setEyeBusy] = useState(false);
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
    fetchQuestions(mode, params.units, params.count, grade, subjectsKey, params.difficulty, params.part)
      .then((qs) => { if (!cancelled) { setQuestions(qs); setError(null); } })
      .catch((e) => { if (!cancelled) setError(errorText(e)); });
    return () => { cancelled = true; };
  }, [mode, params.units, params.count, grade, subjectsKey, params.difficulty, params.part, reloadKey]);

  function load() {
    setError(null);
    setQuestions(null);
    setReloadKey((k) => k + 1);
  }

  const q = questions?.[idx];
  const finished = questions && idx >= questions.length;
  const eyeHidden = !!eye && eye.phase !== 'done';

  async function check() {
    // 用 ref 擋連點：state 要等下一次畫面更新才生效，快速點兩下會送出兩次
    if (!q || !picked || result || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const r = await api.submit(q.id, picked, mode === 'review' ? 'review' : mode === 'exam' ? 'exam' : 'practice');
      setResult(r);
      if (!r.correct) {
        const first = picked;
        setEye({ first, hint: r.wrong_reason, phase: 'hint' });
        api.solution(q.id).then((sol) => {
          const h = sol.hints?.find(Boolean);
          if (h) setEye((e) => (e && e.first === first && e.phase !== 'done' ? { ...e, hint: h } : e));
        }).catch(() => {});
      }
      // 答錯時捲到選項底部，長題目也看得到正確答案（不會被下方解析擋住）
      if (!r.correct) setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
      const nextCombo = r.correct ? combo + 1 : 0;
      setCombo(nextCombo);
      buzz(r.correct ? 'correct' : 'wrong');
      if (r.correct) {
        setPop((p) => ({ seq: p.seq + 1, text: `+${r.xp_gained} XP`, sub: comboMessage(nextCombo) }));
        setBossHit((h) => h + 1);
      }
      const before = levelFor(r.xp_total - r.xp_gained), after = levelFor(r.xp_total);
      if (after > before) { setLevelUp(after); buzz('levelup'); } else setLevelUp(null);
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

  async function eyeRetry() {
    if (!q || !eye || !picked || eyeBusy) return;
    setEyeBusy(true);
    try {
      const r = await api.retryBonus(q.id, picked);
      setEye({ ...eye, phase: 'done', ok: r.correct, bonus: r.xp_gained });
      buzz(r.correct ? 'correct' : 'wrong');
      if (r.correct && r.xp_gained) {
        setPop((p) => ({ seq: p.seq + 1, text: `心眼 +${r.xp_gained} XP`, sub: null }));
        setStats((s) => ({ ...s, xp: s.xp + r.xp_gained }));
        const before = levelFor(r.xp_total - r.xp_gained), after = levelFor(r.xp_total);
        if (after > before) { setLevelUp(after); buzz('levelup'); }
      }
    } catch { setEye({ ...eye, phase: 'done', ok: picked === result?.answer, bonus: 0 }); }
    finally { setPicked(eye.first); setEyeBusy(false); }
  }

  function next() {
    setEye(null);
    setLevelUp(null);
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
          <Summary stats={stats} total={questions.length} allSeen={mode !== 'review' && questions.every((x) => x.seen)} mode={mode} boss={boss}
            bossKey={boss ? params.bosskey ?? null : null} questionIds={questions.map((x) => x.id)}
            onAgain={() => { setIdx(0); setCombo(0); setStats({ answered: 0, correct: 0, xp: 0, streak: 0, streakUp: false }); load(); }} />
        ) : q ? (
          <>
            <BossBar name={boss ?? (mode === 'daily' ? '突擊副本・小怪群' : mode === 'review' ? '魔物圖鑑・復仇魔物' : `${params.title ?? '單元'}守衛`)}
              hp={questions.length - stats.correct} maxHp={questions.length}
              hearts={boss ? Math.max(BOSS_HEARTS - (stats.answered - stats.correct), 0) : null} hit={bossHit} />
            <XpPop seq={pop.seq} text={pop.text} sub={pop.sub} />
            <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 20, gap: 16 }}>
              <T size={13} color={C.muted}>第 {idx + 1} 題 / 共 {questions.length} 題{mode === 'review' ? ' · 錯題複習' : mode === 'exam' ? ` · ${params.title || '段考複習卷'}` : ''}{DIFF_LABEL[params.difficulty ?? ''] ? ` · ${DIFF_LABEL[params.difficulty ?? '']}` : ''}</T>
              <QuestionView q={q} picked={eye?.phase === 'hint' ? null : picked} result={eyeHidden ? null : result}
                struck={eyeHidden ? eye?.first : null}
                onPick={(k) => { if (eye?.phase === 'hint') setEye({ ...eye, phase: 'retry' }); setPicked(k); }} />
              {result && !result.correct && !eyeHidden ? <SolutionCard key={q.id} q={q} picked={eye?.first ?? picked} /> : null}
              {result ? (
                <Pressable accessibilityRole="button" onPress={() => reportQuestion(q.id)} style={{ minHeight: 40, justifyContent: 'center' }}>
                  <T size={13} color={C.muted}>題目或答案有誤？回報給我們</T>
                </Pressable>
              ) : null}
            </ScrollView>
            <View style={{ padding: 16, gap: 12, borderTopWidth: 1, borderTopColor: C.line, maxHeight: '60%',
              backgroundColor: eyeHidden ? C.bg : result ? (result.correct || eye?.ok ? C.greenSoft : C.redSoft) : C.bg }}>
              {eye?.phase === 'hint' ? (
                <EyeHint hero={heroOf(profile?.hero)} hint={eye.hint} onRetry={() => setEye({ ...eye, phase: 'retry' })}
                  onGiveUp={() => { setEye({ ...eye, phase: 'done', ok: false, bonus: 0 }); setPicked(eye.first); }} />
              ) : eye?.phase === 'retry' ? (
                <View style={{ gap: 8 }}>
                  <T size={14} color={C.accentDark}>選一個新答案，答對可以拿 +3 XP（這題還是會收進魔物圖鑑）</T>
                  <Button title="發動心眼・再答一次" onPress={eyeRetry} disabled={!picked || picked === eye.first} loading={eyeBusy} />
                </View>
              ) : result ? (
                <>
                  {/* 解析很長或字體放大時可以捲動，不會把題目整個擠掉 */}
                  <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={{ gap: 8 }}>
                    {levelUp ? <LevelUpBanner level={levelUp} /> : null}
                    {eye?.phase === 'done' && eye.ok ? (
                      <T weight="700" color={C.accentDark}>心眼成功！第二次答對了{eye.bonus ? ` +${eye.bonus} XP` : ''}。這隻魔物還在圖鑑裡，複習時再徹底打倒牠！</T>
                    ) : null}
                    <Feedback result={result} compact wrongTitle={eye?.ok ? '第一次答錯，已收進魔物圖鑑' : undefined} />
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
  grade: number | null, subjectsKey: string, difficulty?: string, part?: string) {
  if (mode === 'review') return (await api.dueReviews(10)).map((r) => ({ ...r.question, seen: true }));
  if (mode === 'daily') {
    // 每日 5 題：伺服器依學生選的科目平均輪流出題，只出各科版本已經教到的學期；題數不夠會自動補滿
    const subjects = subjectsKey ? subjectsKey.split(',') : ALL_SUBJECTS;
    const qs = await api.dailyQuestions(subjects, currentSemester(grade), 5);
    return qs.length ? qs : api.dailyQuestions(subjects, null, 5);
  }
  const ids = (units ?? '').split(',').filter(Boolean);
  const d = difficulty && /^[123]$/.test(difficulty) ? Number(difficulty) : null;
  // 單元練習一輪 10 題（每單元 30 題，3 輪可以做完一遍）
  const p = part && /^[123]$/.test(part) ? Number(part) : null;
  return api.nextQuestions(ids, mode === 'exam' ? Number(count ?? 15) : 10, d, p);
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

function Summary({ stats, total, allSeen, mode, boss, bossKey, questionIds, onAgain }: {
  stats: { answered: number; correct: number; xp: number; streak: number; streakUp: boolean };
  total: number; allSeen: boolean; mode: Mode; boss: string | null; bossKey: string | null; questionIds: string[]; onAgain: () => void;
}) {
  const stars = bossStars(stats.correct, total);
  // 魔王戰結算交給伺服器（依實際作答算星數、第一次三星送保護卡）
  const [reward, setReward] = useState<BossResult | null>(null);
  const idsKey = questionIds.join(',');
  useEffect(() => {
    if (!bossKey || !idsKey) return;
    let cancelled = false;
    api.recordBoss(bossKey, idsKey.split(','))
      .then((r) => { if (!cancelled) { setReward(r); if (r.freeze_reward) buzz('levelup'); } })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [bossKey, idsKey]);
  const won = stars >= 1;
  function share() {
    const streak = stats.streak > 0 ? `，連勝 ${stats.streak} 天` : '';
    shareText(`我在「勇敢學吧」答對 ${stats.correct} / ${total} 題${streak}！一起來勇敢學 💪`);
  }
  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
      <H1>{boss ? (won ? `打敗${boss}了！` : `${boss}還沒倒下…`) : '這一輪完成了！'}</H1>
      {boss ? (
        <Card style={{ alignItems: 'center', gap: 8 }}>
          <Stars n={stars} />
          <T color={C.muted} style={{ textAlign: 'center' }}>
            {stars === 3 ? '完美通關！答對 9 成以上' : stars === 2 ? '答對 7 成以上，再拚一次拿三顆星！' : stars === 1 ? '答對 5 成以上，過關了！' : '答對不到 5 成，把錯題弄懂再來挑戰！'}
          </T>
          {reward?.freeze_reward ? (
            <View accessibilityLiveRegion="polite" style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.accentSoft, borderRadius: 12, padding: 10 }}>
              <Ionicons name="snow" size={24} color={C.accent} />
              <T weight="700" color={C.accentDark} style={{ flex: 1 }}>第一次三星通關！獲得 1 張保護卡（現在 {reward.freeze_cards} 張）</T>
            </View>
          ) : reward?.first_three ? (
            <T size={13} color={C.muted} style={{ textAlign: 'center' }}>第一次三星通關！（保護卡已滿 5 張或今天已經領過，就不再加）</T>
          ) : reward && reward.best === 3 ? (
            <T size={13} color={C.muted}>這個魔王你已經拿過三顆星了</T>
          ) : boss && !bossKey ? (
            <T size={12} color={C.muted} style={{ textAlign: 'center' }}>選了難度的魔王戰不列入星星紀錄</T>
          ) : null}
        </Card>
      ) : null}
      <Card dark style={{ gap: 6 }}>
        <T size={40} weight="700" color="#FFFFFF" style={{ lineHeight: 48 }}>{stats.correct} / {total}</T>
        <T color="#C9D1CF">答對題數 · 獲得 {stats.xp} XP</T>
        {stats.streakUp ? <T weight="700" color={C.flame}>今天的目標完成，連勝 {stats.streak} 天！</T> : null}
      </Card>
      {stats.correct < stats.answered ? (
        <Card><T>答錯的 {stats.answered - stats.correct} 題變成魔物收進魔物圖鑑，找小老師弄懂它們，就能讓錯題畢業。</T></Card>
      ) : null}
      {allSeen ? (
        <Card style={{ backgroundColor: C.accentSoft, borderColor: C.accentSoft, gap: 6 }}>
          <T weight="700" color={C.accentDark}>{mode === 'daily' ? '目前學期的題目你都做過一輪了' : '這個範圍的題目你都做過一輪了'}</T>
          <T size={14} color={C.accentDark}>接下來會重複出現做過的題目。可以去「魔物圖鑑」把錯題弄懂，或到「學期複習」預習下學期、練其他科目。</T>
        </Card>
      ) : null}
      <Button title={boss ? (stars === 3 ? '再挑戰一次' : '再挑戰，拿更多星星') : '再來一輪'} kind="green" onPress={onAgain} />
      <Button title="回首頁" kind="secondary" onPress={() => goBack()} />
      <Button title="分享成績" kind="ghost" onPress={share} />
    </ScrollView>
  );
}
