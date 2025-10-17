module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
          alias: {
            '@components': './src/components',
            '@logic': './src/logic',
            '@navigation': './src/navigation',
            '@screens': './src/screens',
            '@state': './src/state',
            '@models': './src/types',
            '@ui': './src/ui'
          }
        }
      ],
      'react-native-reanimated/plugin'
    ]
  };
};
