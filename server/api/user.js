const { Router } = require('express')

const userRouter = Router()
userRouter.use(require('../middleware/secure'))

userRouter.get('/', (req, res) => {
  res.json(req.user)
})

userRouter.post('/login', (req, res) => {
  req.session.user = req.session.user || req.body
  res.sendStatus(201)
})

userRouter.delete('/logout', (req, res) => {
  req.session.user = null
  res.sendStatus(201)
})

module.exports = userRouter
