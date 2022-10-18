const { express } = require('@clabroche-org/common-express')
const { userIsAuthenticated, getJwt } = require('@clabroche-org/common-jwt')
const HistoryPersistence = require('../models/HistoryPersistence')
const dayjs = require('dayjs')
const router = express.Router()

router.get('/', userIsAuthenticated, async (req, res, next) => {
  const {from: fromQuery, to: toQuery} = req.query
  if (!fromQuery) return res.status(400).send('"from" query parameter is required')
  if (!toQuery) return res.status(400).send('"to" query parameter is required')
  const from = dayjs(fromQuery.toString()).startOf('day').toISOString()
  const to = dayjs(toQuery.toString()).endOf('day').toISOString()
  const jwt = getJwt()
  res.json([{
    type: 'bestArtists',
    leaderBoard: await HistoryPersistence.getBestArtists(jwt.user_id, from, to)
  }, {
    type: 'bestTitles',
    leaderBoard: await HistoryPersistence.getBestTitles(jwt.user_id, from, to)
  }, {
    type: 'features',
    leaderBoard: await HistoryPersistence.getFeatures(jwt.user_id, from, to)
  }, {
    type: 'differentArtists',
    nbDifferentArtists: await HistoryPersistence.getNbDifferentArtists(jwt.user_id, from, to),
    newArtists: await HistoryPersistence.getNewArtists(jwt.user_id, from, to)
  }, {
    type: 'genres',
    genres: await HistoryPersistence.getGenres(jwt.user_id, from, to),
  }, {
    type: 'listeningByDays',
    value: await HistoryPersistence.getNbListeningByDays(jwt.user_id, from, to),
  }, {
    type: 'listeningTopHours',
    value: await HistoryPersistence.getListeningTopHours(jwt.user_id, from, to),
  }, {
    type: 'listeningTopDays',
    value: await HistoryPersistence.getListeningTopDays(jwt.user_id, from, to),
  }])
})
module.exports = router
