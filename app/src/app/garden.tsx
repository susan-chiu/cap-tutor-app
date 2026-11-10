import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, View } from 'react-native';

import { Plant } from '@/components/plant';
import { Card, Chip, ErrorBox, H1, Loading, ProgressBar, Screen, T } from '@/components/ui';
import { api, errorText, type GardenUnit } from '@/lib/api';
import { ITEM_IMG, SUBJECT_IMG } from '@/lib/art';
import { useAuth } from '@/lib/auth';
import { hardLeft, isGold, PLANT_STAGE_LABEL, plantStage, SUBJECT_FLOWER, toNextStage } from '@/lib/game';
import { goBack } from '@/lib/nav';
import { C, semesterLabel, subjectLabel, subjectsFor } from '@/lib/theme';

/** 學習花園：每個單元是一株植物，熟練越多長得越大，熟練 85% 開花。收集全部的花！ */
export default function Garden() {
  const { profile } = useAuth();
  const [units, setUnits] = useState<GardenUnit[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState<string>('all');
  const subjects = subjectsFor(profile?.grade);

  const load = useCallback(async () => {
    try { setError(null); setUnits(await api.garden()); } catch (e) { setError(errorText(e)); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const shown = useMemo(() => (units ?? []).filter((u) => subject === 'all' || u.subject === subject), [units, subject]);
  const bySemester = useMemo(() => {
    const m = new Map<string, GardenUnit[]>();
    for (const u of shown) m.set(u.semester, [...(m.get(u.semester) ?? []), u]);
    return [...m.entries()];
  }, [shown]);
  const bloomed = shown.filter((u) => plantStage(u) === 4).length;
  const growing = shown.filter((u) => { const s = plantStage(u); return s > 0 && s < 4; }).length;
  const gold = shown.filter(isGold).length;

  return (
    <Screen edges={['top', 'bottom']}>
      <Pressable accessibilityRole="button" accessibilityLabel="返回" onPress={() => goBack()}
        style={{ width: 44, height: 44, justifyContent: 'center' }}>
        <Ionicons name="chevron-back" size={26} color={C.ink} />
      </Pressable>
      <H1>學習花園</H1>
      <T color={C.muted}>每個單元是一株植物：開始練習就發芽，熟練越多長得越大，熟練 85% 就開花；開花後再把困難題全部弄懂，會變成金色稀有花。把整座花園種滿吧！</T>

      {error ? <ErrorBox message={error} onRetry={load} /> : !units ? <Loading /> : (
        <>
          <Card style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <View>
                <T size={13} color={C.muted}>已開花</T>
                <T size={28} weight="700">{bloomed} <T size={15} color={C.muted}>/ {shown.length} 株</T></T>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Image source={ITEM_IMG.goldFlower} accessibilityIgnoresInvertColors style={{ width: 22, height: 22 }} />
                  <T size={13} color={C.gold} weight="700">金色花 {gold} 朵</T>
                </View>
                <T size={13} color={C.muted}>成長中 {growing} 株</T>
              </View>
            </View>
            <ProgressBar value={shown.length ? bloomed / shown.length : 0} color={C.green} />
          </Card>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Chip label="全部" selected={subject === 'all'} onPress={() => setSubject('all')} />
            {subjects.map((s) => <Chip key={s.id} image={SUBJECT_IMG[s.id]} label={s.label} selected={subject === s.id} onPress={() => setSubject(s.id)} />)}
          </View>

          {bySemester.map(([sem, list]) => (
            <View key={sem} style={{ gap: 8 }}>
              <T weight="700" size={17}>{semesterLabel(sem)}</T>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {list.map((u) => <PlantTile key={u.unit_id} u={u} />)}
              </View>
            </View>
          ))}
        </>
      )}
    </Screen>
  );
}

function PlantTile({ u }: { u: GardenUnit }) {
  const stage = plantStage(u);
  const need = toNextStage(u);
  const gold = isGold(u);
  const hard = hardLeft(u);
  const name = u.title.includes('：') ? u.title.split('：').slice(1).join('：') : u.title;
  const label = `${subjectLabel(u.subject, u.semester)}・${u.title}，${PLANT_STAGE_LABEL[stage]}，熟練 ${u.mastered} / ${u.total} 題${stage < 4 ? `，再熟練 ${need} 題升級` : gold ? '，金色稀有花' : hard ? `，再弄懂 ${hard} 題困難題變金色花` : ''}`;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label}
      onPress={() => router.push({ pathname: '/quiz', params: { mode: 'unit', units: u.unit_id, title: u.title } })}
      style={({ pressed }) => ({
        width: '31%', minWidth: 100, flexGrow: 1, maxWidth: 160, padding: 8, gap: 4, alignItems: 'center',
        backgroundColor: gold ? C.goldSoft : stage === 4 ? C.greenSoft : C.card, borderRadius: 14, borderWidth: gold ? 2 : 1,
        borderColor: gold ? C.gold : stage === 4 ? C.mint : C.line, opacity: pressed ? 0.7 : 1,
      })}>
      <Plant stage={stage} subject={u.subject} size={100} gold={gold} />
      <T size={11} color={SUBJECT_FLOWER[u.subject] ?? C.muted} weight="700">{subjectLabel(u.subject, u.semester)}</T>
      <T size={12} weight="700" numberOfLines={2} style={{ textAlign: 'center', minHeight: 32 }}>{name}</T>
      <T size={11} color={gold ? C.gold : C.muted} weight={gold ? '700' : undefined}>
        {gold ? '金色稀有花 ✦' : stage < 4 ? `${PLANT_STAGE_LABEL[stage]} · 再 ${need} 題` : hard ? `開花 · 困難題再 ${hard} 題` : '開花 ✿'}
      </T>
    </Pressable>
  );
}
