const { spawn } = require('child_process')
const fs = require('fs')

/**
 *
 * @param {string} cmd
 * @param {string[]} args
 * @param {typeof import('child_process').SpawnOptionsWithoutStdio} opts
 * @param {NodeJS.WriteStream} stdout
 * @param {NodeJS.WriteStream} stderr
 */
const pour = (cmd, args, opts, stdout = process.stdout, stderr = process.stderr) => {
  return new Promise((resolve, reject) => {
    this.process = spawn(cmd, args, opts)
    this.process.stdout.on('data', (data) => {
      stdout.write(data)
    })
    this.process.stderr.on('data', (data) => {
      stderr.write(data)
    })
    this.process.on('close', (code) => {
      resolve(code)
    })
    this.process.on('error', (err) => {
      reject(err)
    })
  })
}

/**
 * How to deploy .gitignored compiled files in Heroku?
 *
 * @link https://stackoverflow.com/a/42050814/9023855
 *
 * @param {string[]} files
 */
async function deployGitignored (files) {
  const messageIndex = process.argv.indexOf('-m')
  let message = 'deploy to heroku'
  if (messageIndex !== -1) {
    message = process.argv[messageIndex + 1] || message
  }

  await pour('git', ['checkout', '-b', 'heroku'])

  fs.copyFileSync('.gitignore', '.gitignore.tmp')
  const gitignore = fs.createWriteStream('.gitignore', {
    flags: 'a',
    encoding: 'utf8'
  })

  const tmp = {}
  files.map((f) => {
    gitignore.write('\n!' + f)
    tmp[f] = fs.readFileSync(f, 'utf8')
  })
  gitignore.write('\n' + '.gitignore.tmp')
  gitignore.close()

  await pour('git', ['add', '.'])
  await pour('git', ['commit', '-m', message])
  await pour('git', ['push', '-f', 'heroku', 'heroku:master'])

  fs.copyFileSync('.gitignore.tmp', '.gitignore')
  fs.unlinkSync('.gitignore.tmp')

  await pour('git', ['add', '.'])
  await pour('git', ['commit', '-m', 'restore .gitignore'])

  await pour('git', ['switch', 'master'])
  await pour('git', ['branch', '-D', 'heroku'])

  Object.entries(tmp).map(([f, data]) => {
    fs.writeFileSync(f, data)
  })
}

deployGitignored([
  'aloud.config.js'
// eslint-disable-next-line no-console
]).catch(console.error)
