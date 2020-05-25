import axios from 'axios'
import domino from 'domino'
// @ts-ignore
import { getMetadata } from 'page-metadata-parser'
import { FastifyInstance } from 'fastify'

export default (f: FastifyInstance, _: any, next: () => void) => {
  f.get('/', {
    schema: {
      tags: ['metadata'],
      summary: 'Get page metadata for SEO and link building purpose',
      querystring: {
        type: 'object',
        required: ['url'],
        properties: {
          url: { type: 'string' }
        }
      }
    }
  }, async (req) => {
    const { url } = req.query

    if (!url) {
      throw new Error('No URL is found')
    }

    const r = await axios.get(url, {
      transformResponse: (d) => d
    })

    const doc = domino.createWindow(r.data).document
    return getMetadata(doc, url)
  })

  next()
}
