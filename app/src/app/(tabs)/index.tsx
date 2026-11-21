import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Image, type ImageSourcePropType, Pressable, View, useWindowDimensions } from 'react-native';

import { ParentHome } from '@/components/parent-home';
import { Button, Card, ErrorBox, Loading, ProgressBar, Screen, T } from '@/components/ui';
import { api, errorText, type HomeData, type Limits, type Quest, type WorldState } from '@/lib/api';
import { rescheduleReminders } from '@/lib/reminders';
import { useAuth } from '@/lib/auth';
import { FURNITURE_IMG, HALL_BG, ITEM_IMG, WORLD_IMG } from '@/lib/art';
import { GoldPill, PalImage, WildImage } from '@/components/world-fx';
import { FURNITURE, palName } from '@/lib/world';
import { DailyQuests, StarterGuide } from '@/components/quests';
import { GoldButton, MagicCircle } from '@/components/game-fx';
import { levelInfo } from '@/lib/game';
import { startBgm, stopBgm } from '@/lib/sound';
import { heroOf } from '@/lib/heroes';
import { C, gradeCheckNeeded, gradeLabel } from '@/lib/theme';


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
  // 金幣、夥伴、家具（資料庫還沒更新到這一版時是 null，大廳照常顯示）
  const [world, setWorld] = useState<WorldState | null>(null);
  const [quests, setQuests] = useState<Quest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gradeBusy, setGradeBusy] = useState(false);
  const [stageW, setStageW] = useState(0);
  const { height: winH } = useWindowDimensions();
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
      const [h, l, w, qs] = await Promise.all([api.home(), api.limits().catch(() => null), api.worldState().catch(() => null), api.dailyQuests().catch(() => null)]);
      setQuests(qs);
      setData(h);
      if (l) setLimits(l);
      setWorld(w);
      rescheduleReminders({ todayMet: h.today_answered >= h.daily_goal, streak: h.streak }).catch(() => {});
    } catch (e) { setError(errorText(e)); }
  }, []);

  useFocusEffect(useCallback(() => { load(); startBgm('hall'); return () => stopBgm(); }, [load]));

  if (error) return <Screen><ErrorBox message={error} onRetry={load} /></Screen>;
  if (!data) return <Screen><Loading /></Screen>;

  const todayDone = data.today_answered >= data.daily_goal;

  const lv = levelInfo(data.xp);
  const hero = heroOf(profile?.hero);
  // 體力上限含看廣告、熱湯、床多出來的題數
  const energyMax = world?.energy_max ?? limits?.free_daily_questions ?? 0;
  // 舞台高度不超過螢幕剩下的空間，「開始突擊」按鈕才會在第一個畫面就看得到
  const stageH = Math.min(stageW ? stageW / 0.72 : 480, Math.max(winH - 430, 200));
  const team = (world?.team ?? []).map((sp) => world?.pals.find((p) => p.species === sp)).filter((p): p is NonNullable<typeof p> => !!p);
  // 野生魔物入口的圖：隊長那一科的野生版，沒有隊伍就用數學
  const wildPal = team[0]?.species ?? 'math-1';
  const energyLeft = data.premium || !limits ? null : Math.max(energyMax - data.today_answered, 0);

  return (
    <Screen>
      {/* 標題列 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minHeight: 44 }}>
        <Ionicons name="diamond-outline" size={14} color={C.gold} />
        <T size={22} weight="700" style={{ marginHorizontal: 10, letterSpacing: 4 }}>勇者大廳</T>
        <Ionicons name="diamond-outline" size={14} color={C.gold} />
        <Pressable accessibilityRole="button" accessibilityLabel="設定" onPress={() => router.push('/me')}
          style={{ position: 'absolute', right: 0, width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: C.gold, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="settings-outline" size={22} color={C.gold} />
        </Pressable>
      </View>

      {/* 頭像、等級、體力、保護卡 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Image source={hero.face} accessibilityIgnoresInvertColors
          style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: C.gold }} />
        <View style={{ flex: 1, gap: 4 }}>
          <T weight="700" size={16}>Lv.{lv.level} {lv.title}</T>
          <ProgressBar value={lv.progress} color={C.accent} height={8} />
          <T size={11} color={C.muted}>再 {lv.next - lv.current} XP 升到 Lv {lv.level + 1}・{data.streak} 天連勝</T>
        </View>
        <View style={{ gap: 6, alignItems: 'flex-end' }}>
          {world ? <GoldPill gold={world.gold} onPress={() => router.push('/shop')} /> : null}
          <StatPill img={ITEM_IMG.potion} color={C.accent} label={energyLeft === null ? '∞' : `${energyLeft}/${energyMax}`}
            a11y={energyLeft === null ? '體力無限' : `體力：今天還能練 ${energyLeft} 題`}
            onPress={() => Alert.alert('體力', energyLeft === null ? '完整版沒有體力限制，想練多少就練多少！' : `免費版每天可以練 ${energyMax} 題，今天還剩 ${energyLeft} 題，明天會補滿。${world && world.soups_left > 0 ? '\n\n到商店喝熱湯可以再多練幾題。' : ''}`)} />
          <StatPill img={ITEM_IMG.shield} color={C.green} label={`×${data.freeze_cards}`} a11y={`保護卡 ${data.freeze_cards} 張，點一下看說明`}
            onPress={() => Alert.alert('保護卡', `某一天忘了練習時，會自動用 1 張保護卡保住連勝。\n\n註冊送 2 張，每連勝 7 天再送 1 張，第一次三星打敗魔王也送 1 張，最多存 5 張。你現在有 ${data.freeze_cards} 張。`)} />
        </View>
      </View>

      {nextGrade ? (
        <Card style={{ backgroundColor: C.accentSoft, borderColor: C.accentSoft, gap: 10 }}>
          <T weight="700" color={C.accentDark}>新學年開始了！你升上{gradeLabel(nextGrade)}了嗎？</T>
          <T size={13} color={C.accentDark}>確認年級後，每日練習和地圖會換成新學期的範圍。</T>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button title={`是，升${gradeLabel(nextGrade)}`} style={{ flex: 1 }} loading={gradeBusy}
              onPress={() => confirmGrade(nextGrade)} />
            <Button title="還沒" kind="secondary" style={{ flex: 1 }} disabled={gradeBusy}
              onPress={() => confirmGrade(nextGrade - 1)} />
          </View>
        </Card>
      ) : null}

      {/* 新手任務：還沒佔領過領地、也還沒有夥伴時，帶去打第一場 */}
      {world && world.territories === 0 && world.pals.length === 0 ? <StarterGuide heroName={hero.name} /> : null}

      {/* 夥伴之家：勇者站在石台上，出戰隊伍圍在旁邊，買來的家具擺在大廳裡 */}
      <View onLayout={(e) => setStageW(e.nativeEvent.layout.width)}
        style={{ borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: hero.color, backgroundColor: C.night }}>
        <Image source={HALL_BG} accessibilityIgnoresInvertColors resizeMode="cover"
          style={{ width: '100%', height: stageH }} />
        {(world?.owned ?? []).map((id) => {
          const f = FURNITURE[id];
          if (!f || !FURNITURE_IMG[id] || !stageW) return null;
          const size = stageW * f.size;
          return <Image key={id} source={FURNITURE_IMG[id]} accessibilityLabel={f.name} accessibilityIgnoresInvertColors resizeMode="contain"
            style={{ position: 'absolute', left: stageW * f.x - size / 2, top: stageH * f.y - size / 2, width: size, height: size }} />;
        })}
        <View style={{ position: 'absolute', alignSelf: 'center', bottom: stageH * 0.11 - (stageW || 340) * 0.62 * 0.16 }}>
          <MagicCircle size={(stageW || 340) * 0.62} />
        </View>
        <Image source={hero.full} accessibilityLabel={`你的勇者 ${hero.name}`} accessibilityIgnoresInvertColors resizeMode="contain"
          style={{ position: 'absolute', alignSelf: 'center', bottom: stageH * 0.11,
            height: stageH * 0.8, width: stageH * 0.8 * (2 / 3) }} />
        {/* 出戰隊伍：隊長在勇者左邊，另外兩隻在右邊 */}
        {team.map((p, i) => {
          const size = (stageW || 340) * (i === 0 ? 0.26 : 0.21);
          const left = (stageW || 340) * [0.2, 0.62, 0.78][i] - size / 2;
          return (
            <Pressable key={p.species} accessibilityRole="button" accessibilityLabel={`${i === 0 ? '隊長' : '隊員'} ${palName(p.species)}，點一下看夥伴與隊伍`}
              onPress={() => router.push({ pathname: '/mistakes', params: { tab: 'pals' } })}
              style={{ position: 'absolute', left, bottom: stageH * (i === 0 ? 0.13 : 0.12 + 0.06 * (i - 1)) }}>
              <PalImage species={p.species} stage={p.stage} size={size} />
            </Pressable>
          );
        })}
        <View style={{ position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, paddingHorizontal: 10,
          borderRadius: 10, borderWidth: 1, borderColor: C.gold, backgroundColor: 'rgba(5, 10, 24, 0.8)' }}>
          <Ionicons name="shield-half" size={22} color={C.gold} />
          <View>
            <T size={18} weight="700" color="#FFFFFF" style={{ lineHeight: 22 }}>{hero.name}</T>
            <T size={11} color={C.gold}>◆ {hero.job}</T>
          </View>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="更換角色" onPress={() => router.push('/heroes')}
          style={{ position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 36, paddingHorizontal: 12,
            borderRadius: 999, borderWidth: 1, borderColor: C.gold, backgroundColor: 'rgba(5, 10, 24, 0.8)' }}>
          <Ionicons name="shirt-outline" size={14} color={C.gold} />
          <T size={12} weight="700" color="#FFFFFF">更換角色</T>
        </Pressable>
        <View style={{ position: 'absolute', left: 16, right: 16, bottom: 14, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10,
          borderWidth: 1, borderColor: C.gold, backgroundColor: 'rgba(5, 10, 24, 0.85)', alignItems: 'center' }}>
          <T size={14} weight="700" color="#FFFFFF" style={{ textAlign: 'center' }}>
            {todayDone ? '今天的修煉完成了！明天見！' : team.length ? `${hero.name}和${palName(team[0].species)}準備好出征了！` : hero.greet}
          </T>
        </View>
      </View>

      {/* 主要按鈕：每天 5 題保住連勝 */}
      <GoldButton title="出征・3 分鐘" accessibilityLabel={`出征，3 分鐘，隨機 ${data.daily_goal} 題`}
        onPress={() => router.push({ pathname: '/quiz', params: { mode: 'daily' } })} />
      <T size={13} color={C.muted} style={{ textAlign: 'center', marginTop: -4 }}>◆ 隨機 {data.daily_goal} 題，同科的夥伴會一起追擊 ◆</T>

      {/* 兩條主線：地圖佔領收服、淨化野生魔物 */}
      {world ? (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <HallLink img={world.invaded ? WORLD_IMG.invade : WORLD_IMG.flag} title="世界地圖"
            detail={world.invaded ? `${world.invaded} 塊被入侵` : `已佔領 ${world.territories} 塊`} color={world.invaded ? C.red : C.accent}
            onPress={() => router.navigate('/map')} />
          <HallLink pal={wildPal} title="野生魔物"
            detail={world.wild_due ? `${world.wild_due} 隻今天可複習` : world.wild ? `${world.wild} 隻還沒淨化` : '目前沒有'} color={world.wild_due ? C.purple : C.green}
            onPress={() => (world.wild_due ? router.push({ pathname: '/quiz', params: { mode: 'review' } }) : router.push({ pathname: '/mistakes', params: { tab: 'wild' } }))} />
          <HallLink img={WORLD_IMG.coin} title="商店" detail={`${world.gold} 金幣`} color={C.gold} onPress={() => router.push('/shop')} />
        </View>
      ) : null}

      {quests ? <DailyQuests quests={quests} onClaimed={(qs, gold) => { setQuests(qs); setWorld((w) => (w ? { ...w, gold } : w)); }} /> : null}

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

    </Screen>
  );
}

/** 大廳的三個入口：世界地圖、野生魔物、商店 */
function HallLink({ img, pal, title, detail, color, onPress }: {
  img?: ImageSourcePropType; pal?: string; title: string; detail: string; color: string; onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${title}，${detail}`} onPress={onPress}
      style={({ pressed }) => ({ flex: 1, alignItems: 'center', gap: 2, paddingVertical: 10, borderRadius: 16, borderWidth: 1.5, borderColor: color,
        backgroundColor: C.card, opacity: pressed ? 0.85 : 1 })}>
      {pal ? <WildImage species={pal} size={42} /> : <Image source={img} accessibilityIgnoresInvertColors style={{ width: 40, height: 40 }} />}
      <T size={14} weight="700">{title}</T>
      <T size={11} color={C.muted}>{detail}</T>
    </Pressable>
  );
}

/** 大廳頂部的小狀態（體力、保護卡） */
function StatPill({ img, color, label, a11y, onPress }: {
  img: ImageSourcePropType; color: string; label: string; a11y: string; onPress?: () => void;
}) {
  return (
    <Pressable accessibilityRole={onPress ? 'button' : 'text'} accessibilityLabel={a11y} onPress={onPress} disabled={!onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 32, paddingHorizontal: 10, borderRadius: 999,
        backgroundColor: 'rgba(5, 10, 24, 0.78)', borderWidth: 1, borderColor: color }}>
      <Image source={img} accessibilityIgnoresInvertColors style={{ width: 20, height: 20 }} />
      <T size={12} weight="700" color="#FFFFFF">{label}</T>
    </Pressable>
  );
}
