const { launch } = require('@clabroche/common-express');
const { mongo } = require('@clabroche/common-mongo');
const { sockets } = require('@clabroche/common-socket-server')
const PromiseB = require('bluebird')
const CredentialPersistence = require('./models/CredentialPersistence');
const HistoryPersistence = require('./models/HistoryPersistence');

;(async () => {
  const server = await launch({
    mongoDbPrefix: 'spotify-analyzer',
    mongoDbDbName: 'spotify-analyzer',
    port: process.env.PORT || 3204,
    controllers: require('./controllers/index'),
  })
  sockets.connect(server, process.env.URL_FRONT_ADMIN)

  await mongo.collection('histories').createIndex({ ownerId: 1 })
  await mongo.collection('histories').createIndex({
    ownerId:1,
    played_at: -1
  })
  
  intervalWithoutFailed(3 * 1000, [
    CredentialPersistence.refreshAllTokenThatNeedIt,
    CredentialPersistence.detectAllExpiredTokens
  ]).catch(console.error)

  intervalWithoutFailed(30 * 1000, [
    HistoryPersistence.resyncHistory
  ]).catch(console.error)
})()

/**
 * @param {number} ms 
 * @param {(() => Promise<any>)[]} cbs 
 */
async function intervalWithoutFailed(ms, cbs = [] ) {
  setInterval(() => PromiseB.mapSeries(cbs, cb => cb().catch(console.error)), ms);
  await PromiseB.mapSeries(cbs, cb => cb().catch(console.error))
}
