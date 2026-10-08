// 每日練習提醒（手機本地通知，不需要伺服器）
// 做法：排好未來 7 天、每天一則的提醒；每次打開首頁就重排一次。
// 今天已經完成 5 題，就不排今天的提醒，避免打擾。
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface ReminderSettings { enabled: boolean; hour: number; minute: number }

const KEY = 'reminder-settings';
const PREFIX = 'daily-reminder-';
const DEFAULTS: ReminderSettings = { enabled: false, hour: 19, minute: 30 };
export const REMINDER_TIMES = [
  { hour: 17, minute: 0, label: '17:00' },
  { hour: 19, minute: 30, label: '19:30' },
  { hour: 21, minute: 0, label: '21:00' },
];

export const remindersSupported = Platform.OS === 'ios' || Platform.OS === 'android';

if (remindersSupported) {
  // App 開著的時候不跳通知
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: false, shouldShowList: false, shouldPlaySound: false, shouldSetBadge: false,
    }),
  });
}

export function loadReminderSettings(): ReminderSettings {
  try {
    const raw = globalThis.localStorage?.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function saveReminderSettings(s: ReminderSettings) {
  try { globalThis.localStorage?.setItem(KEY, JSON.stringify(s)); } catch { /* 忽略 */ }
}

// 開啟提醒：先詢問通知權限；使用者拒絕就回傳 false
export async function enableReminders(hour: number, minute: number): Promise<boolean> {
  if (!remindersSupported) return false;
  // Android 13 以上要先建立通知頻道，系統才會跳出權限詢問
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily', {
      name: '每日練習提醒',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  const granted = current.granted || (await Notifications.requestPermissionsAsync()).granted;
  if (!granted) return false;
  saveReminderSettings({ enabled: true, hour, minute });
  return true;
}

export async function disableReminders() {
  saveReminderSettings({ ...loadReminderSettings(), enabled: false });
  await cancelOurs();
  // 登出或刪除帳號時，家長的每週提醒也一併取消
  if (remindersSupported) {
    await Notifications.cancelScheduledNotificationAsync(PARENT_ID).catch(() => {});
    try { globalThis.localStorage?.setItem(PARENT_KEY, '0'); } catch { /* 忽略 */ }
  }
}

async function cancelOurs() {
  if (!remindersSupported) return;
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(all.filter((n) => n.identifier.startsWith(PREFIX))
    .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
}

function message(streak: number, dayOffset: number): { title: string; body: string } {
  if (streak > 0 && dayOffset === 0) {
    return { title: `連勝 ${streak} 天，今天還沒練習喔`, body: '5 題大約 5 分鐘，保住你的火焰！' };
  }
  const bodies = ['今天的 5 題準備好了，來挑戰吧！', '錯題小老師在等你，一起把錯題弄懂。', '每天一點點，會考更有把握。'];
  return { title: '會考小老師', body: bodies[dayOffset % bodies.length] };
}

// 重新排程：首頁每次載入時呼叫
export async function rescheduleReminders(opts: { todayMet: boolean; streak: number }) {
  if (!remindersSupported) return;
  const s = loadReminderSettings();
  await cancelOurs();
  if (!s.enabled) return;
  const { granted } = await Notifications.getPermissionsAsync();
  if (!granted) return;

  const now = new Date();
  for (let d = 0; d < 7; d++) {
    const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, s.hour, s.minute, 0);
    if (at <= now) continue;
    if (d === 0 && opts.todayMet) continue;
    await Notifications.scheduleNotificationAsync({
      identifier: `${PREFIX}${d}`,
      content: message(opts.streak, d),
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: 'daily' },
    });
  }
}

// ---------- 家長：每週日晚上 8 點提醒看學習摘要 ----------
const PARENT_KEY = 'parent-weekly-reminder';
const PARENT_ID = 'parent-weekly';

export function parentWeeklyEnabled(): boolean {
  try { return globalThis.localStorage?.getItem(PARENT_KEY) === '1'; } catch { return false; }
}

export async function setParentWeekly(on: boolean): Promise<boolean> {
  if (!remindersSupported) return false;
  await Notifications.cancelScheduledNotificationAsync(PARENT_ID).catch(() => {});
  if (!on) {
    try { globalThis.localStorage?.setItem(PARENT_KEY, '0'); } catch { /* 忽略 */ }
    return true;
  }
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('weekly', {
      name: '每週學習摘要', importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  const granted = current.granted || (await Notifications.requestPermissionsAsync()).granted;
  if (!granted) return false;
  await Notifications.scheduleNotificationAsync({
    identifier: PARENT_ID,
    content: { title: '會考小老師・本週學習摘要', body: '來看看孩子這週練習了幾天、哪些單元需要加強。' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: 1, hour: 20, minute: 0, channelId: 'weekly' },
  });
  try { globalThis.localStorage?.setItem(PARENT_KEY, '1'); } catch { /* 忽略 */ }
  return true;
}
