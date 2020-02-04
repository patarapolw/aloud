/* eslint-disable no-console */
const fs = require('fs')
const { pour } = require('pour-console')

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
  await pour('rm -rf dist')

  try {
    await pour(`git branch ${deployBranch} master`)
  } catch (e) {
    console.error(e)
  }

  await pour(`git worktree add -f ${deployFolder} ${deployBranch}`)

  await callback(deployFolder, deployBranch)

  await pour('git add .', {
    cwd: deployFolder
  })

  await pour([
    'git',
    'commit',
    '-m',
    deployMessage
  ], {
    cwd: deployFolder
  })

  await pour(`git push -f heroku ${deployBranch}:master`, {
    cwd: deployFolder
  })

  await pour(`git worktree remove ${deployFolder}`)

  await pour(`git branch -D ${deployBranch}`)
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
