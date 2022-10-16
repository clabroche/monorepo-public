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
const dayjs = require('dayjs')
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
  const {from: fromQuery, to: toQuery} = req.query
  if (!fromQuery) return res.status(400).send('"from" query parameter is required')
  if (!toQuery) return res.status(400).send('"to" query parameter is required')
  const from = dayjs(fromQuery.toString()).startOf('day').toISOString()
  const to = dayjs(toQuery.toString()).endOf('day').toISOString()
  const jwt = getJwt()
  res.json([
    {
      type: 'bestArtists',
      leaderBoard: await HistoryPersistence.getBestArtists(jwt.user_id, from, to)
    },
    {
      type: 'bestTitles',
      leaderBoard: await HistoryPersistence.getBestTitles(jwt.user_id, from, to)
    },
    {
      type: 'features',
      leaderBoard: await HistoryPersistence.getFeatures(jwt.user_id, from, to)
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
