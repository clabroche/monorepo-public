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
  const [
    getBestArtists,
    getBestTitles,
    getFeatures,
    getNbDifferentArtists,
    getNewArtists,
    getGenres,
    getNbListeningByDays,
    getListeningTopHours,
    getListeningTopDays,
  ] = await Promise.all([
    HistoryPersistence.getBestArtists(jwt.user_id, from, to),
    HistoryPersistence.getBestTitles(jwt.user_id, from, to),
    HistoryPersistence.getFeatures(jwt.user_id, from, to),
    HistoryPersistence.getNbDifferentArtists(jwt.user_id, from, to),
    HistoryPersistence.getNewArtists(jwt.user_id, from, to),
    HistoryPersistence.getGenres(jwt.user_id, from, to),
    HistoryPersistence.getNbListeningByDays(jwt.user_id, from, to),
    HistoryPersistence.getListeningTopHours(jwt.user_id, from, to),
    HistoryPersistence.getListeningTopDays(jwt.user_id, from, to),
  ])
  res.json([{
    type: 'bestArtists',
    leaderBoard: getBestArtists
  }, {
    type: 'bestTitles',
    leaderBoard: getBestTitles
  }, {
    type: 'features',
    leaderBoard: getFeatures
  }, {
    type: 'differentArtists',
    nbDifferentArtists: getNbDifferentArtists,
    newArtists: getNewArtists
  }, {
    type: 'genres',
    genres: getGenres,
  }, {
    type: 'listeningByDays',
    value: getNbListeningByDays,
  }, {
    type: 'listeningTopHours',
    value: getListeningTopHours,
  }, {
    type: 'listeningTopDays',
    value: getListeningTopDays,
  }])
})
module.exports = router
