// 在 app.json 之上補幾件事：
// 1. 版本號（versionCode）：Google Play 每次上傳都必須比上一次大，
//    由 GitHub Actions 用打包次數自動帶入 ANDROID_VERSION_CODE。
// 2. 正式版簽署設定（plugins/withReleaseSigning.js）。
module.exports = ({ config }) => {
  const versionCode = Number(process.env.ANDROID_VERSION_CODE) || 1;
  return {
    ...config,
    android: { ...config.android, versionCode },
    // iOS 的 build number 每次上傳 TestFlight 都要變大，由 Codemagic 的打包次數帶入
    ios: { ...config.ios, buildNumber: String(Number(process.env.IOS_BUILD_NUMBER) || 1) },
    plugins: [...(config.plugins ?? []), './plugins/withReleaseSigning', './plugins/withAdsBackend'],
  };
};
