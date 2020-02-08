/* eslint-disable no-global-assign */
require = require('esm')(module)
const { execSync, spawnSync } = require('child_process')

const setRemote = process.env.REMOTE ? `--remote ${process.env.REMOTE}` : ''

const envKeys = execSync(`heroku config ${setRemote}`).toString().trim().split('\n')
  .filter(row => row.includes(':')).map(row => row.split(':')[0])

spawnSync('heroku', [
  'config:unset',
  ...envKeys,
  ...(process.env.REMOTE ? [
    '--remote',
    process.env.REMOTE
  ] : [])
])
