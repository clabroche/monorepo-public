const { express } = require('@clabroche/common-express')
const { userIsAuthenticated, getJwt } = require('@clabroche/common-jwt')
const { mongo } = require('@clabroche/common-mongo')
const Credential = require('../models/CredentialPersistence')
const spotify = require('../services/spotify')
const router = express.Router()

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
  res.redirect(process.env.URL_FRONT_ADMIN || '')
})

router.get('/oauth-url', userIsAuthenticated, async (req, res, next) => {
  const jwt = getJwt()
  const url = spotify.getClient().createAuthorizeURL(['user-read-recently-played'], `{"ownerId":"${jwt.user_id}"}`)
  res.send(url)
})
module.exports = router
