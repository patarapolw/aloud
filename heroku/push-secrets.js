/* eslint-disable no-global-assign */
require = require('esm')(module)
const { pour } = require('pour-console')
const { flattenConfig } = require('../server/utils')

pour(`heroku config:set ${
  Object.entries(flattenConfig()).map(([k, v]) => `${k}=${v}`).join(' ')
// eslint-disable-next-line no-console
} ${
  process.env.REMOTE ? `--remote ${process.env.REMOTE}` : ''
}`).catch(console.error).then(() => process.exit())
