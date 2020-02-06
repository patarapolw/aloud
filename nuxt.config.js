import pkg from './package.json'
import { flattenConfig } from './server/utils'

Object.entries(flattenConfig([
  /mongo\.uri/,
  /secret/
])).map(([k, v]) => { process.env[k] = process.env[k] || v })

export default {
  mode: 'universal',
  /*
  ** Headers of the page
  */
  head: {
    title: 'Aloud - Let your voice be heard.',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
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
    '@nuxtjs/redirect-module'
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
          loader: 'raw-loader',
          options: {
            esModule: false
          }
        }
      )
    }
  },
  server: {
    host: process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost'),
    port: process.env.PORT
  },
  env: process.env,
  redirect: [
    { from: '^/docs/(.*)\\.md$', to: '/$1' }
  ]
}
