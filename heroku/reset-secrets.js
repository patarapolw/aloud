/* eslint-disable no-global-assign */
require = require('esm')(module)
const { execSync } = require('child_process')

const { pour } = require('pour-console')

const setRemote = process.env.REMOTE ? `--remote ${process.env.REMOTE}` : '';

(async () => {
  const envKeys = execSync(`heroku config ${setRemote}`).toString().trim().split('\n')
    .filter(row => row.includes(':')).map(row => row.split(':')[0])

  await pour(`heroku config:unset ${envKeys.join(' ')} ${setRemote}`)
})().catch(console.error).then(() => process.exit())
