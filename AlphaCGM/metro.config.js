// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  // Treat .csv files as bundled assets
  config.resolver.assetExts.push('csv');

  return config;
})();
