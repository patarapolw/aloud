const winston = require('winston')

const logger = winston.createLogger({
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

module.exports = {
  logger
}
