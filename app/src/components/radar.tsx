import { View } from 'react-native';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';

import { T } from '@/components/ui';
import { C } from '@/lib/theme';

/** 雷達圖：各科「防禦力」（答對率 0～1）。沒有作答的科目顯示 0，標籤加註「未練」。 */
export function Radar({ items, size = 300 }: { items: { label: string; value: number | null }[]; size?: number }) {
  const n = items.length;
  if (n < 3) return null;
  // 外圈留給「科目 百分比」標籤，左右兩側的字才不會被切掉
  const cx = size / 2, cy = size / 2, r = size / 2 - 72;
  const pt = (i: number, k: number) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
    return [cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k] as const;
  };
  const ring = (k: number) => items.map((_, i) => pt(i, k).join(',')).join(' ');
  const shape = items.map((it, i) => pt(i, Math.max(0.04, it.value ?? 0)).join(',')).join(' ');
  const desc = items.map((it) => `${it.label} ${it.value === null ? '還沒練' : `${Math.round(it.value * 100)}%`}`).join('、');
  return (
    <View accessible accessibilityLabel={`各科防禦力：${desc}`} style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        {[0.25, 0.5, 0.75, 1].map((k) => <Polygon key={k} points={ring(k)} fill="none" stroke={C.line} strokeWidth={1} />)}
        {items.map((_, i) => { const [x, y] = pt(i, 1); return <Line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={C.line} strokeWidth={1} />; })}
        <Polygon points={shape} fill="rgba(0, 240, 255, 0.25)" stroke={C.accent} strokeWidth={2} />
        {items.map((it, i) => { const [x, y] = pt(i, Math.max(0.04, it.value ?? 0)); return <Circle key={i} cx={x} cy={y} r={4} fill={C.accent} />; })}
        {items.map((it, i) => {
          const [ox, oy] = pt(i, 1);
          // 左側的字往左排、右側的字往右排，避開頂點；上下的置中
          const side = ox < cx - 8 ? 'end' : ox > cx + 8 ? 'start' : 'middle';
          const x = ox + (side === 'end' ? -10 : side === 'start' ? 10 : 0);
          const y = oy + (side === 'middle' ? (oy < cy ? -12 : 20) : oy > cy ? 16 : 5);
          return (
            <SvgText key={it.label} x={x} y={y} fill={it.value === null ? C.faint : C.ink} fontSize={13} fontWeight="700" textAnchor={side}>
              {`${it.label} ${it.value === null ? '未練' : `${Math.round(it.value * 100)}%`}`}
            </SvgText>
          );
        })}
      </Svg>
      <T size={12} color={C.muted}>外圈＝100% 答對，越大越強</T>
    </View>
  );
}
