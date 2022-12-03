const { express } = require('@clabroche/common-express')
const { userIsAuthenticated, getJwt } = require('@clabroche/common-jwt')
const TrackPersistence = require('../models/TrackPersistence')
const router = express.Router()

router.post('/', userIsAuthenticated, async (req, res, next) => {
  const tracks = await TrackPersistence.find(req.body)
  res.json(tracks)
})

module.exports = router
