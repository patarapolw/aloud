import { Router } from 'express'
import secureMiddleware from '../middleware/secure'

const userRouter = Router()
userRouter.use(secureMiddleware)

userRouter.get('/', (req, res) => {
  res.json(req.user)
})

userRouter.post('/login', (req, res) => {
  req.session.user = req.session.user || req.body
  res.sendStatus(201)
})

userRouter.delete('/logout', (req, res) => {
  req.session.destroy()
  res.sendStatus(201)
})

export default userRouter
