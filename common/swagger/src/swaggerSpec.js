const swaggerJSDoc = require("swagger-jsdoc")
const pathfs = require('path')
const walker = require('./walker')

module.exports = {
  async getSwaggerSpec({ appVersion, baseUrl, appName }) {
    /**
     * Documentation
     */
    const options = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'API ' + appName,
          version: appVersion,
        },
      },
      apis: await walker.import(baseUrl, pathfs.resolve(__dirname))
    }
    return swaggerJSDoc(options)
  }
}
