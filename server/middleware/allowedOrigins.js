export default (req, res, next) => {
  if (!(new RegExp(`(${process.env.default_allowedUrls}|^/)`).test(req.query.path || req.body.path))) {
    res.sendStatus(403)
  } else {
    next()
  }
}
