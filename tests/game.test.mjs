// 遊戲化規則：等級、稱號、植物成長、Boss 星星、連擊提示
import assert from 'node:assert/strict';

import { bossStars, comboMessage, levelFor, levelInfo, plantStage, titleFor, toNextStage, xpForLevel } from '../app/src/lib/game.ts';

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ✓ ' + name); }
  catch (e) { process.exitCode = 1; console.log('  ✗ ' + name + '\n    ' + e.message); }
}

test('等級門檻和資料庫 xp_level 一致：Lv2 100、Lv3 300、Lv5 1000、Lv10 4500', () => {
  assert.deepEqual([0, 99, 100, 299, 300, 999, 1000, 4500].map(levelFor), [1, 1, 2, 2, 3, 4, 5, 10]);
  for (let L = 1; L <= 40; L++) {
    assert.equal(levelFor(xpForLevel(L)), L);
    assert.equal(levelFor(xpForLevel(L) - 1), Math.max(1, L - 1));
  }
});

test('升級進度與稱號', () => {
  const i = levelInfo(150);
  assert.deepEqual([i.level, i.current, i.next], [2, 50, 200]);
  assert.equal(i.progress, 0.25);
  assert.deepEqual([1, 3, 5, 12, 30, 99].map(titleFor), ['小種子', '發芽新手', '小樹苗', '含苞學者', '傳說花神', '傳說花神']);
});

test('學習花園：種子 → 發芽 → 長葉 → 花苞 → 開花，還差幾題升級', () => {
  const u = (mastered, attempted = mastered) => ({ total: 30, mastered, attempted });
  assert.deepEqual([u(0, 0), u(0, 3), u(7), u(8), u(17), u(25), u(26), u(30)].map(plantStage), [0, 1, 1, 2, 3, 3, 4, 4]);
  assert.equal(toNextStage(u(0, 0)), 1);
  assert.equal(toNextStage(u(3)), 5);     // 25% × 30 = 7.5 → 8
  assert.equal(toNextStage(u(8)), 9);     // 55% → 17
  assert.equal(toNextStage(u(30)), 0);
  assert.equal(plantStage({ total: 0, mastered: 0, attempted: 0 }), 0);
});

test('Boss 星星：9 成三顆、7 成兩顆、5 成一顆', () => {
  assert.deepEqual([[15, 15], [14, 15], [13, 15], [11, 15], [10, 15], [8, 15], [7, 15], [0, 0]].map(([c, t]) => bossStars(c, t)),
    [3, 3, 2, 2, 1, 1, 0, 0]);
});

test('連擊提示只在 3、5、10 與 20 以上出現', () => {
  assert.deepEqual([1, 2, 3, 4, 5, 9, 10, 11, 20, 25].map((n) => comboMessage(n) !== null),
    [false, false, true, false, true, false, true, false, true, true]);
});

console.log(`\n${passed} 項通過${process.exitCode ? '，有失敗項目' : ''}`);
