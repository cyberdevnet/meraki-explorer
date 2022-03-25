const ModuleScopePlugin = require("react-dev-utils/ModuleScopePlugin");
// ModuleScopePlugin ensures files reside in src/. That plugin ensures that relative imports from app's source directory don't reach outside of it.
// we disable it!!!
const path = require("path");

const { override, fixBabelImports, overrideDevServer } = require("customize-cra");

const webPackConfig = () => (config) => {
  return {
    ...config,
    watch: false,
    watchOptions: {
      ignored: path.resolve(__dirname, "back-end"),
    },
    resolve: {
      plugins: [],
    },
  };
};

const devServerConfig = () => (config) => {
  return {
    ...config,
    static: {
      watch: {
        ignored: [
          path.resolve(__dirname, "dist"),
          path.resolve(__dirname, "node_modules"),
          path.resolve(__dirname, "back-end"),
        ],
      },
    },
  };
};

module.exports = {
  webpack: override(webPackConfig()),

  devServer: overrideDevServer(devServerConfig()),
};
