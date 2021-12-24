const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env) => 
  ({
    mode: env.production ? "production" : "development",
    entry: "./src/views/index.js",
    output: {
      path: path.resolve(__dirname, "public/scripts"),
      filename: "react.js",
      publicPath: "scripts"
    },
    devtool: env.production ? false : "eval-source-map",
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
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            // Creates `style` nodes from JS strings
            "style-loader",
            // Translates CSS into CommonJS
            "css-loader",
            // Compiles Sass to CSS
            "sass-loader",
          ],
        },
        {
          test: /\.css$/i,
          use: [
            // Creates `style` nodes from JS strings
            "style-loader",
            // Translates CSS into CommonJS
            "css-loader",
          ],
        },
      ]
    },
    plugins: [
      new CleanWebpackPlugin()
    ]
  })