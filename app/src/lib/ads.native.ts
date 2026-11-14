// 獎勵式廣告（Google AdMob）
// 設計原則：只在免費版、只有學生主動按「看廣告」才播放；非個人化廣告、普遍級內容。
// Expo Go 與網頁版沒有 AdMob 原生模組，這裡會自動停用，不會讓 App 當掉。
//
// 三個位置各用一個廣告單元（AdMob 報表才看得出哪個位置賺最多）；沒設定的位置退回共用的單元。
// 進副本、開小老師時先在背景預載（preloadRewardedAd），按下去就能立刻播放。
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import type * as GMA from 'react-native-google-mobile-ads';

import type { AdPlacement } from '@/lib/api';

type AdsModule = typeof GMA;

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
let mod: AdsModule | null = null;
let initPromise: Promise<void> | null = null;

function load(): AdsModule | null {
  if (mod) return mod;
  if (Platform.OS === 'web' || isExpoGo) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    mod = require('react-native-google-mobile-ads') as AdsModule;
  } catch {
    mod = null;
  }
  return mod;
}

const UNIT_ENV: Record<AdPlacement, { ios?: string; android?: string }> = {
  energy: { ios: process.env.EXPO_PUBLIC_ADMOB_REWARDED_IOS_ENERGY, android: process.env.EXPO_PUBLIC_ADMOB_REWARDED_ANDROID_ENERGY },
  xp2x: { ios: process.env.EXPO_PUBLIC_ADMOB_REWARDED_IOS_XP2X, android: process.env.EXPO_PUBLIC_ADMOB_REWARDED_ANDROID_XP2X },
  tutor: { ios: process.env.EXPO_PUBLIC_ADMOB_REWARDED_IOS_TUTOR, android: process.env.EXPO_PUBLIC_ADMOB_REWARDED_ANDROID_TUTOR },
};

// 共用的廣告單元（舊設定），沒有為某個位置另外設定時用這個
function configuredUnitId(placement?: AdPlacement): string | undefined {
  const own = placement ? Platform.select(UNIT_ENV[placement]) : undefined;
  return own || Platform.select({
    ios: process.env.EXPO_PUBLIC_ADMOB_REWARDED_IOS,
    android: process.env.EXPO_PUBLIC_ADMOB_REWARDED_ANDROID,
  });
}

function rewardedUnitId(m: AdsModule, placement: AdPlacement): string {
  const id = configuredUnitId(placement);
  // 開發中或還沒申請廣告單元時，使用 Google 官方測試廣告
  return __DEV__ || !id ? m.TestIds.REWARDED : id;
}

// 正式版沒有設定廣告單元時不顯示廣告按鈕（避免上架後播放測試廣告）
export function adsAvailable(): boolean {
  return load() !== null && (__DEV__ || !!configuredUnitId());
}

export function initAds(): Promise<void> {
  const m = load();
  if (!m) return Promise.resolve();
  if (!initPromise) {
    initPromise = (async () => {
      await m.default().setRequestConfiguration({
        maxAdContentRating: m.MaxAdContentRating.G,   // 只顯示普遍級廣告
        tagForUnderAgeOfConsent: true,                // 使用者可能未成年
        tagForChildDirectedTreatment: true,          // Google Play 家庭政策：國中生含 12 歲，全部用兒童導向設定
      });
      await m.default().initialize();
    })().catch((e) => { console.warn('AdMob init failed', e); });
  }
  return initPromise;
}

// ---- 預載 ----
// AdMob 的廣告載入後約 1 小時失效，超過就重新載
const AD_TTL_MS = 50 * 60 * 1000;

type Loaded = { ad: GMA.RewardedAd; userId: string; loadedAt: number; ready: boolean; failed: boolean; waiters: ((ok: boolean) => void)[] };
const cache: Partial<Record<AdPlacement, Loaded>> = {};

function createAd(m: AdsModule, placement: AdPlacement, userId: string): Loaded {
  const ad = m.RewardedAd.createForAdRequest(rewardedUnitId(m, placement), {
    requestNonPersonalizedAdsOnly: true,
    // 伺服器驗證：AdMob 看完後會通知我們的伺服器，customData 帶位置名稱
    serverSideVerificationOptions: { userId, customData: placement },
  });
  const entry: Loaded = { ad, userId, loadedAt: 0, ready: false, failed: false, waiters: [] };
  const settle = (ok: boolean) => { entry.ready = ok; entry.failed = !ok; entry.loadedAt = Date.now(); entry.waiters.splice(0).forEach((w) => w(ok)); };
  const unsubLoaded = ad.addAdEventListener(m.RewardedAdEventType.LOADED, () => { unsubLoaded(); unsubErr(); settle(true); });
  const unsubErr = ad.addAdEventListener(m.AdEventType.ERROR, () => { unsubLoaded(); unsubErr(); settle(false); });
  ad.load();
  return entry;
}

/** 先把某個位置的廣告載好。可以多次呼叫，已經載好或正在載就不會重複。 */
export function preloadRewardedAd(placement: AdPlacement, userId: string): void {
  const m = load();
  if (!m || !adsAvailable()) return;
  const cur = cache[placement];
  const stale = cur && (cur.failed || cur.userId !== userId || (cur.ready && Date.now() - cur.loadedAt > AD_TTL_MS));
  if (cur && !stale) return;
  initAds().then(() => { cache[placement] = createAd(m, placement, userId); }).catch(() => {});
}

function waitLoaded(entry: Loaded): Promise<boolean> {
  if (entry.ready || entry.failed) return Promise.resolve(entry.ready);
  return new Promise((resolve) => entry.waiters.push(resolve));
}

/** 播放一支獎勵式廣告；看完回傳 true，中途關閉回傳 false。沒有預載時會先載再播。 */
export async function showRewardedAd(placement: AdPlacement, userId: string): Promise<boolean> {
  const m = load();
  if (!m) throw new Error('ads_unavailable');
  await initAds();
  let entry = cache[placement];
  if (!entry || entry.userId !== userId || entry.failed || (entry.ready && Date.now() - entry.loadedAt > AD_TTL_MS)) {
    entry = createAd(m, placement, userId);
    cache[placement] = entry;
  }
  const ok = await waitLoaded(entry);
  delete cache[placement];
  if (!ok) throw new Error('ad_load_failed');
  const ad = entry.ad;
  const result = await new Promise<boolean>((resolve, reject) => {
    let earned = false;
    const unsubs = [
      ad.addAdEventListener(m.RewardedAdEventType.EARNED_REWARD, () => { earned = true; }),
      ad.addAdEventListener(m.AdEventType.CLOSED, () => { unsubs.forEach((u) => u()); resolve(earned); }),
      ad.addAdEventListener(m.AdEventType.ERROR, (e) => { unsubs.forEach((u) => u()); reject(e); }),
    ];
    ad.show().catch(reject);
  });
  // 看完就先載下一支，同一個位置再按時不用等
  preloadRewardedAd(placement, userId);
  return result;
}
