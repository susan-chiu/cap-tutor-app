// 分享文字：手機用系統分享選單；網頁沒有分享選單時改成複製到剪貼簿並提示
import { Alert, Platform, Share } from 'react-native';

export async function shareText(message: string) {
  if (Platform.OS !== 'web') {
    try { await Share.share({ message }); } catch { /* 使用者取消 */ }
    return;
  }
  const nav = typeof navigator !== 'undefined' ? navigator : undefined;
  if (nav?.share) {
    try { await nav.share({ text: message }); return; }
    catch (e) { if ((e as Error)?.name === 'AbortError') return; }
  }
  try {
    await nav?.clipboard?.writeText(message);
    Alert.alert('已複製', '分享文字已複製，可以貼到 LINE 或訊息裡。');
  } catch {
    Alert.alert('分享內容', message);
  }
}
