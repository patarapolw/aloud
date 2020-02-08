/* eslint-disable no-global-assign */
require = require('esm')(module)
const { execSync } = require('child_process')

const { pour } = require('pour-console');

(async () => {
  const envKeys = execSync(`heroku config --remote ${process.env.REMOTE}`).toString().trim().split('\n')
    .filter(row => row.includes(':')).map(row => row.split(':')[0])

  await pour(`heroku config:unset ${envKeys.join(' ')} --remote ${process.env.REMOTE}`)
})().catch(console.error).then(() => process.exit())
