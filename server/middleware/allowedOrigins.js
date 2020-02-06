export default (req, res, next) => {
  if (!(new RegExp(`(${process.env.allowedUrls}${
    process.env.NODE_ENV === 'development' ? '|^/' : ''
  })`).test(req.query.path || req.body.path))) {
    res.sendStatus(403)
  } else {
    next()
  }
}
