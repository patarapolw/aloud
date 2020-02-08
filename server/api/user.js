import { Router } from 'express'
import secureMiddleware from '../middleware/secure'

const userRouter = Router()
// userRouter.use(secureMiddleware)

userRouter.get('/', secureMiddleware, (req, res) => {
  res.json(req.user)
})

userRouter.post('/login', secureMiddleware, (req, res) => {
  req.session.user = req.session.user || req.body
  res.sendStatus(201)
})

userRouter.delete('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    err ? next(err) : res.sendStatus(201)
  })
})

export default userRouter
