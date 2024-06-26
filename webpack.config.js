const path = require('path');
const pkg = require('./package.json');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const buildPath = './build/';
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: ['./src/index.js'],
  output: {
    path: path.join(__dirname, buildPath),
    filename: '[name].[hash].js'
  },
  mode: 'development',
  target: 'web',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$|jsx/,
        use: 'babel-loader',
        exclude: path.resolve(__dirname, './node_modules/'),
      },{
        test: /\.(jpe?g|png|gif|svg|tga|glb|babylon|mtl|pcb|pcd|prwm|obj|mat|mp3|ogg)$/i,
        type: 'asset/resource',
        exclude: path.resolve(__dirname, './node_modules/'),
        generator: {
          filename: 'assets/[name].[ext]'
        }
      },{
        test: /\.css$/,
        use: [
            'style-loader',
            'css-loader',
          ],
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
    new HtmlWebpackPlugin({
      'title': 'vanilla js sequence kit starter',
      'template': './src/index.html'
    }),
    new Dotenv()
  ],
  resolve: {
    fallback: {
      // other fallbacks...
      "buffer": require.resolve("buffer/")
    }
  }
}
