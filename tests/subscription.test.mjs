// 訂閱到期日計算測試：node subscription.test.mjs
import assert from 'node:assert/strict';
import {
  computeSubscriptionUntil, isUuid, safeEqual, userIdsFromEvent, SEMESTER_DAYS,
} from '../supabase/functions/_shared/subscription.ts';

let passed = 0;
const test = (name, fn) => {
  try { fn(); passed++; console.log('  ✓ ' + name); }
  catch (e) { console.error('  ✗ ' + name + '\n    ' + e.message); process.exitCode = 1; }
};
const now = new Date('2026-10-01T00:00:00Z');

console.log('訂閱邏輯測試');

test('自動續訂：使用 RevenueCat 的到期日', () => {
  const r = computeSubscriptionUntil({ subscriber: { entitlements: { premium: { expires_date: '2026-11-01T00:00:00Z', product_identifier: 'monthly' } } } }, now);
  assert.equal(r, '2026-11-01T00:00:00.000Z');
});

test('已過期：回傳 null（恢復免費版）', () => {
  const r = computeSubscriptionUntil({ subscriber: { entitlements: { premium: { expires_date: '2026-09-01T00:00:00Z' } } } }, now);
  assert.equal(r, null);
});

test('學期方案（沒有到期日）：購買日 + 183 天', () => {
  const r = computeSubscriptionUntil({ subscriber: { entitlements: { premium: { expires_date: null, purchase_date: '2026-09-15T00:00:00Z' } } } }, now);
  assert.equal(r, new Date(Date.parse('2026-09-15T00:00:00Z') + SEMESTER_DAYS * 86400000).toISOString());
});

test('學期方案超過 183 天：過期', () => {
  const r = computeSubscriptionUntil({ subscriber: { entitlements: { premium: { expires_date: null, purchase_date: '2026-01-01T00:00:00Z' } } } }, now);
  assert.equal(r, null);
});

test('沒有 premium 權益或資料格式不對：null', () => {
  assert.equal(computeSubscriptionUntil({ subscriber: { entitlements: { other: { expires_date: '2027-01-01T00:00:00Z' } } } }, now), null);
  assert.equal(computeSubscriptionUntil({}, now), null);
});

test('從 webhook 事件取出使用者 id（含別名、忽略匿名 id）', () => {
  const ids = userIdsFromEvent({
    app_user_id: '$RCAnonymousID:abc',
    original_app_user_id: '11111111-1111-1111-1111-111111111111',
    aliases: ['22222222-2222-2222-2222-222222222222', '$RCAnonymousID:xyz'],
    transferred_to: ['33333333-3333-3333-3333-333333333333'],
  });
  assert.deepEqual(ids.sort(), [
    '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333',
  ]);
  assert.ok(!isUuid('$RCAnonymousID:abc'));
});

test('Webhook 密鑰比對', () => {
  assert.ok(safeEqual('Bearer abc', 'Bearer abc'));
  assert.ok(!safeEqual('Bearer abc', 'Bearer abd'));
  assert.ok(!safeEqual('abc', 'abcd'));
});

console.log(`\n${passed} 項通過${process.exitCode ? '，有失敗項目' : ''}`);
