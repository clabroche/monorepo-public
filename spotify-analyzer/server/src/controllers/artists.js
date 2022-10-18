const { express } = require('@clabroche-org/common-express')
const { userIsAuthenticated } = require('@clabroche-org/common-jwt')
const ArtistPersistence = require('../models/ArtistPersistence')
const router = express.Router()

router.post('/', userIsAuthenticated, async (req, res, next) => {
  const artists = await ArtistPersistence.find(req.body)
  res.json(artists)
})

module.exports = router
