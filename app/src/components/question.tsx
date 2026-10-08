import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { ListenPlayer } from '@/components/listen';
import { Loading, T, Tag } from '@/components/ui';
import { api, errorText, type AnswerResult, type PublicQuestion, type Solution } from '@/lib/api';
import { C, isElementarySemester, semesterLabel, subjectLabel } from '@/lib/theme';

export function QuestionView({ q, picked, result, onPick }: {
  q: PublicQuestion; picked: string | null; result: AnswerResult | null; onPick: (key: string) => void;
}) {
  const sem = semesterLabel(q.semester);
  return (
    <View style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
        <Tag label={`${subjectLabel(q.subject, q.semester)} ${sem} · ${q.unit_title}`.trim()} />
        {q.difficulty >= 3 ? <Tag label={isElementarySemester(q.semester) ? '挑戰題' : '會考難度'} tone="accent" /> : null}
        {q.source.startsWith('cap-') ? <Tag label={`${q.source.slice(4)} 年會考`} tone="green" /> : null}
      </View>
      {q.listen_script ? <ListenPlayer key={q.id} script={q.listen_script} revealed={!!result} /> : null}
      <T size={18} weight="500" style={{ lineHeight: 30 }}>{q.stem}</T>
      <View accessibilityRole="radiogroup" style={{ gap: 10 }}>
        {q.options.map((o) => {
          const isPicked = picked === o.key;
          const isAnswer = result && o.key === result.answer;
          const isWrongPick = result && isPicked && !result.correct;
          const border = isAnswer ? C.green : isWrongPick ? C.red : isPicked ? C.accent : C.lineStrong;
          const bg = isAnswer ? C.greenSoft : isWrongPick ? C.redSoft : isPicked ? C.accentSoft : '#FFFFFF';
          const keyBg = isAnswer ? C.green : isWrongPick ? C.red : isPicked ? C.accent : '#EFEBE2';
          const thick = isAnswer || isWrongPick || isPicked;
          return (
            <Pressable
              key={o.key}
              accessibilityRole="radio"
              accessibilityState={{ checked: isPicked, disabled: !!result }} aria-checked={isPicked} aria-disabled={!!result}
              accessibilityLabel={`選項 ${o.key}：${o.text}`}
              onPress={result ? undefined : () => onPick(o.key)}
              style={{
                minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 14,
                paddingVertical: 12, borderRadius: 14, borderWidth: thick ? 2 : 1, borderColor: border, backgroundColor: bg,
              }}>
              <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: keyBg, alignItems: 'center', justifyContent: 'center' }}>
                <T size={14} weight="700" color={keyBg === '#EFEBE2' ? C.ink : '#FFFFFF'}>{o.key}</T>
              </View>
              <T size={17} style={{ flex: 1 }}>{o.text}</T>
              {isAnswer ? <Ionicons name="checkmark-circle" size={22} color={C.green} /> : null}
              {isWrongPick ? <Ionicons name="close-circle" size={22} color={C.red} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function Feedback({ result, wrongTitle, compact }: { result: AnswerResult; wrongTitle?: string; compact?: boolean }) {
  const ok = result.correct;
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: ok ? C.green : C.red, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={ok ? 'checkmark' : 'close'} size={24} color="#FFFFFF" />
        </View>
        <T size={19} weight="700" color={ok ? C.greenDark : C.redDark}>
          {ok ? `答對了！${result.xp_gained ? `+${result.xp_gained} XP` : ''}` : (wrongTitle ?? '差一點！已收進錯題本')}
        </T>
      </View>
      {!ok && result.wrong_reason ? <T size={14} color={C.redDark}>常見原因：{result.wrong_reason}</T> : null}
      {compact && !ok
        ? <T size={14} color={C.inkSoft}>完整詳解在上方：你錯在哪、正確答案、解題步驟。</T>
        : <T size={14} color={ok ? C.greenDark : C.inkSoft}>{result.explanation}</T>}
      {result.streak_up ? (
        <T size={14} weight="700" color={C.accentDark}>今天的目標完成！連勝 {result.streak} 天</T>
      ) : null}
      {result.mistake_status === 'graduated' ? (
        <T size={14} weight="700" color={C.greenDark}>這題錯題畢業了！</T>
      ) : null}
    </View>
  );
}

// 完整詳解：你選的為什麼錯、正確答案、一步一步的解法、其他選項錯在哪。
// 作答之後才向伺服器拿答案與解析（沒作答過的題目拿不到）。
export function SolutionCard({ q, picked, title = '完整詳解' }: { q: PublicQuestion; picked: string | null; title?: string }) {
  const [sol, setSol] = useState<Solution | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    api.solution(q.id).then((s) => { if (!cancelled) setSol(s); }).catch((e) => { if (!cancelled) setError(errorText(e)); });
    return () => { cancelled = true; };
  }, [q.id]);

  if (error) return <T size={13} color={C.muted}>詳解暫時讀不到：{error}</T>;
  if (!sol) return <Loading label="載入詳解…" />;
  const text = (k: string) => q.options.find((o) => o.key === k)?.text ?? '';
  const right = picked === sol.answer;
  const others = q.options.filter((o) => o.key !== sol.answer && o.key !== picked && sol.wrong_reasons?.[o.key]);
  const steps = (sol.hints ?? []).filter(Boolean);
  return (
    <View accessibilityLabel={title} style={{ gap: 12, padding: 16, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: C.line }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ionicons name="book-outline" size={20} color={C.accent} />
        <T size={17} weight="700">{title}</T>
      </View>

      {picked && !right ? (
        <View style={{ gap: 4, padding: 12, borderRadius: 12, backgroundColor: C.redSoft }}>
          <T size={13} weight="700" color={C.redDark}>你的答案（{picked}）{text(picked)}</T>
          <T size={14} color={C.redDark}>錯在哪裡：{sol.wrong_reasons?.[picked] ?? '這個選項和題目條件不符，對照下面的解題步驟看看哪一步想錯了。'}</T>
        </View>
      ) : !picked ? (
        <View style={{ padding: 12, borderRadius: 12, backgroundColor: C.redSoft }}>
          <T size={13} weight="700" color={C.redDark}>這題沒有作答</T>
        </View>
      ) : null}

      <View style={{ gap: 4, padding: 12, borderRadius: 12, backgroundColor: C.greenSoft }}>
        <T size={13} weight="700" color={C.greenDark}>正確答案（{sol.answer}）{text(sol.answer)}</T>
      </View>

      {steps.length ? (
        <View style={{ gap: 8 }}>
          <T size={14} weight="700">解題步驟</T>
          {steps.map((h, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                <T size={12} weight="700" color={C.accentDark}>{i + 1}</T>
              </View>
              <T size={14} style={{ flex: 1, lineHeight: 22 }}>{h}</T>
            </View>
          ))}
        </View>
      ) : null}

      <View style={{ gap: 4 }}>
        <T size={14} weight="700">完整解法</T>
        <T size={14} color={C.inkSoft} style={{ lineHeight: 22 }}>{sol.explanation}</T>
      </View>

      {others.length ? (
        <View style={{ gap: 6 }}>
          <T size={14} weight="700">其他選項為什麼不對</T>
          {others.map((o) => (
            <View key={o.key} style={{ gap: 2 }}>
              <T size={13} weight="700" color={C.inkSoft}>（{o.key}）{o.text}</T>
              <T size={13} color={C.inkSoft} style={{ lineHeight: 20 }}>{sol.wrong_reasons[o.key]}</T>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
