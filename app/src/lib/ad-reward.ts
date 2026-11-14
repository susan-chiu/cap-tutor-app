import { Alert } from 'react-native';

import { adsAvailable, preloadRewardedAd, showRewardedAd } from '@/lib/ads';
import { api, errorText, type AdPlacement, type AdReward } from '@/lib/api';

/** 進到可能會看廣告的畫面時先呼叫，廣告在背景載好，按下去立刻播 */
export function preloadAds(userId: string | undefined, placements: AdPlacement[]) {
  if (!userId || !adsAvailable()) return;
  placements.forEach((p) => preloadRewardedAd(p, userId));
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * 看一支獎勵式廣告，看完由伺服器發獎勵。
 * 位置：energy（今天多幾題）、xp2x（這一輪的 XP 再給一次）、tutor（多 1 次小老師）。
 * 伺服器有開「廣告驗證」時，AdMob 的通知可能比 App 慢一兩秒到，所以會重試幾次。
 * 回傳 null 代表沒看完或失敗（已經用 Alert 告訴學生）。
 */
export async function watchAdFor(placement: AdPlacement, userId: string): Promise<AdReward | null> {
  if (!adsAvailable()) return null;
  try {
    const earned = await showRewardedAd(placement, userId);
    if (!earned) { Alert.alert('廣告沒有看完', '要看完整支廣告才有獎勵喔。'); return null; }
    for (let i = 0; ; i++) {
      try {
        return await api.grantAdReward(placement);
      } catch (e) {
        if (e instanceof Error && e.message === 'ad_not_verified' && i < 4) { await sleep(1500); continue; }
        throw e;
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : '';
    Alert.alert('無法播放廣告', msg.startsWith('ad_') || msg === 'already_premium' ? errorText(e) : '目前沒有可播放的廣告，請稍後再試。');
    return null;
  }
}
