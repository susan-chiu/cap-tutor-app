// 讓 Android 正式版（AAB）用 Google Play 上傳金鑰簽署。
// 金鑰不放在程式碼裡：打包時由 GitHub Actions 從 Secrets 解出到暫存檔，
// 再透過環境變數 ANDROID_KEYSTORE_PATH / ANDROID_KEYSTORE_PASSWORD 傳進來。
// 沒有設定這兩個變數時（例如本機測試版），沿用原本的 debug 簽署，不影響打包。
const { withAppBuildGradle } = require('expo/config-plugins');

const MARKER = '// cap-tutor: release signing';

const BLOCK = `
${MARKER}
android {
    signingConfigs {
        upload {
            def ksPath = System.getenv("ANDROID_KEYSTORE_PATH")
            if (ksPath) {
                storeFile file(ksPath)
                storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")
                keyAlias "upload"
                keyPassword System.getenv("ANDROID_KEYSTORE_PASSWORD")
            }
        }
    }
    buildTypes {
        release {
            if (System.getenv("ANDROID_KEYSTORE_PATH")) {
                signingConfig signingConfigs.upload
            }
        }
    }
}
`;

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.language !== 'groovy') {
      throw new Error('withReleaseSigning 只支援 Groovy 的 build.gradle');
    }
    if (!cfg.modResults.contents.includes(MARKER)) {
      cfg.modResults.contents += BLOCK;
    }
    return cfg;
  });
};
