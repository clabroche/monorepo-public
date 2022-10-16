const dayjs = require('dayjs');
const SpotifyWebApi = require('spotify-web-api-node');
const redirectUri = `${process.env.URL_CORE}/api/spotify/callback`
const clientId = process.env.secretId
const clientSecret = process.env.secretKey

function getClient(access_token, refresh_token) {
  const spotifyApi = new SpotifyWebApi({
    redirectUri,
    clientId,
    clientSecret
  });
  if (access_token) spotifyApi.setAccessToken(access_token)
  if (refresh_token) spotifyApi.setRefreshToken(refresh_token)
  return spotifyApi 
}



module.exports = {
  getClient,
  async authorization(code, spotify = getClient()) {
    const {body}  = await spotify.authorizationCodeGrant(code)
    const expires_in = body['expires_in']
    const expires_at = dayjs().add(expires_in, 'seconds').toISOString()
    const access_token = body['access_token']
    const refresh_token = body['refresh_token']
    return { expires_in, access_token, refresh_token, expires_at }
  }
}