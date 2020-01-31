const { Nuxt, Builder } = require('nuxt')
const express = require('express')
const session = require('express-session')
const winston = require('winston')
const expressWinston = require('express-winston')
const dotenv = require('dotenv')
dotenv.config()

const config = require('../nuxt.config.js')
const { logger } = require('./utils')

// Import and Set Nuxt.js options
config.dev = process.env.NODE_ENV !== 'production'

const app = express()
app.use(expressWinston.logger({
  winstonInstance: logger,
  ignoreRoute (req) {
    return req.url.startsWith('/_')
  },
  expressFormat: true
}))
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: !config.dev }
}))

async function start () {
  // Instantiate nuxt.js
  const nuxt = new Nuxt(config)

  const {
    host = process.env.HOST || (config.dev ? '127.0.0.1' : '0.0.0.0'),
    port = process.env.PORT || 3000
  } = nuxt.options.server

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

  app.get('/api/test.json', (req, res) => {
    res.json({
      test: 1,
      id: req.query.id
    })
  })

  app.use('/api', require('./api'))

  app.use(nuxt.render)

  app.listen(port, host, () => {
    logger.info(`Server is running at http://${host}:${port}`)
  })
}

start()
