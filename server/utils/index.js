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
    return flattenObject(require('../../aloud.config.json'), blacklist)
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('Cannot find aloud.config.js')
    }
  }
  return {}
}

/**
 *
 * @param {RegExp[]} [blacklist=[]]
 */
function flattenObject (obj, blacklist, prev = '', result = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = `${prev}${k}`
    if (v && typeof v === 'object') {
      if (Array.isArray(v)) {
        if (!blacklist.some(el => el.test(k))) {
          result[key] = v.map(v0 => v0.toString()).join('|')
        }
      } else {
        flattenObject(v, blacklist, `${key}_`, result)
      }
    } else {
      if (!blacklist.some(el => el.test(k))) {
        result[key] = v.toString()
      }
    }
  }
  return result
}
