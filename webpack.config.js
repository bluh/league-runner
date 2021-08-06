const path = require('path');

module.exports = {
  entry: "./src/views/index.js",
  output: {
    path: path.resolve(__dirname, "public/scripts"),
    filename: "react.js",
    publicPath: "scripts"
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      }
    ]
  }
}