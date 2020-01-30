const { Nuxt, Builder } = require('nuxt')
const fastify = require('fastify')({
  logger: {
    prettyPrint: true
  }
})

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = process.env.NODE_ENV !== 'production'

async function start () {
  // Instantiate nuxt.js
  const nuxt = new Nuxt(config)

  const {
    host = config.dev ? '127.0.0.1' : '0.0.0.0',
    // host = process.env.HOST || '127.0.0.1',
    port = process.env.PORT || 3000
  } = nuxt.options.server

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

  fastify.use((req, res, next) => {
    req.url && req.url.startsWith('/api/') ? next() : nuxt.render(req, res)
  })

  fastify.get('/api/test.json', {
    schema: {
      querystring: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          excitement: { type: 'integer' }
        }
      }
    }
  }, async (req) => {
    return {
      test: 1,
      id: req.query.id
    }
  })

  fastify.listen(port, host, (err, address) => {
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    }
  })
}

start()
