const { launch } = require('@clabroche-org/common-express');
const PromiseB = require('bluebird')

;(async () => {
  const server = await launch({
    mongoDbPrefix: 'ugc-explorer',
    mongoDbDbName: 'ugc-explorer',
    port: process.env.PORT || 3204,
    controllers: require('./controllers/index'),
  })
  return server
})()
