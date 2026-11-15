import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { Button, Card, ErrorBox, H1, Loading, ProgressBar, Screen, T } from '@/components/ui';
import { PalImage } from '@/components/world-fx';
import { api, errorText, type Pal, type WorldState } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { SUBJECT_FLOWER } from '@/lib/game';
import { goBack } from '@/lib/nav';
import { play } from '@/lib/sound';
import { C, subjectLabel, subjectsFor } from '@/lib/theme';
import { ALL_SPECIES, PAL_STAGE, PAL_STAGE_COLOR, palName, palSubject, toEvolve } from '@/lib/world';

/** 魔物夥伴：在世界地圖打贏領地戰就能收服；同一種收服越多次就進化 */
export default function Pals() {
  const { profile } = useAuth();
  const [world, setWorld] = useState<WorldState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try { setError(null); setWorld(await api.worldState()); } catch (e) { setError(errorText(e)); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function pick(species: string) {
    if (busy) return;
    setBusy(species);
    try { await api.setTeamPal(species); play('tap', 0.5); await load(); }
    catch (e) { Alert.alert('換不了夥伴', errorText(e)); }
    finally { setBusy(null); }
  }

  const subjects = subjectsFor(profile?.grade).map((s) => s.id as string);
  const species = ALL_SPECIES.filter((s) => subjects.includes(palSubject(s)));
  const mine = new Map((world?.pals ?? []).map((p) => [p.species, p]));
  const team = world?.team_pal ? mine.get(world.team_pal) ?? null : null;

  return (
    <Screen edges={['top', 'bottom']}>
      <Pressable accessibilityRole="button" accessibilityLabel="返回" onPress={() => goBack()}
        style={{ width: 44, height: 44, justifyContent: 'center' }}>
        <Ionicons name="chevron-back" size={26} color={C.ink} />
      </Pressable>
      <H1>魔物夥伴</H1>
      <T color={C.muted}>在世界地圖打贏領地戰，就能把那裡的魔物收服成夥伴。同一種收服 {world?.evolve[0] ?? 3} 次進化成體、{world?.evolve[1] ?? 6} 次覺醒。</T>

      {error ? <ErrorBox message={error} onRetry={load} /> : !world ? <Loading /> : (
        <>
          <Card style={{ borderColor: C.gold, backgroundColor: '#0E1530', gap: 10 }}>
            <T size={13} weight="700" color={C.gold}>◆ 出戰夥伴（會跟在勇者旁邊）</T>
            {team ? <TeamRow pal={team} evolve={world.evolve} /> : (
              <>
                <T color={C.inkSoft}>還沒有夥伴。去世界地圖出征，打贏第一塊領地就會有第一隻夥伴！</T>
                <Button title="去世界地圖" onPress={() => router.replace('/map')} />
              </>
            )}
          </Card>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <T size={17} weight="700">夥伴圖鑑</T>
            <T size={13} color={C.muted}>已收服 {species.filter((s) => mine.has(s)).length} / {species.length} 種</T>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {species.map((s) => {
              const p = mine.get(s);
              const isTeam = world.team_pal === s;
              const left = p ? toEvolve(p, world.evolve) : null;
              return (
                <Pressable key={s} accessibilityRole="button" disabled={!p || isTeam || !!busy} onPress={() => pick(s)}
                  accessibilityLabel={p ? `${palName(s)}，${PAL_STAGE[p.stage]}，收服 ${p.caught} 次${isTeam ? '，出戰中' : '，點一下設為出戰夥伴'}` : `還沒收服的${subjectLabel(palSubject(s))}系夥伴`}
                  style={{ width: '31%', flexGrow: 1, maxWidth: '32%', alignItems: 'center', gap: 2, paddingVertical: 8, paddingHorizontal: 4, borderRadius: 14,
                    backgroundColor: C.card, borderWidth: isTeam ? 2 : 1, borderColor: isTeam ? C.gold : C.line, opacity: busy === s ? 0.6 : 1 }}>
                  <PalImage species={s} stage={p?.stage ?? 0} size={84} />
                  <T size={13} weight="700" color={p ? C.ink : C.faint}>{p ? palName(s) : '？？？'}</T>
                  <T size={11} color={p ? PAL_STAGE_COLOR[p.stage] : SUBJECT_FLOWER[palSubject(s)]}>
                    {p ? `${PAL_STAGE[p.stage]}・×${p.caught}` : `${subjectLabel(palSubject(s))}系`}
                  </T>
                  <T size={10} color={C.muted}>{!p ? '尚未收服' : isTeam ? '出戰中' : left ? `再 ${left} 次進化` : '已覺醒'}</T>
                </Pressable>
              );
            })}
          </View>
          <T size={12} color={C.muted} style={{ textAlign: 'center' }}>點已收服的夥伴，可以換成出戰夥伴。成體與覺醒的新造型製作中，目前先以光環表示。</T>
        </>
      )}
    </Screen>
  );
}

function TeamRow({ pal, evolve }: { pal: Pal; evolve: number[] }) {
  const left = toEvolve(pal, evolve);
  const goal = pal.stage <= 1 ? evolve[0] : evolve[1];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <PalImage species={pal.species} stage={pal.stage} size={96} />
      <View style={{ flex: 1, gap: 4 }}>
        <T size={18} weight="700">{palName(pal.species)}</T>
        <T size={13} color={PAL_STAGE_COLOR[pal.stage]}>{subjectLabel(palSubject(pal.species))}系・{PAL_STAGE[pal.stage]}</T>
        <ProgressBar value={left ? pal.caught / goal : 1} color={C.gold} />
        <T size={12} color={C.muted}>{left ? `已收服 ${pal.caught} 次，再 ${left} 次就進化` : `已收服 ${pal.caught} 次，已經覺醒`}</T>
      </View>
    </View>
  );
}
