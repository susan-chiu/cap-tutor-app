// App 只用「本機排程提醒」（每日練習提醒），沒有遠端推播。
// expo-notifications 預設會加上 aps-environment（推播）權限，
// 但描述檔沒有開推播功能，iOS 打包會失敗，所以在這裡拿掉。
const { withEntitlementsPlist } = require('expo/config-plugins');

module.exports = function withoutPushEntitlement(config) {
  return withEntitlementsPlist(config, (cfg) => {
    delete cfg.modResults['aps-environment'];
    return cfg;
  });
};
