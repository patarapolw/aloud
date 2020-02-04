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
 * @param {RegExp[]} [blacklist=[]]
 */
export function flattenConfig (blacklist = []) {
  try {
    return flattenObject(require('../../aloud.config'), blacklist)
  } catch (e) {
    if (process.env.NODE_ENV !== 'development') {
      // eslint-disable-next-line no-console
      console.log('Cannot find aloud.config.js')
    }
  }
}

/**
 *
 * @param {RegExp[]} [blacklist=[]]
 */
function flattenObject (obj, blacklist, prev = '', result = {}) {
  for (const [k, v] of Object.entries(obj)) {
    if (v && typeof v === 'object') {
      flattenObject(v, blacklist, `${k}.`, result)
    } else {
      const key = `${prev}${k}`
      if (!blacklist.some(el => el.test(k))) {
        result[key] = v.toString()
      }
    }
  }
  return result
}
