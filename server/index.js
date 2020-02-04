import { Nuxt, Builder } from 'nuxt'
import express from 'express'
import session from 'express-session'
import expressWinston from 'express-winston'
import connectMongo from 'connect-mongo'
import mongoose from 'mongoose'
import enforce from 'express-sslify'

import config from '../nuxt.config'
import { logger, flattenConfig } from './utils'

async function start () {
  Object.entries(flattenConfig()).map(([k, v]) => { process.env[k] = process.env[k] || v })
  const MongoStore = connectMongo(session)

  // Import and Set Nuxt.js options
  config.dev = process.env.NODE_ENV !== 'production'

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

  await mongoose.connect(process.env.mongo_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })

  const app = express()

  if (!config.dev) {
    app.use(enforce.HTTPS({ trustProtoHeader: true }))
  }

  app.enable('trust proxy')

  app.use(expressWinston.logger({
    winstonInstance: logger,
    ignoreRoute (req) {
      return req.url.startsWith('/_')
    },
    expressFormat: true
  }))

  app.use(session({
    secret: process.env.session_secret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: 'auto' },
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    })
  }))

  app.use('/api', require('./api'))

  app.use(nuxt.render)

  app.listen(port, host, () => {
    logger.info(`Server is running at http://${host}:${port}`)
  })
}

start().catch(logger.error)
