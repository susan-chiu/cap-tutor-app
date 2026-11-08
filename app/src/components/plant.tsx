import { View } from 'react-native';

import type { PlantStage } from '@/lib/game';

const LEAF = '#4E9F5B';
const STEM = '#3F7F4A';
const POT = '#C9763F';
const POT_RIM = '#A85E2F';
const SOIL = '#6B4A32';

/** 學習花園的一株植物（用方塊與圓角畫成，不需要圖片）：種子 → 發芽 → 長葉 → 花苞 → 開花 */
export function Plant({ stage, color, size = 64, gold = false }: { stage: PlantStage; color: string; size?: number; gold?: boolean }) {
  const u = size / 64; // 以 64 為基準等比例縮放
  const stem = [0, 10, 20, 24, 26][stage] * u;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'flex-end' }}
      accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {/* 花或花苞 */}
      {stage === 4 ? (
        <View style={{ width: 26 * u, height: 26 * u, marginBottom: -3 * u, alignItems: 'center', justifyContent: 'center' }}>
          {gold ? <View style={{ position: 'absolute', width: 34 * u, height: 34 * u, borderRadius: 17 * u, backgroundColor: '#FFE9A8', opacity: 0.8 }} /> : null}
          {(gold ? [0, 45, 90, 135, 180, 225, 270, 315] : [0, 72, 144, 216, 288]).map((deg) => (
            <View key={deg} style={{
              position: 'absolute', width: 11 * u, height: 11 * u, borderRadius: 6 * u, backgroundColor: gold ? '#E8B923' : color,
              borderWidth: gold ? 1 * u : 0, borderColor: '#B8860B',
              transform: [{ rotate: `${deg}deg` }, { translateY: -7 * u }],
            }} />
          ))}
          <View style={{ width: 9 * u, height: 9 * u, borderRadius: 5 * u, backgroundColor: gold ? '#FFF6D5' : '#F7D154' }} />
        </View>
      ) : stage === 3 ? (
        <View style={{ width: 10 * u, height: 14 * u, borderRadius: 6 * u, backgroundColor: color, marginBottom: -2 * u }} />
      ) : null}
      {/* 莖與葉子 */}
      {stage >= 1 ? (
        <View style={{ alignItems: 'center' }}>
          <View style={{ width: 3 * u, height: stem, backgroundColor: STEM, borderRadius: 2 * u }} />
          <Leaf u={u} side="left" bottom={stage === 1 ? 2 : 4} small={stage === 1} />
          <Leaf u={u} side="right" bottom={stage === 1 ? 2 : 4} small={stage === 1} />
          {stage >= 2 ? <><Leaf u={u} side="left" bottom={13} /><Leaf u={u} side="right" bottom={13} /></> : null}
        </View>
      ) : (
        <View style={{ width: 8 * u, height: 6 * u, borderRadius: 4 * u, backgroundColor: '#8B5E3C', marginBottom: -2 * u, zIndex: 1 }} />
      )}
      {/* 花盆 */}
      <View style={{ width: 34 * u, height: 4 * u, borderRadius: 2 * u, backgroundColor: SOIL }} />
      <View style={{ width: 38 * u, height: 5 * u, borderRadius: 2 * u, backgroundColor: POT_RIM }} />
      <View style={{ width: 30 * u, height: 14 * u, backgroundColor: POT, borderBottomLeftRadius: 6 * u, borderBottomRightRadius: 6 * u }} />
    </View>
  );
}

function Leaf({ u, side, bottom, small }: { u: number; side: 'left' | 'right'; bottom: number; small?: boolean }) {
  const w = (small ? 8 : 12) * u;
  return (
    <View style={{
      position: 'absolute', bottom: bottom * u, [side === 'left' ? 'right' : 'left']: 1 * u,
      width: w, height: w * 0.55, backgroundColor: LEAF,
      borderTopLeftRadius: side === 'left' ? w : 1, borderBottomRightRadius: side === 'left' ? w : 1,
      borderTopRightRadius: side === 'right' ? w : 1, borderBottomLeftRadius: side === 'right' ? w : 1,
    }} />
  );
}
