var autoprefixer = require('autoprefixer');
var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: "./src/entries/dist.js",
  output: {
    path: path.join(__dirname, '/dist'),
    filename: "dist.js"
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, "src/scripts"),
          path.resolve(__dirname, "src/entries")
        ],
        loader: 'babel'
      }
    ]
  }
};
