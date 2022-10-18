const { express } = require('@clabroche-org/common-express')
const { userIsAuthenticated } = require('@clabroche-org/common-jwt')
const AlbumPersistence = require('../models/AlbumPersistence')
const router = express.Router()

router.post('/', userIsAuthenticated, async (req, res, next) => {
  const albums = await AlbumPersistence.find(req.body)
  res.json(albums)
})
module.exports = router
