// 網頁版沒有 AdMob：提供同樣的函式但不做事（手機版實作在 ads.native.ts）
import type { AdPlacement } from '@/lib/api';

export function adsAvailable(): boolean {
  return false;
}

export function initAds(): Promise<void> {
  return Promise.resolve();
}

export function preloadRewardedAd(_placement: AdPlacement, _userId: string): void {}

export async function showRewardedAd(_placement: AdPlacement, _userId: string): Promise<boolean> {
  throw new Error('ads_unavailable');
}
