const webpack = require("webpack");
const path = require("path");
const ForkTsCheckerNotifierWebpackPlugin = require("fork-ts-checker-notifier-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = {
    entry: ["./src/index.tsx"],
    output: {
        path: __dirname + "/static",
        filename: "bundle.js",
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
    ],
    optimization: {
        //runtimeChunk: true,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
    },
};
