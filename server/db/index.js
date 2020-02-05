import mongoose from 'mongoose'

const PostSchema = mongoose.Schema({
  _id: String,
  content: { type: String, required: true },
  user: { type: mongoose.SchemaTypes.Mixed, required: true },
  like: { type: mongoose.SchemaTypes.Mixed, default: () => ({ default: 0 }) },
  replyTo: { type: String, index: true },
  path: {
    type: String,
    validate: (p) => {
      return new RegExp(`(${process.env.default_allowedUrls}|^/)`).test(p)
    },
    index: true
  }
}, { timestamps: true })

export const Post = mongoose.model('Post', PostSchema)