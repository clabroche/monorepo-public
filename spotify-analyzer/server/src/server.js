const { mongo } = require('@clabroche-org/common-mongo')
const { launch } = require('@clabroche-org/common-express')
const path = require('path')
const { readFileSync } = require('fs-extra');
const reconnectTemplate = readFileSync(path.resolve(__dirname, 'templatesEmail','reconnect.html'), 'utf-8')

  ; const spotify = require('./services/spotify');
; const PromiseB = require('bluebird');
const CredentialPersistence = require('./models/Credential');
const dayjs = require('dayjs');
const { getClient } = require('./services/spotify');
const sendinblue = require('./services/sendinblue');
const TrackPersistence = require('./models/Track');
const HistoryPersistence = require('./models/History');
const ArtistPersistence = require('./models/Artist');
const { User } = require('@clabroche-org/mybank-modules-auth').models;

(async () => {
  await launch({
    mongoDbPrefix: 'spotify-analyzer',
    mongoDbDbName: 'spotify-analyzer',
    port: process.env.PORT || 3204,
    controllers: require('./controllers/index'),
  })
  .then(async()=> {
    try {
      setInterval(async() => {
        refreshAllTokenThatNeedIt().catch(console.error)
        detectAllExpiredTokens().catch(console.error)
        resyncHistory().catch(console.error)
      }, 3000);
      setInterval(async () => {
        TrackPersistence.enrich().catch(console.error)
        ArtistPersistence.enrich().catch(console.error)
      }, 2 * 60 * 1000);
      detectAllExpiredTokens().catch(console.error)
      refreshAllTokenThatNeedIt().catch(console.error)
        .then(() => {
          resyncHistory().catch(console.error)
          ArtistPersistence.enrich().catch(console.error)
          TrackPersistence.enrich().catch(console.error)
        })
    } catch (error) {
      console.error(error)      
    }
  })
})()

async function refreshAllTokenThatNeedIt() {
  try {
    const credentialExpiresSoon = await CredentialPersistence.find({
      filter: {
        expires_at: {
          $lt: dayjs().add(2, 'minutes').toISOString(),
          $gt: dayjs().subtract(1,'second').toISOString()
        }
      }
    })
    await PromiseB.map(credentialExpiresSoon, async credential => {
      try {
        const client = getClient(credential.access_token, credential.refresh_token)
        const res = await client.refreshAccessToken()
        const { access_token, expires_in, refresh_token } = res.body
        credential.access_token = access_token
        credential.expires_in = expires_in
        credential.expires_at = dayjs().add(expires_in, 'seconds').toISOString()
        if (refresh_token) credential.refresh_token = refresh_token
        await credential.save()
      } catch (error) {
        
      }
    }, { concurrency: 5 })
  } catch (error) {
    console.error(error)
  }
}
async function detectAllExpiredTokens() {
  try {
    const credentialExpiresSoon = await CredentialPersistence.find({
      filter: {
        alreadyNotifyed: {$ne: true},
        expires_at: {
          $lt: dayjs().subtract(1, 'second').toISOString()
        }
      }
    })
    await PromiseB.map(credentialExpiresSoon, async credential => {
      try {
        credential.alreadyNotifyed = true
        credential.save()
        const user = await User.findOne({
          _id: mongo.getID(credential.ownerId)
        })
        await sendinblue.send(user.email, user.email, reconnectTemplate)
        console.log('send' , user.email)
      } catch (error) {
        console.error(error)
      }
    }, { concurrency: 5 })
  } catch (error) {
    console.error(error)
  }
}

async function resyncHistory() {
  try {
    const credentialNotExpired = await CredentialPersistence.find({
      filter: {
        expires_at: {
          $gt: dayjs().toISOString()
        }
      }
    })
    await PromiseB.map(credentialNotExpired, async credential => {
      try {
        const user = await User.findOne({ _id: mongo.getID(credential.ownerId) })
        const client = getClient(credential.access_token, credential.refresh_token)
        await HistoryPersistence.parseHistory(client, user)
      } catch (error) {
        console.error(error)
      }
    })
  } catch (error) {
    console.error(error)
  }
  
}
