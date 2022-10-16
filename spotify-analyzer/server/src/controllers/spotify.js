const { express } = require('@clabroche-org/common-express')
const { userIsAuthenticated, getJwt } = require('@clabroche-org/common-jwt')
const { mongo } = require('@clabroche-org/common-mongo')
const { shouldBeConnectedToSpotify } = require('../middlewares/spotify')
const Credential = require('../models/Credential')
const { User } = require('@clabroche-org/mybank-modules-auth').models
const spotify = require('../services/spotify')
const ArtistPersistence = require('../models/Artist')
const HistoryPersistence = require('../models/History')
const TrackPersistence = require('../models/Track')
const AlbumPersistence = require('../models/Album')
const router = express.Router()

router.get('/recently-played', userIsAuthenticated, shouldBeConnectedToSpotify, async (req, res, next) => {
  const jwt = getJwt()
  const user = await User.findOne({ _id: jwt.user_id })
  const allHistory = await HistoryPersistence.find({ filter: { ownerId: user._id }, sort: {played_at: -1}})
  res.json(allHistory)
})

router.post('/tracks', userIsAuthenticated, async (req, res, next) => {
  const tracks = await TrackPersistence.find(req.body)
  res.json(tracks)
})
router.post('/albums', userIsAuthenticated, async (req, res, next) => {
  const albums = await AlbumPersistence.find(req.body)
  res.json(albums)
})

router.post('/artists', userIsAuthenticated, async (req, res, next) => {
  const artists = await ArtistPersistence.find(req.body)
  res.json(artists)
})


router.get('/stats', userIsAuthenticated, async (req, res, next) => {
  const jwt = getJwt()
  res.json([
    {
      type: 'bestArtists',
      leaderBoard: await HistoryPersistence.getBestArtists(mongo.getID(jwt.user_id))
    },
    {
      type: 'bestTitles',
      leaderBoard: await HistoryPersistence.getBestTitles(mongo.getID(jwt.user_id))
    },
    {
      type: 'features',
      leaderBoard: await HistoryPersistence.getFeatures(mongo.getID(jwt.user_id))
    }
  ])
})
router.get('/callback', async (req, res, next) => {
  const {code, state} = req.query
  const {ownerId} = JSON.parse(state?.toString() || '')
  let credential = await Credential.findOne({
    ownerId: mongo.getID(ownerId),
  }) 
  if(!credential) credential = new Credential({
    ownerId: mongo.getID(ownerId),
  })
  const {access_token, refresh_token, expires_in, expires_at} = await spotify.authorization(code) 
  credential.access_token = access_token
  credential.refresh_token = refresh_token
  credential.expires_in = expires_in
  credential.expires_at = expires_at
  credential.alreadyNotifyed = false
  await credential.save()
  res.redirect(process.env.URL_FRONT_ADMIN)
})

router.get('/oauth-url', userIsAuthenticated, async (req, res, next) => {
  const jwt = getJwt()
  const url = spotify.getClient().createAuthorizeURL(['user-read-recently-played'], `{"ownerId":"${jwt.user_id}"}`)
  res.send(url)
})
module.exports = router
