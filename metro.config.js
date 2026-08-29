// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = withUniwindConfig(config, {
  // relative path to the global.css entry file (project root)
  cssEntryFile: './global.css',
  // auto-generated Uniwind typings, kept under src/ for automatic tsconfig inclusion
  dtsFile: './src/uniwind-types.d.ts',
});
