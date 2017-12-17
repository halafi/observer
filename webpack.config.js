const config = {
  context: `${__dirname}/src`,
  devtool: "eval-source-map",
  entry: {
    app: "./index.js"
  },
  output: {
    path: `${__dirname}/dist`,
    publicPath: "/assets/",
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        query: {
          presets: ["babel-preset-env"].map(require.resolve)
        }
      }
    ]
  },
  devServer: {
    open: true,
    contentBase: `${__dirname}/src`
  }
};

if (process.env.NODE_ENV === "production") {
  config.devtool = "source-map";
}

module.exports = config;
