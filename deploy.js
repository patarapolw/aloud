const fs = require('fs-extra')
const rimraf = require('rimraf')

async function deploy () {
  fs.ensureDirSync('dist');

  [
    'assets',
    'components',
    'docs',
    'layouts',
    'middleware',
    'pages',
    'plugins',
    'server',
    'static',
    'store',
    'aloud.config.js',
    'index.js',
    'nuxt.config.js',
    'package.json',
    'Procfile',
    'README.md',
    'yarn.lock'
  ].map(async (f) => {
    fs.copySync(f, `dist/${f}`)
  })

  await new Promise((resolve, reject) => {
    rimraf('dist', err => err ? reject(err) : resolve())
  })
}

deploy()
