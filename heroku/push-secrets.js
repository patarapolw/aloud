/* eslint-disable no-global-assign */
require = require('esm')(module)
const { spawn } = require('child_process')

const { flattenConfig } = require('../server/utils')

spawn('heroku', [
  'config:set',
  ...Object.entries(flattenConfig()).map(([k, v]) => `${k}=${v}`),
  ...(process.env.REMOTE ? [
    '--remote',
    process.env.REMOTE
  ] : [])
], {
  stdio: 'inherit'
})
