// 模擬考進步曲線（簡單長條圖，不需要額外套件；學生端與家長端共用）
import { View } from 'react-native';

import { T } from '@/components/ui';
import type { MockExamRow } from '@/lib/api';
import { C } from '@/lib/theme';

export const EXAM_SUBJECT_LABEL: Record<string, string> = {
  math: '數學', chinese: '國文', english: '英語閱讀', english_listening: '英語聽力', science: '自然', social: '社會',
};

/** rows：新到舊（API 回傳的順序）；圖表由舊到新、最多顯示最近 10 次 */
export function ScoreChart({ rows, height = 120 }: { rows: MockExamRow[]; height?: number }) {
  const list = rows.slice(0, 10).reverse();
  if (list.length === 0) return null;
  const last = list[list.length - 1];
  const prev = list.length > 1 ? list[list.length - 2] : null;
  const best = Math.max(...list.map((r) => r.score));
  const avg = Math.round(list.reduce((s, r) => s + r.score, 0) / list.length);
  const diff = prev ? last.score - prev.score : null;

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
        <Stat label="最近一次" value={`${last.score}`} />
        <Stat label="最高" value={`${best}`} />
        <Stat label={`近 ${list.length} 次平均`} value={`${avg}`} />
        {diff !== null ? (
          <Stat label="比上一次" value={`${diff > 0 ? '+' : ''}${diff}`} color={diff >= 0 ? C.greenDark : C.red} />
        ) : null}
      </View>
      <View accessibilityLabel={`最近 ${list.length} 次模擬考分數：${list.map((r) => r.score).join('、')}`}
        style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: height + 36 }}>
        {list.map((r) => {
          const d = new Date(r.created_at);
          return (
            <View key={r.id} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
              <T size={11} weight="700" color={r.id === last.id ? C.accent : C.muted}>{r.score}</T>
              <View style={{
                width: '70%', maxWidth: 28, minHeight: 4, height: Math.max((r.score / 100) * height, 4), borderRadius: 6,
                backgroundColor: r.id === last.id ? C.accent : r.full_length ? C.green : '#B9D4CC',
              }} />
              <T size={10} color={C.faint}>{d.getMonth() + 1}/{d.getDate()}</T>
            </View>
          );
        })}
      </View>
      <T size={11} color={C.faint}>深綠色是完整長度、淺綠色是迷你模擬考；橘色是最近一次。</T>
    </View>
  );
}

function Stat({ label, value, color = C.ink }: { label: string; value: string; color?: string }) {
  return (
    <View>
      <T size={11} color={C.muted}>{label}</T>
      <T size={20} weight="700" color={color}>{value}</T>
    </View>
  );
}
