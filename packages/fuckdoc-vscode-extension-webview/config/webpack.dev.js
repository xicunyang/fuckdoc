const { merge } = require('webpack-merge')
const webpackBase = require('./webpack.base')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const path = require('path');

module.exports = merge(webpackBase, {
  mode: 'development',
  devServer: {
    hot: true,
    devMiddleware: {
      writeToDisk: true
    },
    // 允许任何 host
    allowedHosts: 'all',
    host: 'localhost'
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|jsx|js)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: [require.resolve('react-refresh/babel')]
            }
          }
        ]
      }
    ]
  },
  plugins: [new ReactRefreshWebpackPlugin()]
})
