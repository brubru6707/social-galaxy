// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Give the bundler the ability to read the 3D engine files
config.resolver.sourceExts.push('cjs');
config.resolver.sourceExts.push('mjs');

config.resolver.assetExts.push('glb');
config.resolver.assetExts.push('gltf');
config.resolver.assetExts.push('png');
config.resolver.assetExts.push('jpg');

module.exports = config;