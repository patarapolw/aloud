module.exports = {
  chainWebpack: config => {
    config.module
      .rule('markdown')
      .test(/\.md$/)
      .use('raw-loader')
      .loader('raw-loader')

    // config.resolve.set('symlinks', process.env.NODE_ENV !== 'development')
  }
}
