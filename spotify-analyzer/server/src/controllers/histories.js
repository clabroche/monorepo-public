const { express } = require('@clabroche-org/common-express')
const { userIsAuthenticated, getJwt } = require('@clabroche-org/common-jwt')
const { shouldBeConnectedToSpotify } = require('../middlewares/spotify')
const { User } = require('@clabroche-org/mybank-modules-auth').models
const ArtistPersistence = require('../models/ArtistPersistence')
const HistoryPersistence = require('../models/HistoryPersistence')
const TrackPersistence = require('../models/TrackPersistence')
const { getClient } = require('../services/spotify')
const CredentialPersistence = require('../models/CredentialPersistence')
const {sockets} = require('@clabroche-org/common-socket-server')
const PromiseB = require('bluebird')
const fse = require('fs-extra')
const multer = require('multer')
const pathfs = require('path')
const upload = multer({ dest: pathfs.resolve(__dirname, '..', '..', 'upload') })

const router = express.Router()

router.get('/', userIsAuthenticated, shouldBeConnectedToSpotify, async (req, res, next) => {
  const jwt = getJwt()
  const user = await User.findOne({ _id: jwt.user_id })
  const allHistory = await HistoryPersistence.find({ filter: { ownerId: user._id }, sort: { played_at: -1 } })
  res.json(allHistory)
})
router.post('/', userIsAuthenticated, shouldBeConnectedToSpotify, async (req, res, next) => {
  const jwt = getJwt()
  const user = await User.findOne({ _id: jwt.user_id })
  const allHistory = await HistoryPersistence.find({ filter: { ownerId: user._id }, sort: { played_at: -1 } })
  const credentials = await CredentialPersistence.findOne({ownerId: user._id})
  await HistoryPersistence.parseHistory(
    getClient(credentials.access_token, credentials.refresh_token),
    user
  )
  await ArtistPersistence.enrich()
  await TrackPersistence.enrich()
  sockets.emit(user.email, 'update:histories')
  res.json(allHistory)
})

router.post('/import', userIsAuthenticated, shouldBeConnectedToSpotify, upload.any(), async (req, res, next) => {
  const files = req.files
  const jwt = getJwt()
  const user = await User.findOne({ _id: jwt.user_id })
  if(files) {
    const jsons = await PromiseB.reduce(files, async (acc, file) => {
      const json = await fse.readJSON(file.path, {encoding:'utf-8'})
      acc.push(...json)
      return acc
    }, []) 
    await HistoryPersistence.importFromFile(user._id, jsons)
  }
  res.json('ok')
})

module.exports = router
