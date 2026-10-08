// 英語聽力：用手機內建語音朗讀聽力原文（M: 男聲、W: 女聲、N: 旁白），作答後才顯示原文
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';

import { T } from '@/components/ui';
import { C } from '@/lib/theme';

interface Line { who: 'M' | 'W' | 'N'; text: string }

export function parseScript(script: string): Line[] {
  return script.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
    const m = /^(M|W|N):\s*(.*)$/.exec(l);
    return m ? { who: m[1] as Line['who'], text: m[2] } : { who: 'N' as const, text: l };
  });
}

const PITCH: Record<Line['who'], number> = { M: 0.8, W: 1.25, N: 1.0 };
const LABEL: Record<Line['who'], string> = { M: '男', W: '女', N: '旁白' };

export function ListenPlayer({ script, revealed }: { script: string; revealed: boolean }) {
  const lines = parseScript(script);
  const [playing, setPlaying] = useState(false);
  const [plays, setPlays] = useState(0);
  const token = useRef(0);

  // 離開這一題時停止朗讀
  useEffect(() => () => { token.current += 1; Speech.stop(); }, []);

  function play(slow: boolean) {
    const my = ++token.current;
    Speech.stop();
    setPlaying(true);
    setPlays((n) => n + 1);
    const say = (i: number) => {
      if (my !== token.current) return;
      if (i >= lines.length) { setPlaying(false); return; }
      Speech.speak(lines[i].text, {
        language: 'en-US',
        pitch: PITCH[lines[i].who],
        rate: slow ? 0.7 : 0.92,
        onDone: () => { setTimeout(() => say(i + 1), 350); },   // 換人說話時停頓一下
        onStopped: () => { if (my === token.current) setPlaying(false); },
        onError: () => { if (my === token.current) setPlaying(false); },
      });
    };
    say(0);
  }

  function stop() {
    token.current += 1;
    Speech.stop();
    setPlaying(false);
  }

  return (
    <View style={{ gap: 10, backgroundColor: '#EEF4F2', borderRadius: 14, padding: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ionicons name="headset-outline" size={20} color={C.greenDark} />
        <T size={14} weight="700" color={C.greenDark} style={{ flex: 1 }}>英語聽力{plays ? `・已播放 ${plays} 次` : ''}</T>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {playing ? (
          <ListenButton icon="stop" label="停止" onPress={stop} />
        ) : (
          <>
            <ListenButton icon="play" label={plays ? '再聽一次' : '播放'} onPress={() => play(false)} primary />
            <ListenButton icon="play-skip-forward-outline" label="慢速播放" onPress={() => play(true)} />
          </>
        )}
      </View>
      {revealed ? (
        <View style={{ gap: 4, borderTopWidth: 1, borderTopColor: C.line, paddingTop: 8 }}>
          <T size={12} weight="700" color={C.muted}>聽力原文</T>
          {lines.map((l, i) => (
            <T key={i} size={14} color={C.inkSoft}>{l.who === 'N' ? '' : `（${LABEL[l.who]}）`}{l.text}</T>
          ))}
        </View>
      ) : (
        <T size={12} color={C.muted}>會考聽力每題播放 2 次，建議先聽 2 次再作答。作答後會顯示聽力原文。</T>
      )}
    </View>
  );
}

function ListenButton({ icon, label, onPress, primary }: {
  icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; primary?: boolean;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
      style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, borderRadius: 999,
        backgroundColor: primary ? C.green : '#FFFFFF', borderWidth: primary ? 0 : 1, borderColor: C.green }}>
      <Ionicons name={icon} size={18} color={primary ? '#FFFFFF' : C.green} />
      <T size={15} weight="700" color={primary ? '#FFFFFF' : C.green}>{label}</T>
    </Pressable>
  );
}
