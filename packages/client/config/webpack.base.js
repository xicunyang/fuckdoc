const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
  entry: path.join(__dirname, '../src/index.tsx'),
  module: {
    rules: [
      {
        test: /\.less$/,
        // exclude: /node_modules/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true
              }
            }
          }
        ]
      }
    ]
  },
  resolve: {
    alias: {},
    extensions: ['*', '.vue', '.js', '.jsx', '.tsx', '.ts', '.json']
  },
  plugins: [
    new htmlWebpackPlugin({
      template: path.join(__dirname, '../public/index.html'),
      filename: 'index.html'
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify({
        NODE_ENV: process.env.NODE_ENV,
        HTTP_PATH: isDevelopment ? 'http://127.0.0.1:9527' : ''
      })
    })
  ]
};
