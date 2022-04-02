const ModuleScopePlugin = require("react-dev-utils/ModuleScopePlugin");
// ModuleScopePlugin ensures files reside in src/. That plugin ensures that relative imports from app's source directory don't reach outside of it.
// we disable it!!!
const path = require("path");

// const { override, fixBabelImports, overrideDevServer } = require("customize-cra");

// const webPackConfig = () => (config) => {
//   return {
//     ...config,
//     watch: false,
//     watchOptions: {
//       ignored: path.resolve(__dirname, "back-end"),
//     },
//     resolve: {
//       plugins: [],
//     },
//   };
// };

// const devServerConfig = () => (config) => {
//   return {
//     ...config,
//     static: {
//       watch: {
//         ignored: [
//           path.resolve(__dirname, "dist"),
//           path.resolve(__dirname, "node_modules"),
//           path.resolve(__dirname, "back-end"),
//         ],
//       },
//     },
//   };
// };

const modulesFolder = path.resolve(__dirname, 'node_modules/');

module.exports = function override(config, env) {
  config.resolve.plugins = config.resolve.plugins.filter((plugin) => !(plugin instanceof ModuleScopePlugin));

  if (!config.resolve) {
    config.resolve = {
      alias: {
        "react/jsx-dev-runtime": "react/jsx-dev-runtime.js",
        "react/jsx-runtime": "react/jsx-runtime.js",
        "react-bootstrap-table2-toolkit-css": `react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit.min.css`,
        "react-bootstrap-table2-toolkit": `react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit.js`,
      },
    };
  } else {
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        "react/jsx-dev-runtime": "react/jsx-dev-runtime.js",
        "react/jsx-runtime": "react/jsx-runtime.js",
        "react-bootstrap-table2-toolkit-css": `react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit.min.css`,
        "react-bootstrap-table2-toolkit": `react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit.js`,
      },
    };
  }

  return config;
};

// module.exports = function override(config, env) {
//   if (!config.resolve) {
//     config.resolve = {
//       alias: {
//         "react/jsx-dev-runtime": "react/jsx-dev-runtime.js",
//         "react/jsx-runtime": "react/jsx-runtime.js",
//         "react-bootstrap-table2-toolkit-css": `react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit.min.css`,
//         "react-bootstrap-table2-toolkit": `react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit.js`,
//       },
//     };
//   } else {
//     config.resolve = {
//       ...config.resolve,
//       alias: {
//         ...config.resolve.alias,
//         "react/jsx-dev-runtime": "react/jsx-dev-runtime.js",
//         "react/jsx-runtime": "react/jsx-runtime.js",
//         "react-bootstrap-table2-toolkit-css": `react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit.min.css`,
//         "react-bootstrap-table2-toolkit": `react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit.js`,
//       },
//     };
//   }

//   return config;
// };

// module.exports = {
//   webpack: override(webPackConfig()),

//   devServer: overrideDevServer(devServerConfig()),
// };
