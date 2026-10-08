// 訂閱收費（RevenueCat）
// Expo Go 中 SDK 會自動進入「預覽模式」不會真的扣款；真正購買要用開發版或正式版 App 測試。
import { Platform } from 'react-native';
import Purchases, { type PurchasesPackage } from 'react-native-purchases';

import { supabase } from './supabase';

const API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
});

export const purchasesEnabled = Platform.OS !== 'web' && !!API_KEY;
let configured = false;

export function initPurchases() {
  if (!purchasesEnabled || configured) return;
  Purchases.configure({ apiKey: API_KEY! });
  configured = true;
}

// 讓 RevenueCat 的使用者 id = Supabase 的使用者 id，伺服器才對得上
export async function identifyPurchaser(userId: string | null) {
  if (!purchasesEnabled) return;
  initPurchases();
  try {
    if (userId) await Purchases.logIn(userId);
    else if (!(await Purchases.isAnonymous())) await Purchases.logOut();
  } catch (e) {
    console.warn('RevenueCat identify failed', e);
  }
}

export interface Plan {
  id: string;
  title: string;
  price: string;
  period: string;
  /** 首期優惠（免費試用或優惠價），例如「前 7 天免費」 */
  intro: string | null;
  pkg: PurchasesPackage;
}

const UNIT_LABEL: Record<string, string> = { DAY: '天', WEEK: '週', MONTH: '個月', YEAR: '年' };

const PERIOD_LABEL: Record<string, string> = {
  MONTHLY: '每月自動續訂',
  ANNUAL: '每年自動續訂',
  SIX_MONTH: '每 6 個月自動續訂',
  LIFETIME: '一次購買',
};

export async function getPlans(): Promise<Plan[]> {
  if (!purchasesEnabled) return [];
  initPurchases();
  const offerings = await Purchases.getOfferings();
  const pkgs = offerings.current?.availablePackages ?? [];
  return pkgs.map((p) => ({
    id: p.identifier,
    title: p.product.title.replace(/\s*\(.*\)\s*$/, ''),
    price: p.product.priceString,
    period: PERIOD_LABEL[p.packageType]
      ?? (p.product.identifier.includes('semester') ? '一學期（183 天），不自動續訂' : '一次購買，不自動續訂'),
    intro: p.product.introPrice
      ? `${p.product.introPrice.price === 0 ? '免費試用' : `優惠價 ${p.product.introPrice.priceString}`}：前 ${p.product.introPrice.periodNumberOfUnits * Math.max(p.product.introPrice.cycles, 1)} ${UNIT_LABEL[p.product.introPrice.periodUnit] ?? ''}，之後 ${p.product.priceString}`
      : null,
    pkg: p,
  }));
}

// 通知伺服器向 RevenueCat 查證並更新完整版到期日（失敗會自動重試幾次）
async function syncWithServer(retries = 3) {
  for (let i = 0; ; i++) {
    const { error } = await supabase.functions.invoke('sync-subscription', { body: {} });
    if (!error) return;
    if (i >= retries) throw new Error('sync_failed');
    await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
  }
}

/** 付款已成功、但開通還沒同步完成（稍後按「恢復購買」即可） */
export type BuyResult = 'purchased' | 'purchased_unsynced' | 'cancelled';

export async function buy(plan: Plan): Promise<BuyResult> {
  try {
    await Purchases.purchasePackage(plan.pkg);
  } catch (e) {
    if ((e as { userCancelled?: boolean }).userCancelled) return 'cancelled';
    throw e;
  }
  // 走到這裡代表商店已經扣款成功；同步失敗不能說成「購買失敗」
  try { await syncWithServer(); } catch { return 'purchased_unsynced'; }
  return 'purchased';
}

export async function restore(): Promise<boolean> {
  const info = await Purchases.restorePurchases();
  await syncWithServer();
  return !!info.entitlements.active['premium'];
}
