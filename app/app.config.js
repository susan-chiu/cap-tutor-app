// 在 app.json 之上補兩件事：
// 1. 版本號（versionCode）：Google Play 每次上傳都必須比上一次大，
//    由 GitHub Actions 用打包次數自動帶入 ANDROID_VERSION_CODE。
// 2. 正式版簽署設定（plugins/withReleaseSigning.js）。
module.exports = ({ config }) => {
  const versionCode = Number(process.env.ANDROID_VERSION_CODE) || 1;
  return {
    ...config,
    android: { ...config.android, versionCode },
    plugins: [...(config.plugins ?? []), './plugins/withReleaseSigning', './plugins/withAdsBackend'],
  };
};
