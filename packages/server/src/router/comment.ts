import { FastifyInstance } from 'fastify'
import escapeStringRegexp from 'escape-string-regexp'
import { EntryModel } from '../db/schema'

export default (f: FastifyInstance, _: any, next: () => void) => {
  f.get('/', {
    schema: {
      tags: ['comment'],
      summary: 'Query for comments',
      querystring: {
        type: 'object',
        required: ['path', 'offset'],
        properties: {
          path: { type: 'string' },
          offset: { type: 'integer' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            data: { type: 'array', items: {} },
            count: { type: 'integer' }
          }
        }
      }
    }
  }, async (req, reply) => {
    const url = req.headers['x-aloud-url']
    if (!url) {
      return reply.status(401).send()
    }

    const { path, offset } = req.query

    const [rData, rCount] = await Promise.all([
      EntryModel.aggregate([
        {
          $match: {
            url,
            path
          }
        },
        {
          $sort: {
            createdAt: -1
          }
        },
        {
          $skip: offset
        },
        {
          $limit: 5
        }
      ]),
      EntryModel.countDocuments({
        url,
        path
      })
    ])

    return {
      data: rData,
      count: rCount
    }
  })

  f.put('/', {
    schema: {
      tags: ['comment'],
      summary: 'Create comment',
      body: {
        type: 'object',
        required: ['content', 'path'],
        properties: {
          content: { type: 'string' },
          path: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          }
        }
      }
    }
  }, async (req, reply) => {
    const url = req.headers['x-aloud-url']
    if (!req.session.user || !url) {
      return reply.status(401).send()
    }

    const { content, path } = req.body
    const { user } = req.session

    const el = await EntryModel.create({
      content,
      path,
      createdBy: {
        displayName: user.displayName || undefined,
        email: user.email || undefined
      },
      url
    })

    return {
      id: el._id
    }
  })

  f.patch('/', {
    schema: {
      tags: ['comment'],
      summary: 'Update comment',
      querystring: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        properties: {
          like: { type: 'object' },
          content: { type: 'string' }
        }
      }
    }
  }, async (req, reply) => {
    if (!req.session.user) {
      reply.status(401).send()
      return
    }

    const { id } = req.query
    const { like, content } = req.body
    const $set = JSON.parse(JSON.stringify({ like, content }))

    await EntryModel.updateOne({ _id: id }, { $set })

    reply.status(201).send()
  })

  f.delete('/', {
    schema: {
      tags: ['comment'],
      summary: 'Delete comment',
      querystring: {
        type: 'object',
        required: ['id', 'path'],
        properties: {
          id: { type: 'string' },
          path: { type: 'string' }
        }
      }
    }
  }, async (req, reply) => {
    const url = req.headers['x-aloud-url']
    if (!req.session.user || !url) {
      reply.status(401).send()
      return
    }

    const { id, path } = req.query
    await Promise.all([
      EntryModel.deleteOne({ _id: id }),
      EntryModel.deleteMany({
        url,
        path: {
          $regex: new RegExp(
            `(^${escapeStringRegexp(path)}/|^${escapeStringRegexp(
              path
            )}$)`
          )
        }
      })
    ])

    reply.status(201).send()
  })

  next()
}
