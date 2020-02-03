import { Router } from 'express'
import bodyParser from 'body-parser'

import userRouter from './user'

const apiRouter = Router()
apiRouter.use(bodyParser.json())

apiRouter.get('/', (req, res) => {
  res.sendStatus(200)
})

apiRouter.use('/user', userRouter)

module.exports = apiRouter
