const express = require('express')
const router = express.Router()
const swaggerUi = require('swagger-ui-express')
const {getSwaggerSpec} = require('./swaggerSpec')

module.exports = router
module.exports.initSwagger = async function({appVersion, baseUrl, appName}) {
  const swaggerSpec = await getSwaggerSpec({ appVersion, baseUrl, appName })
  router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {explorer: true}))
  router.get('/swagger.json', async (_req, res) => {
    res.json(swaggerSpec)
  })
}