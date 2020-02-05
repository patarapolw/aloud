import { Router } from 'express'
import dayjs from 'dayjs'
import shortid from 'shortid'
import dayjsPluginUTC from 'dayjs-plugin-utc'
import escapeRegexp from 'escape-string-regexp'

import secureMiddleware from '../middleware/secure'
import { Post } from '../db'

dayjs.extend(dayjsPluginUTC)

const postRouter = Router()
postRouter.use(secureMiddleware)

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
      path: req.query.path,
      replyTo: req.query.replyTo
    }).sort({ createdAt: -1 })
    if (req.query.offset) {
      cursor = cursor.skip(parseInt(req.query.offset))
    }
    cursor = cursor.limit(parseInt(req.query.limit) || 5)

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

postRouter.post('/:id/like', async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, {
      $inc: { 'like.default': 1 }
    }).exec()
    res.json(post.toJSON())
  } catch (e) {
    next(e)
  }
})

postRouter.put('/', async (req, res, next) => {
  try {
    const _id = `post-${dayjs().utc().format('YYYY-MM-DD_HHmm')}-${shortid.generate()}`
    await Post.create({
      _id,
      content: req.body.content,
      user: req.session.user,
      path: req.body.path,
      replyTo: req.body.replyTo,
      like: {
        default: 0
      }
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
