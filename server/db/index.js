import mongoose from 'mongoose'

const PostSchema = mongoose.Schema({
  _id: String,
  content: { type: String, required: true },
  user: { type: mongoose.SchemaTypes.Mixed, required: true },
  like: { type: mongoose.SchemaTypes.Mixed, default: () => ({}) },
  replyTo: { type: String, index: true },
  path: {
    type: String,
    validate: (p) => {
      return new RegExp(`(${process.env.allowedUrls}${
        process.env.NODE_ENV === 'development' ? '|^/' : ''
      })`).test(p)
    },
    index: true
  }
}, { timestamps: true })

export const Post = mongoose.model('Post', PostSchema)
