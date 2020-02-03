/* eslint-disable no-console */
const { spawn } = require('child_process')
const fs = require('fs')

/**
 *
 * @param {string} cmd
 * @param {string[]} [args]
 * @param {typeof import('child_process').SpawnOptionsWithoutStdio} [options]
 */
async function pour (cmd, args, options) {
  const p = this.process = spawn(cmd, args, options)

  return new Promise((resolve, reject) => {
    p.stdin.pipe(process.stdin)
    p.stdout.on('data', d => console.log(d.toString()))
    p.stderr.on('data', d => console.error(d.toString()))
    p.on('error', reject)
    p.on('close', resolve)
  })
}

/**
 *
 * @param {string} cmd
 * @param {typeof import('child_process').SpawnOptionsWithoutStdio} [options]
 */
async function pourSimple (cmd, options) {
  const [args0, ...args] = cmd.split(' ')
  return pour(args0, args, options)
}

/**
 *
 * @callback deployCallback
 * @param {string} [deployFolder]
 * @param {string} [deployBranch]
 * @returns {Promise<any>}
 */

/**
 *
 * @param {deployCallback} callback
 * @param {string} [deployFolder="dist"]
 * @param {string} [deployBranch="heroku"]
 */
async function deploy (
  callback,
  deployFolder = 'dist',
  deployBranch = 'heroku',
  deployMessage = 'Deploy to Heroku'
) {
  // Ensure that dist folder isn't exist in the first place
  await pourSimple('rm -rf dist')

  try {
    await pourSimple(`git branch ${deployBranch} master`)
  } catch (e) {
    console.error(e)
  }

  await pourSimple(`git worktree add -f ${deployFolder} ${deployBranch}`)

  await callback(deployFolder, deployBranch)

  await pourSimple('git add .', {
    cwd: deployFolder
  })

  await pour('git', [
    'commit',
    '-m',
    deployMessage
  ], {
    cwd: deployFolder
  })

  await pourSimple(`git push -f heroku ${deployBranch}:master`, {
    cwd: deployFolder
  })

  await pourSimple(`git worktree remove ${deployFolder}`)

  await pourSimple(`git branch -D ${deployBranch}`)
}

deploy(async (deployFolder) => {
  fs.writeFileSync(
    `${deployFolder}/.gitignore`,
    fs.readFileSync('.gitignore', 'utf8').replace('aloud.config.js', '')
  )
  fs.copyFileSync(
    'aloud.config.js',
    `${deployFolder}/aloud.config.js`
  )
}).catch(console.error)
