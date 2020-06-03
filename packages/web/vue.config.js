process.env.VUE_APP_FIREBASE_CONFIG = process.env.FIREBASE_CONFIG

module.exports = {
  devServer: {
    proxy: {
      '^/api': {
        target: 'http://localhost:8080'
      }
    },
    port: 8081
  },
  chainWebpack: config => {
    config.module
      .rule('markdown')
      .test(/\.md$/)
      .use('raw-loader')
      .loader('raw-loader')

    // config.resolve.set('symlinks', process.env.NODE_ENV !== 'development')
  }
}
