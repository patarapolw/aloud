import { FastifyInstance } from 'fastify'
import swagger from 'fastify-oas'
import fSession from 'fastify-session'
import fCoookie from 'fastify-cookie'
import admin from 'firebase-admin'

import commentRouter from './comment'
import metadataRouter from './metadata'

const router = (f: FastifyInstance, _: any, next: () => void) => {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SDK!)),
    databaseURL: JSON.parse(process.env.FIREBASE_CONFIG!).databaseURL
  })

  f.register(swagger, {
    routePrefix: '/doc',
    swagger: {
      info: {
        title: 'Aloud API',
        description: 'Aloud commenting Swagger API',
        version: '0.1.0'
      },
      consumes: ['application/json'],
      produces: ['application/json'],
      servers: [
        {
          url: process.env.BASE_URL,
          description: 'Online server'
        },
        {
          url: 'http://localhost:8080',
          description: 'Local server'
        }
      ],
      components: {
        securitySchemes: {
          // BasicAuth: {
          //   type: 'http',
          //   scheme: 'basic'
          // },
          BearerAuth: {
            type: 'http',
            scheme: 'bearer'
          }
        }
      }
    },
    exposeRoute: true
  })

  f.register(fCoookie)
  f.register(fSession, { secret: process.env.SECRET! })

  f.addHook('preHandler', async (req) => {
    if (req.req.url && req.req.url.startsWith('/api/doc')) {
      return
    }

    const url = req.headers['x-aloud-url']
    const bearerAuth = async (auth: string) => {
      const m = /^Bearer (.+)$/.exec(auth)

      if (!m) {
        return false
      }

      const ticket = await admin.auth().verifyIdToken(m[1], true)
      req.session.user = {
        email: ticket.email,
        displayName: (ticket as any).name || undefined
      }

      return !!req.session.user
    }

    await bearerAuth(req.headers.authorization)

    req.log.info({ user: req.session.user, url }, 'auth')
  })

  f.register(commentRouter, { prefix: '/comment' })
  f.register(metadataRouter, { prefix: '/metadata' })
  next()
}

export default router
