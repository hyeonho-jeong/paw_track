const { getDefaultConfig } = require("expo/metro-config");

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);
  config.resolver.assetExts.push("csv"); // CSV 파일을 번들에 포함
  return config;
})();
