const { express } = require('@clabroche/common-express')
const { userIsAuthenticated, getJwt } = require('@clabroche/common-jwt')
const ScreeningPersistence = require('../models/ScreeningPersistence')

const router = express.Router()

router.get('/', userIsAuthenticated, async (req, res, next) => {
  res.json(await ScreeningPersistence.all(req.query.date, req.query.search))
})
module.exports = router
