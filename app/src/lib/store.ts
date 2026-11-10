import { Platform } from 'react-native';

/**
 * 能不能在 App 裡購買完整版。iPhone 版還沒設定 RevenueCat 金鑰時（第一版免費上架），
 * 把所有「升級完整版」入口藏起來，避免審核認為功能不完整。
 */
export const canBuy = Platform.OS !== 'ios' || !!process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
