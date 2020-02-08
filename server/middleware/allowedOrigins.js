export default (req, res, next) => {
  if (!(new RegExp(`(${process.env.allowedUrls})`).test(req.headers['x-aloud-path']))) {
    res.sendStatus(403)
  } else {
    next()
  }
}
