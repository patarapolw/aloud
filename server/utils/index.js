import winston from 'winston'

export const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(info => `[${info.timestamp.replace('T', ' ')}] ${info.level}: ${info.message}`)
      )
    })
  ],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  )
})

/**
 *
 * @param {string[]} [blacklist=[]]
 */
export function loadConfig (blacklist = []) {
  loadObjectToEnv(require('../../aloud.config'), '', blacklist)
  return process.env
}

/**
 *
 * @param {string[]} [blacklist=[]]
 */
function loadObjectToEnv (obj, prev = '', blacklist) {
  for (const [k, v] of Object.entries(obj)) {
    if (v && typeof v === 'object') {
      loadObjectToEnv(v, `${k}.`, blacklist)
    } else {
      const key = `${prev}${k}`
      if (!(key.includes('secret') || blacklist.includes(key))) {
        process.env[key] = process.env[key] || v.toString()
      }
    }
  }
}
