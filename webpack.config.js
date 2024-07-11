const path = require("path");
const ForkTsCheckerNotifierWebpackPlugin = require("fork-ts-checker-notifier-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = {
  entry: ["./src/index.tsx"],
  output: {
    path: __dirname + "/static",
    filename: "main.[contenthash].js",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.(t|j)sx?$/,
        use: { loader: "ts-loader" },
        include: path.resolve(__dirname, "src"),
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
        include: path.resolve(__dirname, "css"),
        exclude: /node_modules/,
      },
      { enforce: "pre", test: /\.js$/, exclude: /node_modules/, loader: "source-map-loader" },
    ],
  },
  experiments: {
    topLevelAwait: true,
  },
  // eval-cheap-module-source-map increases the bundle size a LOT
  //devtool: "eval-cheap-module-source-map",
  devtool: "source-map",
  plugins: [
    // these speed up the incremental build time a lot
    new ForkTsCheckerWebpackPlugin(),
    new ForkTsCheckerNotifierWebpackPlugin({
      title: "TypeScript",
      excludeWarnings: false,
    }),
    new HtmlWebpackPlugin({
      template: "./templates/index.template.html",
      filename: "../templates/index.html",
    }),
    new CompressionPlugin({
      algorithm: "gzip",
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
    }),
    new CleanWebpackPlugin(),
  ],
  optimization: {
    //runtimeChunk: true,
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: {
      chunks: "all",
      minSize: 30000,
      maxInitialRequests: Infinity,
      maxAsyncRequests: Infinity,
      cacheGroups: {
        default: {
          minSize: 30000,
          priority: -10,
          reuseExistingChunk: true,
        },
        vendors: {
          minSize: 30000,
          test: /[\\/]node_modules[\\/]/,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
};
