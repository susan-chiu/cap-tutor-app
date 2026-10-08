// 訂閱到期日計算（不依賴 Deno，方便測試）
// 不直接相信 webhook 內容，一律向 RevenueCat 查詢該使用者目前的權益再計算。

export const ENTITLEMENT_ID = 'premium';
// 學期方案（非自動續訂）在 RevenueCat 沒有到期日，用購買日 + 183 天計算
export const SEMESTER_DAYS = 183;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(s: unknown): s is string {
  return typeof s === 'string' && UUID_RE.test(s);
}

interface EntitlementV1 {
  expires_date: string | null;
  purchase_date?: string | null;
  product_identifier?: string;
}

interface SubscriberResponseV1 {
  subscriber?: {
    entitlements?: Record<string, EntitlementV1>;
    non_subscriptions?: Record<string, { purchase_date: string }[]>;
  };
}

// 回傳 ISO 時間字串；沒有有效權益回傳 null
export function computeSubscriptionUntil(data: SubscriberResponseV1, now = new Date()): string | null {
  const ent = data.subscriber?.entitlements?.[ENTITLEMENT_ID];
  if (!ent) return null;
  let until: Date | null = null;
  if (ent.expires_date) {
    until = new Date(ent.expires_date);
  } else if (ent.purchase_date) {
    until = new Date(new Date(ent.purchase_date).getTime() + SEMESTER_DAYS * 86400_000);
  }
  if (!until || Number.isNaN(until.getTime()) || until <= now) return null;
  return until.toISOString();
}

// 從 webhook 事件中找出屬於我們系統的使用者 id（App 登入時用 Supabase 的使用者 id 呼叫 logIn）
export function userIdsFromEvent(event: Record<string, unknown>): string[] {
  const ids = new Set<string>();
  const add = (v: unknown) => { if (isUuid(v)) ids.add(v.toLowerCase()); };
  add(event.app_user_id);
  add(event.original_app_user_id);
  for (const key of ['aliases', 'transferred_from', 'transferred_to']) {
    const arr = event[key];
    if (Array.isArray(arr)) arr.forEach(add);
  }
  return [...ids];
}

// 固定時間比較，避免從回應時間猜出密鑰
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function fetchSubscriber(appUserId: string, secretKey: string, baseUrl = 'https://api.revenuecat.com'): Promise<SubscriberResponseV1> {
  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/v1/subscribers/${encodeURIComponent(appUserId)}`, {
    headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`revenuecat_${res.status}`);
  return await res.json();
}
