module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Este plugin es obligatorio para el Drawer y las animaciones avanzadas
      'react-native-reanimated/plugin', 
    ],
  };
};