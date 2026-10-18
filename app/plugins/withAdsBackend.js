// react-native-google-mobile-ads 17.x 在 Expo 專案（設定放在 expo.plugins、不在 app.json 最外層）
// 會讀不到 rootProject.ext.googleMobileAdsJson 而讓 Android 打包失敗。
// 在 gradle.properties 指定 RNGMA_ANDROID_BACKEND=classic，套件就不會去讀那個不存在的設定。
const { withGradleProperties } = require('expo/config-plugins');

const KEY = 'RNGMA_ANDROID_BACKEND';

module.exports = function withAdsBackend(config) {
  return withGradleProperties(config, (cfg) => {
    cfg.modResults = cfg.modResults.filter((p) => !(p.type === 'property' && p.key === KEY));
    cfg.modResults.push({ type: 'property', key: KEY, value: 'classic' });
    return cfg;
  });
};
