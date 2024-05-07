const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
  pluginOptions: {
    i18n: {
      locale: "en",
      fallbackLocale: "en",
      localeDir: "locales",
      enableInSFC: false,
    },
  },
  configureWebpack: {
    plugins: [new BundleAnalyzerPlugin()],
    resolve: {
      alias: {
        moment: "moment/src/moment",
      },
    },
  },
};
