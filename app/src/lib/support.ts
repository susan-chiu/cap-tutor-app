// 客服聯絡與版本資訊
import Constants from 'expo-constants';
import { Linking, Platform } from 'react-native';

export const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';
const SUPPORT_EMAIL = process.env.EXPO_PUBLIC_SUPPORT_EMAIL;

/** 開啟寫信給客服，自動帶入版本與使用者代碼，方便客服查問題 */
export function contactSupport(userId: string | undefined, topic = '意見回饋') {
  if (!SUPPORT_EMAIL) return;
  const body = [
    '請描述你遇到的問題（可以附上截圖）：', '', '', '',
    '——以下資訊請保留，方便我們查詢——',
    `App 版本：${APP_VERSION}（${Platform.OS}）`,
    `使用者代碼：${userId ? userId.slice(0, 8) : '未登入'}`,
  ].join('\n');
  const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`【會考小老師】${topic}`)}&body=${encodeURIComponent(body)}`;
  Linking.openURL(url).catch(() => {});
}
export const supportAvailable = !!SUPPORT_EMAIL;

/** 服務條款版本：條款內容有重大修改時改這個日期，註冊時會記錄使用者同意的是哪一版 */
export const TERMS_VERSION = '2026-10';
