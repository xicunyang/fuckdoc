module.exports = {
  presets: [['@babel/preset-env'], ['@babel/preset-typescript'], ['@babel/preset-react']],
  plugins: [
    // 'react-refresh/babel',
    [
      'import',
      {
        libraryName: '@ecom/auxo',
        libraryDirectory: 'es/components',
        style: true,
      },
    ],
  ],
};
