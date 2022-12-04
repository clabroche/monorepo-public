const morgan = require('morgan')
const express = require('express')
const { initSwagger } = require('@clabroche/common-swagger')
const swagger = require('@clabroche/common-swagger')
const morganBody = require('morgan-body')
const { mongo } = require('@clabroche/common-mongo')
const Logger = require('@clabroche/common-express-logger')
const logger = new Logger()
const cors = require('cors');
const pathfs = require('path')
const fs = require('fs')
const asciify = require('asciify')
const context = require('@clabroche/common-context').middleware
const helmet = require("helmet");
const path = require('path')

require('express-async-errors');

module.exports = {
  launch: async ({
    port = process.env.PORT || 4002,
    mongoDbURL = process.env.MONGO_URL,
    mongoDbPrefix = '',
    mongoDbDbName = '',
    baseUrl = __dirname,
    beforeAll = () => console.log('No before all function for express'),
    afterAll = () => console.log('No after all function for express'),
    controllers = (req, res, next) => { console.log('No controllers added') },
    globalControllers = (req, res, next) => { console.log('No static controllers added') },
    static = null,
    noGreetings = false
  }) => {
    const pkgJSONPath = pathfs.resolve(baseUrl, 'package.json')
    const isPkgJSONExists = fs.existsSync(pkgJSONPath)
    const pkgJSON = isPkgJSONExists ? require(pkgJSONPath) : { name: 'unknown', version: 'unknown' }
    const appVersion = pkgJSON.version
    const appName = pkgJSON.name

    const app = express()
    app.use(helmet())

    console.log('Enable cors...')
    app.use(cors())

    console.log('Enable JSON body...')
    app.use(express.json({ limit: '50mb' }))
    app.use(express.urlencoded({ extended: true }))

    console.log('Enable Logger...')
    logger.init({
      path: pathfs.resolve(baseUrl, 'logs-express')
    })
    app.use(morgan('combined', { stream: logger.accessLogStream }))
    app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" :response-time ms ":user-agent"'))
    // @ts-ignore
    morganBody(app, {
      noColors: true,
      stream: logger.accessLogStream,
      includeNewLine: true,
    })

    console.log('Enable swagger...')
    app.use(swagger)
    initSwagger({ appVersion, baseUrl, appName })
      .catch(err => console.error(`Swagger error: ${err?.message || err}`))

    console.log('Apply additional routes...')
    app.use(context)
    // app.use('/', globalControllers)
    app.use('/api/', controllers)
    if (!noGreetings) {
      app.get('/', (req, res) => res.json({ appName, appVersion }))
    }

    if (static) {
      app.use(static);
      app.use((req, res) => {
        res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
      });
    }

    console.log('Enable error handling...')
    app.use(require('@clabroche/common-express-error-handler')({ logger }))

    console.log('Enable 404 handling...')
    app.use(require('@clabroche/common-express-404'))

    if (mongoDbURL) {
      console.log('Enable Mongodb...')
      const dbName = mongoDbDbName || mongoDbURL.split('/').pop().split('?').shift()
      const prefix = mongoDbPrefix || mongoDbURL.split('/').pop().split('?').shift()
      await mongo.connect(mongoDbURL, prefix, dbName)
    } else {
      console.log('Launch without mongo collection')
    }

    console.log('Apply additional tasks before launch...')
    await beforeAll()

    console.log('Launch...')
    const server = app.listen(port, function () {
      asciify(appName.replace('@clabroche/', '').replace('service-', ''), { font: 'starwars' }, (err, _appName) => {
        console.log(_appName)
        console.log(`v${appVersion} started, listening on port ${port}.`)
      })
    })
    server.on('close', async function () {
      mongoDbURL
        ? await mongo.close()
        : console.log('No mongoDbURL')
      await afterAll()
    })
    return server
  },
  express
}
