import path from 'path'

import fastify from 'fastify'
import fastifyStatic from 'fastify-static'
import helmet from 'fastify-helmet'
import pointOfView from 'point-of-view'

import router from './router'
import { initDatabase } from './db/schema'

(async () => {
  await initDatabase(process.env.MONGO_URI!)

  const app = fastify({
    logger: {
      prettyPrint: process.env.NODE_ENV === 'development'
    }
  })

  const port = parseInt(process.env.PORT || '8080')

  app.register(helmet)

  if (process.env.NODE_ENV === 'development') {
    app.register(require('fastify-cors'))
    app.addHook('preHandler', async (req) => {
      if (req.body) {
        req.log.info({ body: req.body }, 'body')
      }
    })
  }

  app.register(router, { prefix: '/api' })

  app.register(pointOfView, {
    engine: {
      handlebars: require('handlebars')
    },
    defaultContext: { firebaseConfig: process.env.FIREBASE_CONFIG },
    // @ts-ignore
    root: path.resolve('public')
  })

  app.register(fastifyStatic, {
    root: path.resolve('public')
  })

  app.get('/', (_, reply) => {
    reply.view('index.html')
  })

  app.get('*.html', (_, reply) => {
    reply.view('index.html')
  })

  app.setNotFoundHandler((_, reply) => {
    reply.view('index.html')
  })

  app.listen(port, process.env.NODE_ENV === 'development' ? 'localhost' : '0.0.0.0', (err) => {
    if (err) {
      throw err
    }

    console.log(`Go to http://localhost:${port}`)
  })
})().catch(console.error)
