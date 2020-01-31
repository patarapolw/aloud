const { Router } = require('express')
const bodyParser = require('body-parser')

const apiRouter = Router()
apiRouter.use(bodyParser.json())

apiRouter.get('/', (req, res) => {
  res.sendStatus(200)
})

apiRouter.use('/user', require('./user'))

module.exports = apiRouter
