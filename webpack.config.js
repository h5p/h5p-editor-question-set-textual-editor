var path = require('path');

module.exports = {
  entry: "./src/entries/dist.js",
  output: {
    path: path.join(__dirname, '/dist'),
    filename: "question-set-textual-editor.js"
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