import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { Button, Card, ProgressBar, T } from '@/components/ui';
import { PalImage } from '@/components/world-fx';
import { api, errorText, type Pal, type WorldState } from '@/lib/api';
import { SUBJECT_FLOWER } from '@/lib/game';
import { play } from '@/lib/sound';
import { C, subjectLabel } from '@/lib/theme';
import { ALL_SPECIES, evolveProgress, PAL_STAGE, PAL_STAGE_COLOR, palName, palSkill, palSubject, toEvolve } from '@/lib/world';

/**
 * 夥伴：出戰隊伍（最多 3 隻）＋全部夥伴。
 * 點下面的夥伴加入隊伍，點隊伍裡的夥伴拿下來；第一隻是隊長（大廳站在勇者旁邊、星晶培養的對象）。
 */
export function PalsPanel({ world, subjects, onChange }: { world: WorldState; subjects: string[]; onChange: (w?: WorldState) => void }) {
  const [busy, setBusy] = useState(false);
  const mine = new Map(world.pals.map((p) => [p.species, p]));
  const team = world.team.filter((s) => mine.has(s));
  const species = ALL_SPECIES.filter((s) => subjects.includes(palSubject(s)));
  const captain = team[0] ? mine.get(team[0]) ?? null : null;

  async function save(next: string[]) {
    if (busy) return;
    setBusy(true);
    try { await api.setTeam(next); play('tap', 0.5); onChange(); }
    catch (e) { Alert.alert('隊伍沒有換成', errorText(e)); }
    finally { setBusy(false); }
  }

  function toggle(s: string) {
    if (team.includes(s)) { save(team.filter((x) => x !== s)); return; }
    if (team.length >= world.team_max) {
      Alert.alert('隊伍滿了', `隊伍最多 ${world.team_max} 隻。先點上面隊伍裡的一隻把牠換下來。`);
      return;
    }
    save([...team, s]);
  }

  async function feed(s: string) {
    if (busy) return;
    setBusy(true);
    try {
      const before = mine.get(s)?.stage ?? 1;
      const w = await api.feedPal(s);
      const after = w.pals.find((p) => p.species === s)?.stage ?? before;
      play(after > before ? 'evolve' : 'capture', 0.7);
      if (after > before) Alert.alert('進化了！', `${palName(s)}變成${PAL_STAGE[after]}了！`);
      onChange(w);
    } catch (e) { Alert.alert('培養不了', errorText(e)); }
    finally { setBusy(false); }
  }

  return (
    <View style={{ gap: 14 }}>
      <Card style={{ borderColor: C.gold, backgroundColor: '#0E1530', gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <T size={14} weight="700" color={C.gold}>◆ 出戰隊伍 {team.length}/{world.team_max}</T>
          <T size={12} color={C.muted}>同科的題目夥伴會追擊</T>
        </View>
        {team.length ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {Array.from({ length: world.team_max }, (_, i) => {
              const p = team[i] ? mine.get(team[i]) : null;
              return p ? (
                <Pressable key={p.species} accessibilityRole="button" disabled={busy}
                  accessibilityLabel={`${i === 0 ? '隊長' : '隊員'}${palName(p.species)}，點一下換下來`} onPress={() => toggle(p.species)}
                  style={{ flex: 1, alignItems: 'center', padding: 6, borderRadius: 14, borderWidth: i === 0 ? 2 : 1, borderColor: i === 0 ? C.gold : C.line, backgroundColor: C.bg }}>
                  <PalImage species={p.species} stage={p.stage} size={64} />
                  <T size={12} weight="700" numberOfLines={1}>{palName(p.species)}</T>
                  <T size={10} color={i === 0 ? C.gold : C.muted}>{i === 0 ? '隊長' : subjectLabel(palSubject(p.species)) + '系'}</T>
                </Pressable>
              ) : (
                <View key={`empty-${i}`} style={{ flex: 1, minHeight: 104, alignItems: 'center', justifyContent: 'center', borderRadius: 14, borderWidth: 1,
                  borderStyle: 'dashed', borderColor: C.lineStrong }}>
                  <T size={12} color={C.faint}>空位</T>
                </View>
              );
            })}
          </View>
        ) : world.pals.length ? (
          <T color={C.inkSoft}>隊伍是空的。點下面的夥伴，讓牠一起出戰。</T>
        ) : (
          <>
            <T color={C.inkSoft}>還沒有夥伴。去世界地圖打贏第一塊領地，或把一道錯題弄懂（淨化），就會有第一隻夥伴！</T>
            <Button title="去世界地圖" onPress={() => router.navigate('/map')} />
          </>
        )}
        {team.length ? (
          <View style={{ gap: 4 }}>
            {[...new Set(team.map(palSubject))].map((sub) => {
              const sk = palSkill(`${sub}-1`);
              return sk ? <T key={sub} size={12} color={C.inkSoft}><T size={12} weight="700" color={C.accentDark}>{subjectLabel(sub)}系「{sk.name}」</T>：{sk.desc}</T> : null;
            })}
          </View>
        ) : null}
        {captain ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 4, borderTopWidth: 1, borderTopColor: C.line }}>
            <View accessibilityLabel={`星晶 ${world.gems} 顆`} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="diamond" size={18} color="#7CF7FF" />
              <T weight="700" color="#7CF7FF">{world.gems}</T>
            </View>
            <T size={12} color={C.muted} style={{ flex: 1 }}>用星晶培養隊長 +{world.pal_xp.feed} 經驗（答對困難題會掉星晶，今天 {world.gems_today}/{world.gem_daily_max}）</T>
            <Button title={`培養 −${world.gem_feed_cost}`} kind="secondary" disabled={world.gems < world.gem_feed_cost || busy} onPress={() => feed(captain.species)} />
          </View>
        ) : null}
      </Card>

      <Card style={{ gap: 6 }}>
        <T size={14} weight="700">夥伴怎麼變強</T>
        <T size={13} color={C.inkSoft}>・在隊伍裡，答對同科的題目：每題 +{world.pal_xp.correct} 經驗</T>
        <T size={13} color={C.inkSoft}>・把錯題弄懂（淨化野生魔物）：那一種夥伴 +{world.pal_xp.purify} 經驗，沒有的話直接收服</T>
        <T size={13} color={C.inkSoft}>・打贏領地戰：那塊領地的夥伴 +{world.pal_xp.conquer} 經驗</T>
        <T size={12} color={C.muted}>經驗 {world.evolve[0]} 進化成體、{world.evolve[1]} 覺醒。</T>
      </Card>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <T size={17} weight="700">全部夥伴</T>
        <T size={13} color={C.muted}>已收服 {species.filter((s) => mine.has(s)).length} / {species.length} 種</T>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {species.map((s) => <PalTile key={s} species={s} pal={mine.get(s) ?? null} inTeam={team.includes(s)} evolve={world.evolve} busy={busy} onPress={() => toggle(s)} />)}
      </View>
    </View>
  );
}

function PalTile({ species, pal, inTeam, evolve, busy, onPress }: {
  species: string; pal: Pal | null; inTeam: boolean; evolve: number[]; busy: boolean; onPress: () => void;
}) {
  const left = pal ? toEvolve(pal, evolve) : null;
  return (
    <Pressable accessibilityRole="button" disabled={!pal || busy} onPress={onPress}
      accessibilityLabel={pal ? `${palName(species)}，${PAL_STAGE[pal.stage]}，經驗 ${pal.xp}${inTeam ? '，在隊伍裡，點一下換下來' : '，點一下加入隊伍'}`
        : `還沒收服的${subjectLabel(palSubject(species))}系夥伴`}
      style={{ width: '31%', flexGrow: 1, maxWidth: '32%', alignItems: 'center', gap: 3, paddingVertical: 8, paddingHorizontal: 6, borderRadius: 14,
        backgroundColor: C.card, borderWidth: inTeam ? 2 : 1, borderColor: inTeam ? C.gold : C.line }}>
      <PalImage species={species} stage={pal?.stage ?? 0} size={80} />
      <T size={13} weight="700" color={pal ? C.ink : C.faint}>{pal ? palName(species) : '？？？'}</T>
      <T size={11} color={pal ? PAL_STAGE_COLOR[pal.stage] : SUBJECT_FLOWER[palSubject(species)]}>
        {pal ? PAL_STAGE[pal.stage] : `${subjectLabel(palSubject(species))}系`}
      </T>
      {pal ? (
        <View style={{ alignSelf: 'stretch', gap: 2 }}>
          <ProgressBar value={evolveProgress(pal, evolve)} color={PAL_STAGE_COLOR[Math.min(pal.stage + 1, 3)]} height={5} />
          <T size={10} color={C.muted} style={{ textAlign: 'center' }}>{inTeam ? '出戰中' : left ? `再 ${left} 經驗進化` : '已覺醒'}</T>
        </View>
      ) : <T size={10} color={C.muted}>尚未收服</T>}
    </Pressable>
  );
}
