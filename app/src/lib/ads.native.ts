// 獎勵式廣告（Google AdMob）
// 設計原則：只在免費版、只有學生主動按「看廣告」才播放；非個人化廣告、普遍級內容。
// Expo Go 與網頁版沒有 AdMob 原生模組，這裡會自動停用，不會讓 App 當掉。
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import type * as GMA from 'react-native-google-mobile-ads';

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

function rewardedUnitId(m: AdsModule): string {
  const id = configuredUnitId();
  // 開發中或還沒申請廣告單元時，使用 Google 官方測試廣告
  return __DEV__ || !id ? m.TestIds.REWARDED : id;
}

function configuredUnitId(): string | undefined {
  return Platform.select({
    ios: process.env.EXPO_PUBLIC_ADMOB_REWARDED_IOS,
    android: process.env.EXPO_PUBLIC_ADMOB_REWARDED_ANDROID,
  });
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

// 播放一支獎勵式廣告；看完回傳 true，中途關閉回傳 false
export async function showRewardedAd(userId: string): Promise<boolean> {
  const m = load();
  if (!m) throw new Error('ads_unavailable');
  await initAds();
  const ad = m.RewardedAd.createForAdRequest(rewardedUnitId(m), {
    requestNonPersonalizedAdsOnly: true,
    serverSideVerificationOptions: { userId },
  });
  return new Promise<boolean>((resolve, reject) => {
    let earned = false;
    const unsubs = [
      ad.addAdEventListener(m.RewardedAdEventType.LOADED, () => { ad.show().catch(reject); }),
      ad.addAdEventListener(m.RewardedAdEventType.EARNED_REWARD, () => { earned = true; }),
      ad.addAdEventListener(m.AdEventType.CLOSED, () => { unsubs.forEach((u) => u()); resolve(earned); }),
      ad.addAdEventListener(m.AdEventType.ERROR, (e) => { unsubs.forEach((u) => u()); reject(e); }),
    ];
    ad.load();
  });
}
