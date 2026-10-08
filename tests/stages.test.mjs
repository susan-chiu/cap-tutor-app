// 段考分階段邏輯測試：node stages.test.mjs
import assert from 'node:assert/strict';
import { currentStage, splitStages, stageStats } from '../app/src/lib/stages.ts';

const u = (id, o = {}) => ({ id, title: id, total: 20, mastered: 0, attempted: 0, answered: 0, correct: 0, ...o });
let passed = 0;
const test = (name, fn) => { try { fn(); passed++; console.log('  ✓ ' + name); } catch (e) { console.error('  ✗ ' + name + '\n    ' + e.message); process.exitCode = 1; } };

test('3～6 個單元依順序平均分成三次段考，最後是學期總複習', () => {
  for (const n of [3, 4, 5, 6]) {
    const st = splitStages(Array.from({ length: n }, (_, i) => u('U' + i)));
    assert.deepEqual(st.map((s) => s.key), ['exam1', 'exam2', 'exam3', 'final']);
    assert.deepEqual(st.slice(0, 3).flatMap((s) => s.units.map((x) => x.id)), Array.from({ length: n }, (_, i) => 'U' + i), '不重複、不遺漏、照順序');
    assert.ok(st.slice(0, 3).every((s) => s.units.length >= 1));
    assert.equal(st[3].units.length, n);
  }
});
test('2 個單元：第三次段考綜合複習；1 個單元只有總複習', () => {
  const two = splitStages([u('A'), u('B')]);
  assert.deepEqual(two.map((s) => s.units.map((x) => x.id).join('+')), ['A', 'B', 'A+B', 'A+B']);
  assert.ok(two[2].note);
  assert.deepEqual(splitStages([u('A')]).map((s) => s.key), ['final']);
  assert.deepEqual(splitStages([]), []);
});
test('進度、答對率、最需要加強的單元', () => {
  const s = stageStats([u('A', { mastered: 10, attempted: 12, answered: 10, correct: 9 }), u('B', { mastered: 2, attempted: 5, answered: 5, correct: 2 }), u('C', { answered: 2, correct: 0, attempted: 2 })]);
  assert.equal(s.progress, 12 / 60);
  assert.equal(s.accuracy, 11 / 17);
  assert.equal(s.status, 'doing');
  assert.deepEqual(s.weakest, { title: 'B', accuracy: 0.4 }, '作答少於 3 次的不算');
  assert.equal(stageStats([u('A')]).status, 'todo');
  assert.equal(stageStats([u('A', { mastered: 17, attempted: 17 })]).status, 'done');
});
test('目前階段 = 第一個還沒完成的段考', () => {
  const st = splitStages([u('A', { mastered: 18, attempted: 18 }), u('B'), u('C')]);
  assert.equal(currentStage(st).key, 'exam2');
});
console.log(`\n${passed} 項通過${process.exitCode ? '，有失敗項目' : ''}`);
