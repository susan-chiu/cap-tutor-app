// 回上一頁：網頁版在某一頁重新整理後沒有上一頁，這時改回首頁，避免按了沒反應
import { router } from 'expo-router';

export function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}
