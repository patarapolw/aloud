import { URL } from 'url'

import axios from 'axios'
import domino from 'domino'
import { getMetadata } from 'page-metadata-parser'

export default async function(req, res, next) {
  const url = new URL(
    req.url,
    process.env.BASE_URL || 'http://localhost'
  ).searchParams.get('q')

  if (!url) {
    next(new Error('No URL is found'))
  }

  const r = await axios.get(url, {
    transformResponse: (d) => d
  })

  const doc = domino.createWindow(r.data).document

  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(getMetadata(doc, url)))
}
