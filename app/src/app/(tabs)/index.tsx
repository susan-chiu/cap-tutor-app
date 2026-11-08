import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ImageBackground, Pressable, View } from 'react-native';

import { ParentHome } from '@/components/parent-home';
import { Button, Card, ErrorBox, H2, Loading, ProgressBar, Screen, T } from '@/components/ui';
import { api, errorText, type HomeData, type Limits } from '@/lib/api';
import { rescheduleReminders } from '@/lib/reminders';
import { useAuth } from '@/lib/auth';
import { levelInfo } from '@/lib/game';
import { C, gradeCheckNeeded, gradeLabel } from '@/lib/theme';

const HERO = require('@/assets/images/hero.jpg');

const WEEKDAY = ['日', '一', '二', '三', '四', '五', '六'];

export default function Home() {
  const { profile } = useAuth();
  if (profile?.role === 'parent') return <ParentHome />;
  return <StudentHome />;
}

function StudentHome() {
  const { profile, refreshProfile } = useAuth();
  const [data, setData] = useState<HomeData | null>(null);
  const [limits, setLimits] = useState<Limits | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gradeBusy, setGradeBusy] = useState(false);
  const nextGrade = gradeCheckNeeded(profile?.grade, profile?.grade_confirmed_at);

  async function confirmGrade(g: number) {
    setGradeBusy(true);
    try { await api.updateProfile({ grade: g }); await refreshProfile(); load(); }
    catch (e) { Alert.alert('儲存失敗', errorText(e)); }
    finally { setGradeBusy(false); }
  }

  const load = useCallback(async () => {
    try {
      setError(null);
      const [h, l] = await Promise.all([api.home(), api.limits().catch(() => null)]);
      setData(h);
      if (l) setLimits(l);
      rescheduleReminders({ todayMet: h.today_answered >= h.daily_goal, streak: h.streak }).catch(() => {});
    } catch (e) { setError(errorText(e)); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (error) return <Screen><ErrorBox message={error} onRetry={load} /></Screen>;
  if (!data) return <Screen><Loading /></Screen>;

  const todayDone = data.today_answered >= data.daily_goal;

  const lv = levelInfo(data.xp);
  const energyLeft = data.premium || !limits ? null : Math.max(limits.free_daily_questions - data.today_answered, 0);
  const monsters = data.pending_mistakes + data.due_reviews;

  return (
    <Screen>
      {/* 勇者大廳：主角視覺＋等級、體力、保護卡 */}
      <ImageBackground source={HERO} resizeMode="cover" accessibilityLabel="勇者大廳"
        style={{ borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: C.nightLine, minHeight: 250, justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: 10 }}>
          <StatPill icon="star" color={C.gold} label={`Lv.${lv.level} ${lv.title}`} a11y={`等級 ${lv.level}，${lv.title}`} />
          <StatPill icon="flask" color={C.accent} label={energyLeft === null ? '體力 ∞' : `體力 ${energyLeft}`}
            a11y={energyLeft === null ? '體力無限' : `今天還能練 ${energyLeft} 題`}
            onPress={() => Alert.alert('體力', energyLeft === null ? '完整版沒有體力限制，想練多少就練多少！' : `免費版每天可以練 ${limits?.free_daily_questions} 題，今天還剩 ${energyLeft} 題，明天會補滿。`)} />
          <StatPill icon="shield-checkmark" color={C.green} label={`保護卡 ×${data.freeze_cards}`} a11y={`保護卡 ${data.freeze_cards} 張，點一下看說明`}
            onPress={() => Alert.alert('保護卡', `某一天忘了練習時，會自動用 1 張保護卡保住連勝。\n\n註冊送 2 張，每連勝 7 天再送 1 張，第一次三星打敗魔王也送 1 張，最多存 5 張。你現在有 ${data.freeze_cards} 張。`)} />
        </View>
        <View style={{ padding: 14, backgroundColor: 'rgba(5, 10, 24, 0.72)' }}>
          <T size={13} color={C.accentDark}>勇者 {data.nickname}，歡迎回到大廳</T>
          <T size={21} weight="700" color="#FFFFFF">{todayDone ? '今天的修煉完成了！' : `今天也來討伐 ${data.daily_goal} 題吧`}</T>
        </View>
      </ImageBackground>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <BigAction icon="flash" title="3 分鐘突擊副本" sub={`隨機 ${data.daily_goal} 題`} color={C.accent}
          onPress={() => router.push({ pathname: '/quiz', params: { mode: 'daily' } })} />
        <BigAction icon="skull" title="魔物圖鑑" sub={monsters ? `${monsters} 隻待討伐` : '目前沒有魔物'} color={C.red}
          onPress={() => router.push('/mistakes')} />
      </View>

      {nextGrade ? (
        <Card style={{ backgroundColor: C.accentSoft, borderColor: C.accentSoft, gap: 10 }}>
          <T weight="700" color={C.accentDark}>新學年開始了！你升上{gradeLabel(nextGrade)}了嗎？</T>
          <T size={13} color={C.accentDark}>確認年級後，每日練習和學期複習會換成新學期的範圍。</T>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button title={`是，升${gradeLabel(nextGrade)}`} style={{ flex: 1 }} loading={gradeBusy}
              onPress={() => confirmGrade(nextGrade)} />
            <Button title="還沒" kind="secondary" style={{ flex: 1 }} disabled={gradeBusy}
              onPress={() => confirmGrade(nextGrade - 1)} />
          </View>
        </Card>
      ) : null}

      {data.xp === 0 && data.today_answered === 0 && data.longest_streak === 0 ? (
        <Card style={{ borderColor: C.accent, borderWidth: 2, gap: 8 }}>
          <T size={17} weight="700">歡迎！先做第一輪 5 題 👋</T>
          <T size={14} color={C.inkSoft}>題目會配合你的年級和課本版本。答錯也沒關係，錯題會變成魔物自動收進魔物圖鑑，按「找小老師」就有 AI 一步一步陪你弄懂。</T>
          <Button title="開始第一輪" onPress={() => router.push({ pathname: '/quiz', params: { mode: 'daily' } })} />
        </Card>
      ) : null}

      <Card dark style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="flame" size={40} color={C.flame} />
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
              <T size={44} weight="700" color="#FFFFFF" style={{ lineHeight: 50 }}>{data.streak}</T>
              <T size={16} color="#FFFFFF">天連勝</T>
            </View>
          </View>
          <T size={12} color="#C9D1CF" style={{ textAlign: 'right' }}>{`最長 ${data.longest_streak} 天\nXP ${data.xp}`}</T>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {data.week.map((d, i) => {
            const isToday = i === data.week.length - 1;
            const wd = WEEKDAY[new Date(d.day + 'T00:00:00').getDay()];
            return (
              <View key={d.day} style={{ alignItems: 'center', gap: 6 }}>
                <T size={12} color={isToday ? '#FFFFFF' : '#C9D1CF'} weight={isToday ? '700' : '400'}>{isToday ? '今天' : wd}</T>
                <View style={{
                  width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: d.met ? C.flame : d.froze ? C.nightSoft : 'transparent',
                  borderWidth: d.met || d.froze ? 0 : 2, borderColor: isToday ? C.flame : C.nightSoft,
                  borderStyle: isToday && !d.met ? 'dashed' : 'solid',
                }}>
                  {d.met ? <Ionicons name="checkmark" size={16} color={C.night} />
                    : d.froze ? <Ionicons name="shield-outline" size={14} color={C.mint} /> : null}
                </View>
              </View>
            );
          })}
        </View>
        <T size={12} color={C.mint}>每天答對或答錯都算，答滿 {data.daily_goal} 題就保住連勝；漏一天會自動用保護卡。</T>
        <Pressable accessibilityRole="link" onPress={() => router.push('/help')} style={{ minHeight: 32, justifyContent: 'center' }}>
          <T size={12} weight="700" color="#FFFFFF">怎麼玩？看使用說明 ›</T>
        </Pressable>
      </Card>

      <LevelCard xp={data.xp} />

      <Pressable accessibilityRole="button" accessibilityLabel="許願池，跟爸媽許願，達成目標換獎勵" onPress={() => router.push('/wishes')}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: C.gold }}>
          <Ionicons name="sparkles" size={26} color={C.gold} />
          <View style={{ flex: 1 }}>
            <T weight="700">許願池</T>
            <T size={12} color={C.muted}>跟爸媽許願，達成修煉目標就能兌現獎勵</T>
          </View>
          <T color={C.gold}>›</T>
        </Card>
      </Pressable>

      <Card style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <H2>每日任務</H2>
          <T size={13} color={C.muted}>
            完成 {[todayDone, data.due_reviews === 0, data.pending_mistakes === 0].filter(Boolean).length} / 3
          </T>
        </View>
        <Task
          done={todayDone}
          title={`完成 ${data.daily_goal} 題練習`}
          detail={`${Math.min(data.today_answered, data.daily_goal)} / ${data.daily_goal} 題`
            + (!data.premium && limits ? `・免費版今天還能練 ${Math.max(limits.free_daily_questions - data.today_answered, 0)} 題` : '')}
          progress={data.today_answered / data.daily_goal}
          action={todayDone ? '再練習' : '開始'}
          onPress={() => router.push({ pathname: '/quiz', params: { mode: 'daily' } })}
        />
        <Task
          done={data.due_reviews === 0}
          title="討伐到期的魔物"
          detail={data.due_reviews === 0 ? '今天沒有到期的魔物' : `還有 ${data.due_reviews} 隻`}
          action={data.due_reviews > 0 ? '複習' : undefined}
          onPress={() => router.push({ pathname: '/quiz', params: { mode: 'review' } })}
        />
        <Task
          done={data.pending_mistakes === 0}
          title="單挑狂暴中的魔物"
          detail={data.pending_mistakes === 0 ? '沒有狂暴中的魔物' : `${data.pending_mistakes} 隻還沒弄懂`}
          action={data.pending_mistakes > 0 ? '去看看' : undefined}
          onPress={() => router.push('/mistakes')}
        />
      </Card>

      {data.premium ? (
        <Card style={{ backgroundColor: C.greenSoft, borderColor: C.greenSoft }}>
          <T weight="700" color={C.greenDark}>完整版使用中{data.subscribed ? '（訂閱）' : `（到 ${data.premium_until}）`}</T>
          <T size={13} color={C.greenDark}>題數與小老師次數不受每日限制。</T>
        </Card>
      ) : (
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable accessibilityRole="button" onPress={() => router.push('/paywall')} style={{ flex: 1 }}>
            <Card style={{ gap: 2, height: '100%' }}>
              <T size={12} color={C.muted}>小老師今天 {data.tutor_used_today} / {data.tutor_limit_today} 次</T>
              <T size={15} weight="700">升級完整版</T>
              <T size={12} color={C.accent}>無限練習 ›</T>
            </Card>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.push('/top-three')} style={{ flex: 1 }}>
            <Card style={{ backgroundColor: C.accentSoft, borderColor: C.accentSoft, gap: 2, height: '100%' }}>
              <T size={12} weight="700" color={C.accentDark}>段考全校前三名</T>
              <T size={15} weight="700">免費用一學期</T>
              <T size={12} color={C.accentDark}>上傳證明 ›</T>
            </Card>
          </Pressable>
        </View>
      )}
    </Screen>
  );
}

function Task({ done, title, detail, progress, action, onPress }: {
  done: boolean; title: string; detail: string; progress?: number; action?: string; onPress: () => void;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{
        width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
        backgroundColor: done ? C.green : 'transparent', borderWidth: done ? 0 : 2, borderColor: C.green,
      }}>
        {done ? <Ionicons name="checkmark" size={16} color={C.onAccent} /> : null}
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <T weight="700" color={done ? C.muted : C.ink}>{title}</T>
        {progress !== undefined && !done ? <ProgressBar value={progress} /> : null}
        <T size={12} color={C.muted}>{detail}</T>
      </View>
      {action ? <Button title={action} onPress={onPress} style={{ minHeight: 44, paddingHorizontal: 14 }} /> : null}
    </View>
  );
}

/** 大廳頂部的小狀態（等級、體力、保護卡） */
function StatPill({ icon, color, label, a11y, onPress }: {
  icon: keyof typeof Ionicons.glyphMap; color: string; label: string; a11y: string; onPress?: () => void;
}) {
  return (
    <Pressable accessibilityRole={onPress ? 'button' : 'text'} accessibilityLabel={a11y} onPress={onPress} disabled={!onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 32, paddingHorizontal: 10, borderRadius: 999,
        backgroundColor: 'rgba(5, 10, 24, 0.78)', borderWidth: 1, borderColor: color }}>
      <Ionicons name={icon} size={14} color={color} />
      <T size={12} weight="700" color="#FFFFFF">{label}</T>
    </Pressable>
  );
}

/** 大廳的兩個主要入口 */
function BigAction({ icon, title, sub, color, onPress }: {
  icon: keyof typeof Ionicons.glyphMap; title: string; sub: string; color: string; onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${title}，${sub}`} onPress={onPress}
      style={({ pressed }) => ({ flex: 1, minHeight: 96, padding: 14, gap: 4, borderRadius: 18, borderWidth: 1.5, borderColor: color,
        backgroundColor: C.card, opacity: pressed ? 0.8 : 1, shadowColor: color, shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } })}>
      <Ionicons name={icon} size={26} color={color} />
      <T weight="700" size={16}>{title}</T>
      <T size={12} color={C.muted}>{sub}</T>
    </Pressable>
  );
}

/** 等級卡：等級、稱號、升級進度，加上學習花園與週排行的入口 */
function LevelCard({ xp }: { xp: number }) {
  const lv = levelInfo(xp);
  return (
    <Card style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: C.greenSoft, alignItems: 'center', justifyContent: 'center' }}>
          <T size={11} color={C.green} weight="700">Lv</T>
          <T size={20} weight="700" color={C.green} style={{ lineHeight: 22 }}>{lv.level}</T>
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <T weight="700" size={17}>{lv.title}</T>
          <ProgressBar value={lv.progress} color={C.green} />
          <T size={12} color={C.muted}>再 {lv.next - lv.current} XP 升到 Lv {lv.level + 1}（答對 1 題 +10）</T>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable accessibilityRole="button" onPress={() => router.push('/garden')}
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', minHeight: 44, borderRadius: 12, backgroundColor: C.greenSoft }}>
          <Ionicons name="flower-outline" size={18} color={C.green} />
          <T weight="700" color={C.green}>學習花園</T>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.push('/leaderboard')}
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', minHeight: 44, borderRadius: 12, backgroundColor: C.accentSoft }}>
          <Ionicons name="trophy-outline" size={18} color={C.accentDark} />
          <T weight="700" color={C.accentDark}>本週排行</T>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.push('/badges')}
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', minHeight: 44, borderRadius: 12, backgroundColor: C.goldSoft }}>
          <Ionicons name="ribbon-outline" size={18} color={C.gold} />
          <T weight="700" color={C.gold}>成就徽章</T>
        </Pressable>
      </View>
    </Card>
  );
}
