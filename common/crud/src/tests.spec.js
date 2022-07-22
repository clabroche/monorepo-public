// @ts-ignore
process.env.MONGODB_ENV_URL = global.__MONGO_URI__ + '?authSource=admin'
const { CRUDTests } = require('.')
const { mongo } = require('@clabroche-org/common-mongo')
const collectionName = require('../tests/MockUser').collectionName
const Mock = require('../tests/MockUser')
const Base = require('../src/base')
const base = Base({ collectionName })
const allMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(base)).filter(a => a !== 'constructor')
describe('Crud > base.js', () => {
  beforeAll(async () => {
    await mongo.connect(process.env.MONGODB_ENV_URL, 'engine')
  })
  afterAll(async () => {
    await mongo.close()
  })
  beforeEach(async () => {
    await mongo.collection(collectionName).deleteMany({})
  })
  CRUDTests({
    excludedFields: ['password'],
    collectionName: collectionName,
    classToUse: Mock,
    implementedMethods: allMethods,
    mock: {
      email: 'test@test.test',
      lastname: 'test',
      firstname: 'test',
    },
    mockUpdated: {
      email: 'test@test.fr',
    }
  })
})
