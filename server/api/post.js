import { Router } from 'express'
import dayjs from 'dayjs'
import shortid from 'shortid'
import dayjsPluginUTC from 'dayjs-plugin-utc'
import escapeRegexp from 'escape-string-regexp'

import secureMiddleware from '../middleware/secure'
import allowedOrigins from '../middleware/allowedOrigins'
import { Post } from '../db'

dayjs.extend(dayjsPluginUTC)

const postRouter = Router()
postRouter.use((req, res, next) => {
  if (req.method !== 'GET') {
    secureMiddleware(req, res, next)
  } else {
    next()
  }
})
postRouter.use(allowedOrigins)

postRouter.get('/:id', async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).exec()
    res.json(post.toJSON())
  } catch (e) {
    next(e)
  }
})

postRouter.get('/', async (req, res, next) => {
  try {
    let cursor = Post.find({
      path: req.headers['x-aloud-path'],
      replyTo: req.query.replyTo
    }).sort({ createdAt: -1 })
    if (req.query.offset) {
      cursor = cursor.skip(parseInt(req.query.offset))
    }
    // cursor = cursor.limit(parseInt(req.query.limit) || 5)

    const posts = await cursor.exec()
    res.json({
      data: posts.map(p => p.toJSON()),
      count: await Post.countDocuments({ path: req.query.path }).exec()
    })
  } catch (e) {
    next(e)
  }
})

postRouter.post('/:id', async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, {
      $set: { content: req.body.content }
    }).exec()
    res.json(post.toJSON())
  } catch (e) {
    next(e)
  }
})

postRouter.post('/:id/setLike', async (req, res, next) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, {
      $set: { like: req.body.like }
    }).exec()
    res.sendStatus(201)
  } catch (e) {
    next(e)
  }
})

postRouter.put('/', async (req, res, next) => {
  try {
    const _id = `post-${dayjs().utc().format('YYYYMMDD-HHmmSS')}-${shortid.generate()}`
    await Post.create({
      _id,
      content: req.body.content,
      user: req.session.user,
      path: req.headers['x-aloud-path'],
      replyTo: req.body.replyTo,
      like: {}
    })
    res.json({ _id })
  } catch (e) {
    next(e)
  }
})

postRouter.delete('/:id', async (req, res, next) => {
  try {
    await Post.deleteMany({
      $or: [
        { _id: req.params.id },
        { replyTo: new RegExp(escapeRegexp(req.params.id)) }
      ]
    }).exec()
    res.sendStatus(201)
  } catch (e) {
    next(e)
  }
})

export default postRouter
