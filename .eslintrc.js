module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended'
  ],
  // add your custom rules here
  rules: {
    'require-await': 0,
    'no-unused-vars': 0,
    'no-return-await': 0,
    'no-lonely-if': 0,
    'import/order': 0
  }
}
