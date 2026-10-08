// 當機與錯誤回報（Sentry）。沒有設定 DSN 時完全不啟用。
// 為保護未成年使用者，不送出 Email、IP 等個人資料。
import * as Sentry from '@sentry/react-native';

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

export const sentryEnabled = !!dsn;

if (dsn) {
  Sentry.init({
    dsn,
    sendDefaultPii: false,
    enabled: !__DEV__,
    tracesSampleRate: 0.1,
  });
}

export { Sentry };
