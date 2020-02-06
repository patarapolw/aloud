import fs from 'fs'

import { Router } from 'express'
import cloudinary from 'cloudinary'
import multer from 'multer'
import sharp from 'sharp'

import secureMiddleware from '../middleware/secure'
import allowedOrigins from '../middleware/allowedOrigins'

const router = Router()
router.use(secureMiddleware)

const upload = multer({ dest: './tmp' })

router.post('/upload', upload.single('file'), allowedOrigins, async (req, res, next) => {
  try {
    await sharp(req.file.path)
      .resize(800)
      .toFile(req.file.path)

    cloudinary.v2.config({
      api_key: process.env.cloudinary_apiKey,
      api_secret: process.env.cloudinary_apiSecret,
      cloud_name: process.env.cloudinary_cloudName
    })

    const r = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: process.env.cloudinary_folder,
      use_filename: false,
      context: req.body
    })

    fs.unlinkSync(req.file.path)

    res.json(r)
  } catch (e) {
    next(e)
  }
})

export default router
