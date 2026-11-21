import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, BackHandler, Image, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BattleStage } from '@/components/battle';
import { ConquerCard } from '@/components/world-fx';
import { nextEnergy, palName, PAL_STAGE, startEnergy, ultNeed, wildSpecies } from '@/lib/world';
import { buzz, ChestReward, EyeHint, FrameCorners, LevelUpBanner, Stars, XpPop } from '@/components/game-fx';
import { Feedback, QuestionView, SolutionCard } from '@/components/question';
import { Button, Card, ErrorBox, H1, Loading, ProgressBar, T } from '@/components/ui';
import { preloadAds, watchAdFor } from '@/lib/ad-reward';
import { adsAvailable } from '@/lib/ads';
import { api, errorText, isPremiumProfile, type AnswerResult, type BossResult, type ConquerResult, type PalGain } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { BOSS_HEARTS, bossStars, comboMessage, levelFor } from '@/lib/game';
import { arenaImg, bossAttackImg, bossImg, monsterAttackImg, monsterImg, palImg } from '@/lib/art';
import { play, startBgm, stopBgm } from '@/lib/sound';
import { heroOf, type Hero } from '@/lib/heroes';
import { shareText } from '@/lib/share';
import { ALL_SUBJECTS, C, currentSemester, localToday } from '@/lib/theme';
import { goBack } from '@/lib/nav';
import { canBuy } from '@/lib/store';

type Mode = 'daily' | 'unit' | 'exam' | 'review' | 'conquer';
/** 領地戰：最多 5 題，答對 3 題就贏 */
const CONQUER_NEED = 3;
const DIFF_LABEL: Record<string, string> = { '1': '簡單', '2': '中等', '3': '困難' };

export default function Quiz() {
  const params = useLocalSearchParams<{ mode?: string; units?: string; count?: string; difficulty?: string; title?: string; part?: string; boss?: string; bosskey?: string }>();
  const mode = (params.mode ?? 'daily') as Mode;
  const { profile, session } = useAuth();
  const premium = isPremiumProfile(profile, localToday());
  // 免費版可以看廣告換獎勵（體力、XP 加倍）
  const canWatchAd = !premium && adsAvailable() && !!session;
  // 一開戰就把廣告載好，結算或題數用完時按下去立刻播
  useEffect(() => { if (canWatchAd) preloadAds(session?.user.id, ['energy', 'xp2x']); }, [canWatchAd, session?.user.id]);

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
  const [crit, setCrit] = useState(false);
  // 出戰隊伍（最多 3 隻夥伴，同科的會追擊）
  const [team, setTeam] = useState<string[]>([]);
  const [assist, setAssist] = useState<{ seq: number; species: string } | null>(null);
  // 這題淨化（錯題畢業）或助攻進化的夥伴，答題後顯示
  const [palNews, setPalNews] = useState<{ kind: 'purify' | 'evolve'; gain: PalGain } | null>(null);
  // 錯題複習：每道錯題是哪一種野生魔物
  const [wildOf, setWildOf] = useState<Record<string, string>>({});
  useEffect(() => {
    if (mode !== 'review') return;
    api.mistakes(null).then((rows) => setWildOf(Object.fromEntries(rows.map((r) => [r.question.id, wildSpecies(r.species, r.question.subject)])))).catch(() => {});
  }, [mode]);
  // 絕招能量：答對集氣，集滿後按絕招鈕，下一次答對就放絕招（夥伴技能會改變集氣規則）
  useEffect(() => { startBgm('battle'); return () => stopBgm(); }, []);
  const need = ultNeed(mode, team);
  const [ult, setUlt] = useState({ energy: 0, armed: false, shieldUsed: false });
  useEffect(() => {
    api.worldState().then((w) => { const t = w.team ?? []; setTeam(t); setUlt((u) => ({ ...u, energy: Math.max(u.energy, startEnergy(t, ultNeed(mode, t))) })); }).catch(() => {});
  }, [mode]);
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
      .then((qs) => { if (!cancelled) { setQuestions(qs); setError(null); if (qs.length && mode === 'exam' && params.boss) play('bossAppear', 0.7); } })
      .catch((e) => { if (!cancelled) setError(errorText(e)); });
    return () => { cancelled = true; };
  }, [mode, params.units, params.count, grade, subjectsKey, params.difficulty, params.part, params.boss, reloadKey]);

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
      const ne = nextEnergy({ energy: ult.energy, need, correct: r.correct, usedUlt: r.correct && ult.armed, team, shieldUsed: ult.shieldUsed });
      if (r.correct && r.assist_pal) setAssist((a) => ({ seq: (a?.seq ?? 0) + 1, species: r.assist_pal! }));
      if (r.purified) { setPalNews({ kind: 'purify', gain: r.purified }); setTimeout(() => play(r.purified!.stage > r.purified!.stage_before && !r.purified!.new_pal ? 'evolve' : 'capture', 0.8), 700); }
      else if (r.pal_xp && r.pal_xp.stage > r.pal_xp.stage_before) { setPalNews({ kind: 'evolve', gain: r.pal_xp }); setTimeout(() => play('evolve', 0.8), 700); }
      else setPalNews(null);
      if (r.purified?.new_pal) setTeam((t) => (t.length < 3 && !t.includes(r.purified!.species) ? [...t, r.purified!.species] : t));
      setUlt({ energy: ne.energy, shieldUsed: ne.shieldUsed, armed: r.correct ? false : ult.armed && ne.energy >= need });
      buzz(r.correct ? 'correct' : 'wrong');
      play(r.correct ? 'correct' : 'wrong');
      if (r.correct) {
        const cm = comboMessage(nextCombo);
        if (cm) setTimeout(() => play('combo'), 350);
        setCrit(ult.armed);
        if (ult.armed) setTimeout(() => buzz('levelup'), 260);
        const palSub = r.pal_xp ? `${palName(r.pal_xp.species)} 經驗 +${r.pal_xp.xp_gained}` : null;
        setPop((p) => ({ seq: p.seq + 1, text: `+${r.xp_gained} XP`, sub: [cm, palSub].filter(Boolean).join('　') || null }));
        setBossHit((h) => h + 1);
      } else setTimeout(() => play('eye', 0.5), 400);
      const before = levelFor(r.xp_total - r.xp_gained), after = levelFor(r.xp_total);
      if (after > before) { setLevelUp(after); buzz('levelup'); setTimeout(() => play('levelup'), 600); } else setLevelUp(null);
      setStats((s) => ({
        answered: s.answered + 1, correct: s.correct + (r.correct ? 1 : 0), xp: s.xp + r.xp_gained,
        streak: r.streak, streakUp: s.streakUp || r.streak_up,
      }));
    } catch (e) {
      const msg = errorText(e);
      if (msg.includes('免費題數')) {
        Alert.alert('今天的免費題數用完了', canWatchAd ? '看一段廣告，今天可以多練 10 題。' : canBuy ? '明天再來，或升級完整版無限練習。' : '明天再來繼續修煉吧！', [
          { text: '明天再來', onPress: () => goBack() },
          ...(canWatchAd ? [{ text: '看廣告多 10 題', onPress: () => { watchAdEnergy(); } }] : []),
          ...(canBuy ? [{ text: '看看完整版', onPress: () => router.replace('/paywall') }] : []),
        ]);
      } else {
        Alert.alert('無法作答', msg);
      }
    } finally { busyRef.current = false; setBusy(false); }
  }

  // 體力：看廣告讓今天多幾題，看完直接幫學生送出剛才的答案
  async function watchAdEnergy() {
    if (!session) return;
    const r = await watchAdFor('energy', session.user.id);
    if (!r) return;
    play('chest', 0.6);
    Alert.alert('體力補充！', `今天可以再多練 ${r.amount} 題。`, [{ text: '繼續', onPress: () => { check(); } }]);
  }

  async function eyeRetry() {
    if (!q || !eye || !picked || eyeBusy) return;
    setEyeBusy(true);
    try {
      const r = await api.retryBonus(q.id, picked);
      setEye({ ...eye, phase: 'done', ok: r.correct, bonus: r.xp_gained });
      buzz(r.correct ? 'correct' : 'wrong');
      play(r.correct ? 'correct' : 'wrong');
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
    setPalNews(null);
    setPicked(null);
    setResult(null);
    // 領地戰：答對 3 題就贏，或剩下的題目全對也贏不了時，直接結算
    const left = (questions?.length ?? 0) - idx - 1;
    if (mode === 'conquer' && (stats.correct >= CONQUER_NEED || stats.correct + left < CONQUER_NEED)) { setIdx(questions?.length ?? 0); return; }
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
            bossKey={boss ? params.bosskey ?? null : null} conquerUnit={mode === 'conquer' ? params.units ?? null : null} questionIds={questions.map((x) => x.id)} hero={heroOf(profile?.hero)}
            adUserId={canWatchAd && session ? session.user.id : null}
            onAgain={() => { setIdx(0); setCombo(0); setUlt({ energy: startEnergy(team, need), armed: false, shieldUsed: false }); setStats({ answered: 0, correct: 0, xp: 0, streak: 0, streakUp: false }); load(); }} />
        ) : q ? (
          <>
            <BattleStage name={boss ?? (mode === 'daily' ? '突擊副本・小怪群' : mode === 'review' ? `野生${palName(wildOf[q.id] ?? `${q.subject}-1`)}` : mode === 'conquer' ? `${params.title ?? '領地'}的魔物` : `${params.title ?? '單元'}守衛`)}
              hp={mode === 'conquer' ? CONQUER_NEED - stats.correct : questions.length - stats.correct} maxHp={mode === 'conquer' ? CONQUER_NEED : questions.length}
              hearts={boss ? Math.max(BOSS_HEARTS - (stats.answered - stats.correct), 0) : null} hit={bossHit} crit={crit} miss={stats.answered - stats.correct} combo={combo}
              hero={heroOf(profile?.hero)} team={team} assist={assist} wild={mode === 'review'}
              energy={ult.energy} energyNeed={need} ultArmed={ult.armed} onUlt={() => setUlt((u) => (u.energy >= need ? { ...u, armed: true } : u))}
              image={boss ? bossImg(boss) : mode === 'review' ? palImg(wildOf[q.id] ?? `${q.subject}-1`) : monsterImg(q?.subject)}
              attackImage={boss ? bossAttackImg(boss) : mode === 'review' ? undefined : monsterAttackImg(q?.subject)} arena={arenaImg(mode === 'daily' ? null : q?.subject)} />
            <XpPop seq={pop.seq} text={pop.text} sub={pop.sub} />
            <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 20, gap: 16 }}>
              <T size={13} color={C.muted}>第 {idx + 1} 題 / 共 {questions.length} 題{mode === 'review' ? ' · 錯題複習' : mode === 'conquer' ? ` · 領地戰（答對 ${CONQUER_NEED} 題就贏）` : mode === 'exam' ? ` · ${params.title || '段考複習卷'}` : ''}{DIFF_LABEL[params.difficulty ?? ''] ? ` · ${DIFF_LABEL[params.difficulty ?? '']}` : ''}</T>
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
                  <T size={14} color={C.accentDark}>選一個新答案，答對可以拿 +3 XP（這題還是會變成野生魔物收進圖鑑）</T>
                  <Button title="發動心眼・再答一次" onPress={eyeRetry} disabled={!picked || picked === eye.first} loading={eyeBusy} />
                </View>
              ) : result ? (
                <>
                  {/* 解析很長或字體放大時可以捲動，不會把題目整個擠掉 */}
                  <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={{ gap: 8 }}>
                    {levelUp ? <LevelUpBanner level={levelUp} hero={heroOf(profile?.hero)} /> : null}
                    {eye?.phase === 'done' && eye.ok ? (
                      <T weight="700" color={C.accentDark}>心眼成功！第二次答對了{eye.bonus ? ` +${eye.bonus} XP` : ''}。這隻魔物還在圖鑑裡，複習時再徹底打倒牠！</T>
                    ) : null}
                    {palNews ? <PalNewsCard news={palNews} /> : null}
                    <Feedback result={result} compact wrongTitle={eye?.ok ? '第一次答錯，已變成野生魔物收進圖鑑' : undefined} />
                    {!result.correct && !eye?.ok ? <TutorNudge pal={result.assist_pal ?? team[0] ?? null} /> : null}
                  </ScrollView>
                  {result.correct ? (
                    <Button title={idx + 1 >= questions.length || (mode === 'conquer' && stats.correct >= CONQUER_NEED) ? '看結果' : '下一題'} kind="green" onPress={next} />
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
  if (mode === 'conquer') return api.battleQuestions(units ?? '', 5);
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

/** 淨化（錯題畢業）或夥伴進化的消息 */
function PalNewsCard({ news }: { news: { kind: 'purify' | 'evolve'; gain: PalGain } }) {
  const g = news.gain, name = palName(g.species), evolved = g.stage > g.stage_before && !g.new_pal;
  const title = news.kind === 'purify'
    ? (g.new_pal ? `淨化成功！收服了${name}` : evolved ? `淨化成功！${name}進化成${PAL_STAGE[g.stage]}` : `淨化成功！${name}經驗 +${g.xp_gained}`)
    : `${name}進化成${PAL_STAGE[g.stage]}了！`;
  const sub = news.kind === 'purify'
    ? (g.new_pal ? '這道錯題你真的弄懂了，野生魔物變回夥伴，已經加入圖鑑。' : '這道錯題你真的弄懂了，野生魔物被淨化，力量回到夥伴身上。')
    : '一起答對同科的題目，夥伴就會變強。';
  return (
    <View accessibilityLiveRegion="polite" style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 14,
      backgroundColor: '#1A1240', borderWidth: 2, borderColor: C.gold }}>
      <Image source={palImg(g.species)} accessibilityIgnoresInvertColors style={{ width: 52, height: 52 }} />
      <View style={{ flex: 1, gap: 2 }}>
        <T weight="700" color={C.gold}>{title}</T>
        <T size={12} color="#E6ECF7">{sub}</T>
      </View>
    </View>
  );
}

/** 答錯時，同科（或隊長）夥伴提醒可以去問小老師 */
function TutorNudge({ pal }: { pal: string | null }) {
  if (!pal) return null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Image source={palImg(pal)} accessibilityIgnoresInvertColors style={{ width: 34, height: 34 }} />
      <T size={13} color={C.inkSoft} style={{ flex: 1 }}>{palName(pal)}：「我知道這隻魔物的弱點！去問小老師，弄懂了就能把牠淨化。」</T>
    </View>
  );
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

function Summary({ stats, total, allSeen, mode, boss, bossKey, conquerUnit, questionIds, hero, adUserId, onAgain }: {
  stats: { answered: number; correct: number; xp: number; streak: number; streakUp: boolean };
  total: number; allSeen: boolean; mode: Mode; boss: string | null; bossKey: string | null;
  /** 領地戰的單元（不是領地戰就是 null） */
  conquerUnit: string | null; questionIds: string[]; hero: Hero;
  /** 免費版可以看廣告把這一輪的 XP 加倍；null 代表不顯示 */
  adUserId: string | null; onAgain: () => void;
}) {
  const stars = bossStars(stats.correct, total);
  // 看廣告 XP 加倍：伺服器把最近 15 分鐘賺到的 XP 再給一次
  const [doubled, setDoubled] = useState<number | null>(null);
  const [adBusy, setAdBusy] = useState(false);
  async function doubleXp() {
    if (!adUserId) return;
    setAdBusy(true);
    try {
      const r = await watchAdFor('xp2x', adUserId);
      if (r) { setDoubled(r.amount); buzz('levelup'); play('chest', 0.7); }
    } finally { setAdBusy(false); }
  }
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
  // 領地戰結算也交給伺服器：贏了就佔領、收服夥伴、給金幣
  const [conquest, setConquest] = useState<ConquerResult | null>(null);
  const [conquestError, setConquestError] = useState<string | null>(null);
  useEffect(() => {
    if (!conquerUnit || !idsKey) return;
    let cancelled = false;
    api.conquer(conquerUnit, idsKey.split(','))
      .then((r) => { if (!cancelled) { setConquest(r); if (r.rewarded) buzz('levelup'); } })
      .catch((e) => { if (!cancelled) setConquestError(errorText(e)); });
    return () => { cancelled = true; };
  }, [conquerUnit, idsKey]);
  const conquerWon = conquerUnit ? stats.correct >= CONQUER_NEED : false;
  const won = conquerUnit ? conquerWon : stars >= 1;
  // 結算時星星一顆一顆亮起
  useEffect(() => {
    if (!boss) return;
    const ts = Array.from({ length: stars }, (_, i) => setTimeout(() => play('star'), 500 + i * 300));
    return () => ts.forEach(clearTimeout);
  }, [boss, stars]);
  function share() {
    const streak = stats.streak > 0 ? `，連勝 ${stats.streak} 天` : '';
    shareText(`我在「勇敢學吧」答對 ${stats.correct} / ${total} 題${streak}！一起來勇敢學 💪`);
  }
  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
      <H1>{boss ? (won ? `打敗${boss}了！` : `${boss}還沒倒下…`) : conquerUnit ? (won ? '領地戰勝利！' : '這次沒有打下來…') : '這一輪完成了！'}</H1>
      {/* 夥伴的反應：表現好開心、沒過關就鼓勵 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Image source={(boss || conquerUnit ? won : stats.correct * 2 >= Math.max(stats.answered, 1)) ? hero.happy : hero.cheer}
          accessibilityIgnoresInvertColors style={{ width: 120, height: 120 }} />
        <View style={{ flex: 1, padding: 12, borderRadius: 14, backgroundColor: C.night, borderWidth: 1, borderColor: hero.color }}>
          <T size={12} weight="700" color={hero.color}>{hero.name}</T>
          <T weight="700">{(boss || conquerUnit ? won : stats.correct * 2 >= Math.max(stats.answered, 1))
            ? (boss ? '幹得好！魔王被我們打倒了！' : conquerUnit ? '這塊領地是我們的了！' : '做得好！今天又變強了！')
            : (boss ? '別灰心，把錯題弄懂再一起挑戰！' : conquerUnit ? `答對 ${CONQUER_NEED} 題才能佔領，弄懂錯題再來一次！` : '沒關係，錯的題目我們一起弄懂！')}</T>
        </View>
      </View>
      {boss ? (
        <Card style={{ alignItems: 'center', gap: 8, borderColor: C.gold, backgroundColor: '#0E1530' }}>
          <FrameCorners />
          <Image source={bossImg(boss)} accessibilityLabel={boss} accessibilityIgnoresInvertColors
            style={{ width: 150, height: 150, opacity: won ? 0.55 : 1 }} />
          <Stars n={stars} />
          <T color={C.muted} style={{ textAlign: 'center' }}>
            {stars === 3 ? '完美通關！答對 9 成以上' : stars === 2 ? '答對 7 成以上，再拚一次拿三顆星！' : stars === 1 ? '答對 5 成以上，過關了！' : '答對不到 5 成，把錯題弄懂再來挑戰！'}
          </T>
          {reward?.freeze_reward ? (
            <ChestReward title={`獲得 1 張保護卡（現在 ${reward.freeze_cards} 張）`} detail="第一次三星通關的獎勵！忘記練習的那天，保護卡會幫你保住連勝。" />
          ) : reward?.first_three ? (
            <T size={13} color={C.muted} style={{ textAlign: 'center' }}>第一次三星通關！（保護卡已滿 5 張或今天已經領過，就不再加）</T>
          ) : reward && reward.best === 3 ? (
            <T size={13} color={C.muted}>這個魔王你已經拿過三顆星了</T>
          ) : boss && !bossKey ? (
            <T size={12} color={C.muted} style={{ textAlign: 'center' }}>選了難度的魔王戰不列入星星紀錄</T>
          ) : null}
        </Card>
      ) : null}
      {conquerUnit && conquerWon ? (
        conquest?.won ? <ConquerCard result={conquest} />
          : conquestError ? <Card><T color={C.redDark}>{conquestError}</T></Card>
          : conquest ? null : <Card><T color={C.muted}>結算中…</T></Card>
      ) : null}
      <Card dark style={{ gap: 6 }}>
        <T size={40} weight="700" color="#FFFFFF" style={{ lineHeight: 48 }}>{stats.correct} / {conquerUnit ? stats.answered : total}</T>
        <T color="#C9D1CF">答對題數 · 獲得 {stats.xp + (doubled ?? 0)} XP{doubled ? `（廣告加倍 +${doubled}）` : ''}</T>
        {stats.streakUp ? <T weight="700" color={C.flame}>今天的目標完成，連勝 {stats.streak} 天！</T> : null}
      </Card>
      {adUserId && stats.xp > 0 && doubled === null ? (
        <Button title={`看一段廣告，這一輪的 XP 加倍（+${Math.min(stats.xp, 60)}）`} kind="secondary" onPress={doubleXp} loading={adBusy} />
      ) : null}
      {stats.correct < stats.answered ? (
        <Card><T>答錯的 {stats.answered - stats.correct} 題變成野生魔物收進圖鑑。找小老師弄懂、之後複習答對，就能淨化牠們，讓夥伴變強。</T></Card>
      ) : null}
      {allSeen ? (
        <Card style={{ backgroundColor: C.accentSoft, borderColor: C.accentSoft, gap: 6 }}>
          <T weight="700" color={C.accentDark}>{mode === 'daily' ? '目前學期的題目你都做過一輪了' : '這個範圍的題目你都做過一輪了'}</T>
          <T size={14} color={C.accentDark}>接下來會重複出現做過的題目。可以去「圖鑑 → 野生魔物」把錯題弄懂，或到地圖換一塊大陸預習下學期。</T>
        </Card>
      ) : null}
      <Button title={boss ? (stars === 3 ? '再挑戰一次' : '再挑戰，拿更多星星') : conquerUnit ? (won ? '再打一場練功' : '再挑戰一次') : '再來一輪'} kind="green" onPress={onAgain} />
      <Button title={conquerUnit ? '回世界地圖' : mode === 'exam' || mode === 'unit' ? '回魔王城' : '回大廳'} kind="secondary" onPress={() => goBack()} />
      <Button title="分享成績" kind="ghost" onPress={share} />
    </ScrollView>
  );
}
