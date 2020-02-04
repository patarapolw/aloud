import { Router } from 'express'
import bodyParser from 'body-parser'

import userRouter from './user'
import postRouter from './post'

const apiRouter = Router()
apiRouter.use(bodyParser.json())

apiRouter.get('/', (req, res) => {
  res.sendStatus(200)
})

apiRouter.use('/user', userRouter)
apiRouter.use('/post', postRouter)

export default apiRouter
