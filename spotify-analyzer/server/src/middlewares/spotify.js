const { getJwt } = require('@clabroche/common-jwt')
const { User } = require('@clabroche/mybank-modules-auth').models
const Credential = require('../models/CredentialPersistence')
const { getClient } = require('../services/spotify')
const dayjs = require('dayjs')
module.exports = {
  shouldBeConnectedToSpotify: async(req, res, next) => {
    const jwt = getJwt()
    const user = await User.findOne({ _id: jwt.user_id })
    const spotifyCredentials = await Credential.findOne({ ownerId: user._id })
    if(!spotifyCredentials) return res.status(441).send('User not connected to spotify')
    const client = getClient(spotifyCredentials.access_token, spotifyCredentials.refresh_token)
    const me = await client.getMe().catch(err => null)
    if (!me) return res.status(441).send('User not connected to spotify')
    next()
  }
}