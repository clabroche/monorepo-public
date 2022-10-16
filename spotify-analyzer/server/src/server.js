const { mongo } = require('@clabroche-org/common-mongo')
const { launch } = require('@clabroche-org/common-express')
const path = require('path')
const { readFileSync } = require('fs-extra');
const reconnectTemplate = readFileSync(path.resolve(__dirname, 'templatesEmail','reconnect.html'), 'utf-8')
const { sockets } = require('@iryu54/room-lib-server')
const { Rooms } = require('@iryu54/room-lib-server').models

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
  .then(async(server)=> {
    sockets.connect(server)
    try {
      setInterval(async() => {
        await refreshAllTokenThatNeedIt().catch(console.error)
        await detectAllExpiredTokens().catch(console.error)
      }, 3000);
      setInterval(async () => {
        await resyncHistory().catch(console.error)
      }, 30 * 1000);
      await detectAllExpiredTokens().catch(console.error)
      await refreshAllTokenThatNeedIt().catch(console.error)
      await resyncHistory().catch(console.error)
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
    const emailsToNotify = []
    await PromiseB.map(credentialNotExpired, async credential => {
      try {
        const user = await User.findOne({ _id: mongo.getID(credential.ownerId) })
        const client = getClient(credential.access_token, credential.refresh_token)
        const lastHistory = await HistoryPersistence.find({
        filter: {ownerId: user._id},
          sort: {played_at: -1}
        })
        await HistoryPersistence.parseHistory(client, user)
        const newLastHistory = await HistoryPersistence.find({
          filter: { ownerId: user._id },
          sort: { played_at: -1 }
        })
        if(newLastHistory[0]._id?.toString() !== lastHistory[0]._id?.toString()) {
          emailsToNotify.push(user.email)
        }
      } catch (error) {
        console.error(error)
      }
    })
    
    await ArtistPersistence.enrich()
    await TrackPersistence.enrich()
    setTimeout(() => {
      emailsToNotify.map(email => sockets.io.to(email).emit('update:histories'))
    }, 100);
  } catch (error) {
    console.error(error)
  }
  
}
