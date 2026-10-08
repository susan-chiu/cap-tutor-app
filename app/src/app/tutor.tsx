import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ListenPlayer } from '@/components/listen';
import { Feedback, QuestionView } from '@/components/question';
import { Button, Card, Loading, T, Tag } from '@/components/ui';
import { adsAvailable, showRewardedAd } from '@/lib/ads';
import { api, errorText, isPremiumProfile, type AnswerResult, type PublicQuestion } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { C, localToday, PERSONAS } from '@/lib/theme';
import { goBack } from '@/lib/nav';

interface Msg { from: 'tutor' | 'me'; text: string; failed?: boolean }

// 快速回覆依科目不同
const QUICK_REPLIES: Record<string, string[]> = {
  math: ['看不懂題目', '不知道要用什麼公式', '算到一半卡住', '我是用猜的'],
  science: ['看不懂題目', '不知道要用什麼觀念', '算到一半卡住', '我是用猜的'],
  english: ['看不懂句子意思', '不知道要用哪個文法', '有單字不認識', '我是用猜的'],
  chinese: ['看不懂題目', '不懂這個詞的意思', '選項分不清楚', '我是用猜的'],
  social: ['看不懂題目', '不記得這個觀念', '選項分不清楚', '我是用猜的'],
};

export default function Tutor() {
  const { questionId, choice } = useLocalSearchParams<{ questionId: string; choice?: string }>();
  const { profile, session, refreshProfile } = useAuth();
  const premium = isPremiumProfile(profile, localToday());
  const persona = PERSONAS.find((p) => p.id === profile?.tutor_persona) ?? PERSONAS[0];

  const [q, setQ] = useState<PublicQuestion | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [hintLevel, setHintLevel] = useState(0);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [blocked, setBlocked] = useState<string | null>(null);
  const [safety, setSafety] = useState(false);
  const [limitHit, setLimitHit] = useState(false);
  const [adBusy, setAdBusy] = useState(false);
  const [consentBusy, setConsentBusy] = useState(false);
  const needsConsent = !!profile && !profile.ai_consent_at;

  // 驗收題
  const [check, setCheck] = useState<PublicQuestion | null>(null);
  const [checkPick, setCheckPick] = useState<string | null>(null);
  const [checkResult, setCheckResult] = useState<AnswerResult | null>(null);
  const [checkFails, setCheckFails] = useState(0);
  const [checkBusy, setCheckBusy] = useState(false);

  const scroll = useRef<ScrollView>(null);
  const started = useRef(false);
  // 用 ref 擋連點（state 要等畫面更新才生效）
  const sendingRef = useRef(false);
  const checkingRef = useRef(false);

  async function begin() {
    if (!questionId) return;
    setBlocked(null);
    setLimitHit(false);
    try {
      if (!q) setQ(await api.question(questionId));
      setThinking(true);
      const r = await api.tutor({ action: 'start', question_id: questionId, student_choice: choice || null });
      setSessionId(r.session_id);
      if (r.resumed && r.history?.length) {
        // 今天講過這題：接著上次的對話，不另外扣次數
        setMsgs([{ from: 'tutor', text: '（接續今天稍早的講解，不另外扣次數）' }, ...r.history]);
        setHintLevel(r.hint_level);
      } else {
        setMsgs([{ from: 'tutor', text: r.reply }]);
      }
    } catch (e) {
      if (e instanceof Error && e.message === 'daily_tutor_limit') setLimitHit(true);
      else setBlocked(errorText(e));
    } finally { setThinking(false); }
  }

  useEffect(() => {
    if (started.current || !questionId || !profile || needsConsent) return;
    started.current = true;
    begin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId, needsConsent]);

  async function agreeAi() {
    setConsentBusy(true);
    try {
      await api.giveAiConsent();
      await refreshProfile();  // needsConsent 變成 false 後會自動開始
    } catch (e) {
      Alert.alert('無法儲存', errorText(e));
    } finally { setConsentBusy(false); }
  }

  async function watchAd() {
    if (!session) return;
    setAdBusy(true);
    try {
      const earned = await showRewardedAd(session.user.id);
      if (!earned) { Alert.alert('廣告沒有看完', '看完整支廣告才能多一次小老師喔。'); return; }
      await api.grantAdBonus();
      await begin();
    } catch (e) {
      Alert.alert('無法播放廣告', e instanceof Error && e.message.startsWith('ad_') ? errorText(e) : '目前沒有可播放的廣告，請稍後再試。');
    } finally { setAdBusy(false); }
  }

  useEffect(() => { setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50); }, [msgs, thinking, check, checkResult]);

  async function send(action: 'reply' | 'hint' | 'reteach', text?: string) {
    if (!sessionId || sendingRef.current || !questionId) return;
    sendingRef.current = true;
    const shown = action === 'reply' ? text! : action === 'hint' ? (hintLevel >= 2 ? '給我完整解法' : '給我一個提示') : '聽不懂，可以換個方式講嗎？';
    setMsgs((m) => [...m, { from: 'me', text: shown }]);
    setInput('');
    setThinking(true);
    try {
      const r = await api.tutor({ action, question_id: questionId, session_id: sessionId, message: text, student_choice: choice || null });
      setMsgs((m) => [...m, { from: 'tutor', text: r.reply }]);
      setHintLevel(r.hint_level);
      if (r.safety) setSafety(true);
    } catch (e) {
      // 送失敗：標示這則沒送出、把文字放回輸入框，學生不用重打
      setMsgs((m) => m.map((x, i) => (i === m.length - 1 && x.from === 'me' ? { ...x, failed: true } : x)));
      if (action === 'reply' && text) setInput(text);
      if (e instanceof Error && e.message === 'daily_tutor_limit') setLimitHit(true);
      else Alert.alert('沒有送出', errorText(e));
    } finally { sendingRef.current = false; setThinking(false); }
  }

  async function startCheck() {
    if (!questionId || checkingRef.current) return;
    checkingRef.current = true;
    setCheckBusy(true);
    try {
      const s = await api.similar(questionId);
      if (!s) { Alert.alert('找不到相似題', '這個單元目前沒有其他題目可以驗收。'); return; }
      setCheck(s); setCheckPick(null); setCheckResult(null);
    } catch (e) { Alert.alert('無法出題', errorText(e)); }
    finally { checkingRef.current = false; setCheckBusy(false); }
  }

  async function submitCheck() {
    if (!check || !checkPick || !questionId || checkResult || checkingRef.current) return;
    checkingRef.current = true;
    setCheckBusy(true);
    try {
      const r = await api.submit(check.id, checkPick, 'tutor_check', questionId);
      setCheckResult(r);
      if (!r.correct) setCheckFails((n) => n + 1);
    } catch (e) { Alert.alert('無法作答', errorText(e)); }
    finally { checkingRef.current = false; setCheckBusy(false); }
  }

  function reportTutor() {
    if (!questionId) return;
    const done = () => Alert.alert('謝謝回報', '我們會盡快檢查。');
    Alert.alert('回報小老師', '選擇問題類型，我們會請老師檢查。', [
      { text: '講解有錯', onPress: () => { api.report(questionId, 'tutor_wrong').then(done).catch(() => {}); } },
      { text: '內容不恰當', onPress: () => { api.report(questionId, 'tutor_inappropriate').then(done).catch(() => {}); } },
      { text: '取消', style: 'cancel' },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, minHeight: 56, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: C.line }}>
        <Pressable accessibilityRole="button" accessibilityLabel="返回" onPress={() => goBack()}
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="chevron-back" size={24} color={C.ink} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <T size={16} weight="700">錯題小老師</T>
          <T size={12} color={C.muted}>{persona.label}・AI 產生的講解</T>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="回報小老師講錯或內容不恰當" onPress={reportTutor}
          style={{ minHeight: 44, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: C.line, justifyContent: 'center' }}>
          <T size={13} color={C.muted}>回報</T>
        </Pressable>
      </View>

      {/* SDK 57 起 Android 為全螢幕（edge-to-edge），鍵盤不會自動推畫面，兩個平台都用 padding */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView ref={scroll} contentContainerStyle={{ padding: 16, gap: 10 }}>
          {needsConsent ? (
            <Card style={{ gap: 10 }}>
              <T weight="700">使用 AI 小老師前，請先看一下</T>
              <T size={14} color={C.inkSoft}>
                {'小老師的回覆是由 AI（Anthropic 公司的 Claude）產生的。使用時，這一題的題目、你的作答和你輸入的文字，' +
                  '會傳送到 Anthropic（美國）處理，用來產生講解；不會傳送你的姓名、Email 或學校。'}
              </T>
              <T size={14} color={C.inkSoft}>請不要在對話裡輸入姓名、電話、地址等個人資料。AI 可能會講錯，看到錯誤或不恰當的內容，請按右上角「回報」。</T>
              <T size={13} color={C.muted}>未滿 18 歲請和家長一起確認。詳細內容請看隱私權政策。</T>
              <Button title="我同意，開始使用" kind="green" loading={consentBusy} onPress={agreeAi} />
              <Button title="先不要" kind="ghost" onPress={() => goBack()} />
            </Card>
          ) : null}
          {!needsConsent && !q && !blocked && !limitHit ? <Loading /> : null}
          {q ? (
            <Card style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <Tag label={q.unit_title} />
                {choice ? <Tag label={`你選了 ${choice}`} tone="red" /> : null}
              </View>
              {q.listen_script ? <ListenPlayer script={q.listen_script} revealed /> : null}
              <T>{q.stem}</T>
              <T size={14} color={C.muted}>{q.options.map((o) => `(${o.key}) ${o.text}`).join('　')}</T>
            </Card>
          ) : null}

          {needsConsent ? null : <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <T size={12} weight="700" color={C.green}>提示 {hintLevel} / 3</T>
            <View style={{ flex: 1, flexDirection: 'row', gap: 4 }}>
              {[1, 2, 3].map((n) => (
                <View key={n} style={{ flex: 1, height: 6, borderRadius: 999, backgroundColor: n <= hintLevel ? C.green : '#D8E6E1' }} />
              ))}
            </View>
          </View>}

          {limitHit ? (
            <Card style={{ backgroundColor: C.accentSoft, borderColor: C.accentSoft, gap: 10 }}>
              <T weight="700" color={C.accentDark}>今天的免費小老師次數用完了</T>
              <T size={14} color={C.accentDark}>選一個方式繼續：</T>
              {!premium && adsAvailable() ? (
                <Button title="看一段廣告，多一次小老師" kind="green" onPress={watchAd} loading={adBusy} />
              ) : null}
              <Button title="升級完整版（每天 50 次）" onPress={() => router.push('/paywall')} />
              <Button title="明天再來" kind="ghost" onPress={() => goBack()} />
            </Card>
          ) : null}

          {blocked ? (
            <Card style={{ backgroundColor: C.accentSoft, borderColor: C.accentSoft, gap: 10 }}>
              <T color={C.accentDark}>{blocked}</T>
              <Button title="回上一頁" kind="secondary" onPress={() => goBack()} />
            </Card>
          ) : null}

          {msgs.map((m, i) => (
            <View key={i} accessibilityLiveRegion={m.from === 'tutor' ? 'polite' : 'none'}
              style={{ flexDirection: 'row', justifyContent: m.from === 'me' ? 'flex-end' : 'flex-start', gap: 8 }}>
              {m.from === 'tutor' ? (
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="school-outline" size={16} color="#FFFFFF" />
                </View>
              ) : null}
              <View style={{
                maxWidth: '80%', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14,
                backgroundColor: m.from === 'me' ? C.night : '#FFFFFF', borderWidth: m.from === 'me' ? 0 : 1, borderColor: C.line,
              }}>
                <T size={15} color={m.from === 'me' ? '#FFFFFF' : C.ink}>{m.text}</T>
                {m.failed ? <T size={12} color="#FFB4A8">沒有送出，請再試一次</T> : null}
              </View>
            </View>
          ))}
          {thinking ? <T size={13} color={C.muted}>小老師正在想…</T> : null}

          {msgs.length === 1 && !thinking && !safety ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingLeft: 40 }}>
              {(QUICK_REPLIES[q?.subject ?? 'math'] ?? QUICK_REPLIES.math).map((t) => (
                <Pressable key={t} accessibilityRole="button" onPress={() => send('reply', t)}
                  style={{ minHeight: 44, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: C.lineStrong, backgroundColor: '#FFFFFF', justifyContent: 'center' }}>
                  <T size={13}>{t}</T>
                </Pressable>
              ))}
            </View>
          ) : null}

          {check ? (
            <Card style={{ gap: 12, borderColor: C.green, borderWidth: 2 }}>
              <T weight="700" color={C.greenDark}>驗收題：同一個觀念，換一題試試</T>
              <QuestionView q={check} picked={checkPick} result={checkResult} onPick={setCheckPick} />
              {checkResult ? (
                <>
                  <Feedback result={checkResult} wrongTitle="差一點！再弄懂一次就好" />
                  {checkResult.correct ? (
                    <>
                      <T weight="700" color={C.greenDark}>學會了！這題錯題會在明天、3 天後、7 天後再考你一次。</T>
                      <Button title="完成" kind="green" onPress={() => goBack()} />
                    </>
                  ) : checkFails >= 2 ? (
                    <>
                      <T color={C.inkSoft}>今天先到這裡，明天再試一次會更清楚。也可以把這題拿去問學校老師。</T>
                      <Button title="好，明天再來" kind="secondary" onPress={() => goBack()} />
                    </>
                  ) : (
                    <Button title="請小老師換個方式講" kind="secondary" onPress={() => { setCheck(null); send('reteach'); }} />
                  )}
                </>
              ) : (
                <Button title="檢查答案" kind="green" disabled={!checkPick} loading={checkBusy} onPress={submitCheck} />
              )}
            </Card>
          ) : null}
        </ScrollView>

        {!needsConsent && !blocked && !limitHit && !safety && !check ? (
          <View style={{ padding: 12, gap: 10, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: C.line }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button title={hintLevel >= 2 ? '看完整解法' : '給我提示'} kind="secondary" style={{ flex: 1, minHeight: 44, borderColor: C.green }}
                disabled={!sessionId || thinking || hintLevel >= 3} onPress={() => send('hint')} />
              <Button title="我懂了，驗收" kind="green" style={{ flex: 1, minHeight: 44 }} disabled={!sessionId || thinking} loading={checkBusy} onPress={startCheck} />
            </View>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <TextInput
                value={input} onChangeText={setInput} maxLength={300} placeholder="跟小老師說你怎麼想…" placeholderTextColor={C.faint}
                accessibilityLabel="回覆小老師" returnKeyType="send" onSubmitEditing={() => { if (input.trim()) send('reply', input.trim()); }}
                style={{ flex: 1, minHeight: 44, borderWidth: 1, borderColor: C.line, borderRadius: 12, paddingHorizontal: 12, backgroundColor: C.bg, fontSize: 15, color: C.ink }}
              />
              <Pressable accessibilityRole="button" accessibilityLabel="送出" disabled={!input.trim() || thinking}
                onPress={() => send('reply', input.trim())}
                style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: input.trim() ? C.accent : C.lineStrong, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        ) : null}
        {safety ? (
          <View style={{ padding: 16, backgroundColor: C.accentSoft }}>
            <T size={14} color={C.accentDark}>安心專線 1925（24 小時）、生命線 1995、張老師 1980。有立即危險請撥 110 或 119。</T>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
