const { Router } = require('express')

const userRouter = Router()
userRouter.use(require('../middleware/secure'))

userRouter.get('/', (req, res) => {
  res.json(req.session.user)
})

userRouter.post('/login', (req, res) => {
  req.session.user = req.body
  res.status(201).json(res.body)
})

userRouter.delete('/logout', (req, res) => {
  req.session.user = null
  res.sendStatus(201)
})

module.exports = userRouter
