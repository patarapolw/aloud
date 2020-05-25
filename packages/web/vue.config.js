module.exports = {
  // pages: {
  //   index: 'src/main.ts',
  //   comment: 'src/comment.ts'
  // },
  devServer: {
    // historyApiFallback: {
    //   rewrites: [
    //     { from: /\/comment/, to: '/comment.html' }
    //   ]
    // },
    proxy: {
      '^/api': {
        target: 'http://localhost:8080'
      }
    },
    port: 8081
  },
  chainWebpack: config => {
    // GraphQL Loader
    config.module
      .rule('markdown')
      .test(/\.md$/)
      .use('raw-loader')
      .loader('raw-loader')
      .tap(() => {
        return {
          esModule: false
        }
      })
  }
}
