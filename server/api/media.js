import { Router } from 'express'
import cloudinary from 'cloudinary'
import multer from 'multer'
import sharp from 'sharp'
import rimraf from 'rimraf'

import secureMiddleware from '../middleware/secure'
import allowedOrigins from '../middleware/allowedOrigins'

const router = Router()
router.use(secureMiddleware)

const upload = multer({ dest: './tmp' })

router.post('/upload', upload.single('file'), allowedOrigins, async (req, res, next) => {
  try {
    if (!req.file.mimetype.startsWith('image/')) {
      throw new Error('Not an image')
    }

    await sharp(req.file.path)
      .resize(800)
      .toFile(`${req.file.path}-reized`)

    cloudinary.v2.config({
      api_key: process.env.cloudinary_apiKey,
      api_secret: process.env.cloudinary_apiSecret,
      cloud_name: process.env.cloudinary_cloudName
    })

    const r = await cloudinary.v2.uploader.upload(`${req.file.path}-reized`, {
      folder: process.env.cloudinary_folder,
      use_filename: false,
      context: {
        ...req.body,
        path: req.headers['x-aloud-path']
      }
    })

    rimraf.sync(`${req.file.path}*`)
    res.json(r)
  } catch (e) {
    rimraf.sync(`${req.file.path}*`)
    next(e)
  }
})

export default router
