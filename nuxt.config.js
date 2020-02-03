module.exports = {
  mode: 'universal',
  /*
  ** Headers of the page
  */
  head: {
    title: 'Aloud - Let your voice be heard.',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'stylesheet', href: '//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.18.1/styles/default.min.css' },
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ],
    script: [
      { src: '//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.18.1/highlight.min.js', async: true }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },
  /*
  ** Global CSS
  */
  css: [
    'simplemde/dist/simplemde.min.css'
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    ...(process.env.NODE_ENV === 'development' ? [
      // Doc: https://github.com/nuxt-community/eslint-module
      '@nuxtjs/eslint-module'
    ] : [])
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://buefy.github.io/#/documentation
    'nuxt-buefy',
    ...(process.env.NODE_ENV === 'development' ? [
      // Doc: https://github.com/nuxt-community/dotenv-module
      '@nuxtjs/dotenv'
    ] : [])
  ],
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
      config.module.rules.push(
        {
          test: /\.md$/,
          loader: 'raw-loader'
        }
      )
    }
  },
  server: {
    host: process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost'),
    port: process.env.PORT
  },
  env: process.env
}
