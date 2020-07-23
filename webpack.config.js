const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = () => {
  return {
    target: "node",
    externals: [nodeExternals()],
    entry: [path.resolve(__dirname, "src/index.ts")],
    output: {
      path: path.resolve(__dirname, "dist"),
    },
    resolve: {
      alias: {
        src: path.resolve(__dirname, "src"),
      },
      extensions: [".ts", ".json"],
    },
    module: {
      rules: [
        {
          test: /(\.ts)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "ts-loader",
            },
          ],
        },
      ],
    },
  };
};
