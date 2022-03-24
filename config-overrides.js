const ModuleScopePlugin = require("react-dev-utils/ModuleScopePlugin");
// ModuleScopePlugin ensures files reside in src/. That plugin ensures that relative imports from app's source directory don't reach outside of it.
// we disable it!!!
const path = require("path");
// module.exports = function override(config, env) {
//   config.resolve.plugins = config.resolve.plugins.filter(
//     (plugin) => !(plugin instanceof ModuleScopePlugin)
//   );

//   return config;
// };

module.exports = {
  webpack: function (config, env) {
    // changes to the compilation here - this is the normal function used in react-app-rewired.
    config.resolve.plugins = config.resolve.plugins.filter(
      (plugin) => !(plugin instanceof ModuleScopePlugin)
    );
    return config;
  },

  // devServer does not work!!!!
  // devServer: function (configFunction) {
  //   // Return the replacement function for create-react-app to use to generate the Webpack
  //   // Development Server config. "configFunction" is the function that would normally have
  //   // been used to generate the Webpack Development server config - you can use it to create
  //   // a starting configuration to then modify instead of having to create a config from scratch.
  //   return function () {
  //     // Create the default config by calling configFunction with the proxy/allowedHost parameters
  //     const config = configFunction();

  //     config.static.watch.ignored = [
  //       path.resolve(__dirname, "dist"),
  //       path.resolve(__dirname, "node_modules"),
  //       path.resolve(__dirname, "back-end"),
  //     ];

  //     // Return your customised Webpack Development Server config.
  //     return config;
  //   };
  // },
};
