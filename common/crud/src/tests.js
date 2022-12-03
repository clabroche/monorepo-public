const clonedeep = require('lodash.clonedeep')
const { mongo } = require('@clabroche/common-mongo')
const context = require('@clabroche/common-context')

function setJWT() {
  context.createContext()
  context.setItem('jwt', { roles: ['admin'] })
}
setJWT()
/**
 * 
 * @param {{
 * roles?: Roles,
 * excludedFields?: string[],
 * collectionName: string,
 * classToUse: any,
 * implementedMethods: string[],
 * mock: Object,
 * mockUpdated: Object,
 * additionalFields?: Object,
 * }} param0 
 */
module.exports = ({ roles, excludedFields = [], collectionName, classToUse, implementedMethods, mock: _mock, mockUpdated: _mockUpdated, additionalFields = {} }) => {
  function getRefProperty(mock) {
    return Object.keys(mock).filter(field => !excludedFields.includes(field))[1]
  }
  describe('CRUD', () => {
    const getMock = () => clonedeep(_mock)
    const getMockUpdated = (_id) => Object.assign(clonedeep(_mockUpdated), { _id })
    if (implementedMethods.includes('create')) {
      it('should create ' + collectionName, async () => {
        const mock = getMock()
        const model = await classToUse.create(mock)
        expect(model._id.constructor.name).toBe('ObjectId')
        expect(model._id.toString()).toHaveLength(24)
        expect(model).toEqual(Object.assign(mock, {
          _id: model._id
        }))
        const modelInMongo = await mongo.collection(collectionName).find().toArray()
        expect(modelInMongo).toHaveLength(1)
        expect(model).toEqual(Object.assign(model, {
          _id: modelInMongo[0]._id
        }))
      })
    }
    if (implementedMethods.includes('update')) {
      it('should update ' + collectionName, async () => {
        const mock = getMock()
        const model = await classToUse.create(mock)
        const mockUpdated = getMockUpdated(model._id)
        const modelUpdated = await classToUse.update(mockUpdated)

        expect(modelUpdated._id.constructor.name).toBe('ObjectId')
        expect(modelUpdated._id.toString()).toHaveLength(24)
        expect(modelUpdated).toEqual(Object.assign(model, mockUpdated))
        const modelInMongo = await mongo.collection(collectionName).find().toArray()
        expect(modelInMongo).toHaveLength(1)
        expect(modelUpdated).toEqual(Object.assign(mockUpdated))
      })
    }

    if (implementedMethods.includes('delete')) {
      it('should delete ' + collectionName, async () => {
        const model = await classToUse.create(getMock())
        const modelDeleted = await classToUse.delete(model)
        expect(modelDeleted._id.constructor.name).toBe('ObjectId')
        expect(modelDeleted._id.toString()).toHaveLength(24)
        expect(modelDeleted).toEqual(model)
        const modelInMongo = await mongo.collection(collectionName).find().toArray()
        expect(modelInMongo).toHaveLength(0)
      })
    }

    if (implementedMethods.includes('getBy')) {
      it('should getBy ' + collectionName, async () => {
        const mock = getMock()
        await classToUse.create(mock)
        const model = await classToUse.getBy({
          [getRefProperty(mock)]: mock[getRefProperty(mock)]
        })
        expect(model._id.constructor.name).toBe('ObjectId')
        expect(model._id.toString()).toHaveLength(24)
        expect(model).toEqual(mock)
      })
    }

    if (implementedMethods.includes('allBy')) {
      const insertMocks = async () => {
        const mock = getMock()
        const refProperty = getRefProperty(mock)
        await classToUse.create(mock)
        await classToUse.create(Object.assign(getMock(), { [refProperty]: mock[refProperty] + 1 }))
        await classToUse.create(Object.assign(getMock(), { [refProperty]: mock[refProperty] + 1 }))
        await classToUse.create(Object.assign(getMock(), { [refProperty]: mock[refProperty] + 1 }))
        return { mock, refProperty }
      }
      it(`should allBy ${collectionName}`, async () => {
        const { mock } = await insertMocks()
        const models = await classToUse.allBy()
        expect(models).toHaveLength(4)
        const model = models.shift()
        expect(model._id.constructor.name).toBe('ObjectId')
        expect(model._id.toString()).toHaveLength(24)
        expect(model).toEqual(mock)
      })

      it(`should allBy ${collectionName} with filter`, async () => {
        const { mock, refProperty } = await insertMocks()
        const filteredModels = await classToUse.allBy({
          filter: {
            [refProperty]: mock[refProperty]
          }
        })
        expect(filteredModels).toHaveLength(1)
        expect(filteredModels[0]).toEqual(mock)
      })

      it(`should allBy ${collectionName} with sort`, async () => {
        const { mock, refProperty } = await insertMocks()
        const modelsSorted = await classToUse.allBy({ sort: { [refProperty]: -1 } })
        expect(modelsSorted).toHaveLength(4)
        expect(modelsSorted.pop()).toEqual(mock)
      })

      it(`should allBy ${collectionName} with skip`, async () => {
        await insertMocks()
        const modelsSkip = await classToUse.allBy({ skip: 1 })
        expect(modelsSkip).toHaveLength(3)
      })

      it(`should allBy ${collectionName} with limit`, async () => {
        await insertMocks()
        const modelsLimit = await classToUse.allBy({ limit: 1 })
        expect(modelsLimit).toHaveLength(1)
      })
    }

    if (implementedMethods.includes('save')) {
      it(`should save (create) ${collectionName}`, async () => {
        const mock = getMock()
        excludedFields.forEach(field => {
          mock[field] = undefined
        });
        const model = await new classToUse(mock)
        const modelSaved = await model.save()
        expect(modelSaved._id.constructor.name).toBe('ObjectId')
        expect(modelSaved._id.toString()).toHaveLength(24)
        expect(modelSaved).toEqual(Object.assign(mock, {
          _id: modelSaved._id
        }, additionalFields || {}))
        const modelInMongo = await mongo.collection(collectionName).find().toArray()
        expect(modelInMongo).toHaveLength(1)
        expect(modelInMongo[0]._id).toEqual(modelSaved._id)
      })
      it(`should save (update)${collectionName}`, async () => {
        const mock = getMock()
        excludedFields.forEach(field => {
          mock[field] = undefined
        });
        const model = await new classToUse(mock)
        await model.save()
        model[getRefProperty(mock)] = '123456'
        const modelUpdated = await model.save()
        expect(modelUpdated._id.constructor.name).toBe('ObjectId')
        expect(modelUpdated._id.toString()).toHaveLength(24)
        expect(modelUpdated).toEqual(Object.assign(mock, {
          _id: modelUpdated._id,
          [getRefProperty(mock)]: '123456'
        }))
        const modelInMongo = await mongo.collection(collectionName).find().toArray()
        expect(modelInMongo).toHaveLength(1)
        expect(modelInMongo[0]._id).toEqual(modelUpdated._id)
      })
    }

    if (implementedMethods.includes('updateOrCreate')) {
      it(`should updateOrCreate (create) ${collectionName}`, async () => {
        const mock = getMock()
        Object.keys(mock).forEach(key => {
          mock[key] = undefined
        })
        const modelSaved = await classToUse.updateOrCreate(mock)
        expect(modelSaved._id.constructor.name).toBe('ObjectId')
        expect(modelSaved._id.toString()).toHaveLength(24)
        delete modelSaved._id
        expect(modelSaved).toEqual(Object.assign(mock, additionalFields))
        const modelInMongo = await mongo.collection(collectionName).find().toArray()
        expect(modelInMongo).toHaveLength(1)
        delete modelInMongo[0]._id
        expect(modelInMongo[0]._id).toEqual(modelSaved._id)
      })
      it(`should updateOrCreate (update)${collectionName}`, async () => {
        const mock = getMock()
        const model = await classToUse.updateOrCreate(mock)
        const modelUpdated = await classToUse.updateOrCreate(Object.assign(model, {
          [getRefProperty(mock)]: '123456'
        }))
        expect(modelUpdated._id.constructor.name).toBe('ObjectId')
        expect(modelUpdated._id.toString()).toHaveLength(24)
        expect(modelUpdated).toEqual(Object.assign(mock, {
          _id: modelUpdated._id,
          [getRefProperty(mock)]: '123456'
        }))
        const modelInMongo = await mongo.collection(collectionName).find().toArray()
        expect(modelInMongo).toHaveLength(1)
        expect(modelInMongo[0]._id).toEqual(modelUpdated._id)
      })
    }
  })
}

/**
 * @typedef {{
 * [key: string]: {
 *  permissions: string[],
 *  shouldUpdate : boolean,
 *  shouldCreate : boolean,
 *  shouldGet : boolean,
 *  shouldDelete : boolean,
 * }
 * }} Roles
 */