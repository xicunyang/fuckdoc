const { merge } = require('webpack-merge');
const path = require('path');
const webpackBase = require('./webpack.base');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = merge(webpackBase, {
  mode: 'production',
  output: {
    path: path.join(__dirname, '../dist'),
  },
  cache: { 
    type: 'filesystem' 
  }, 
  module: {
    rules: [
      {
        test: /\.(ts|tsx|jsx|js)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
  plugins: [new CleanWebpackPlugin()],
});
