const webpack = require('webpack')

module.exports = {
  configureWebpack: () => ({
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
    ],
  }),
  // options...
  devServer: {
    proxy: 'https://localhost:8080/',
  }
}
