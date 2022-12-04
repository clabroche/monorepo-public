// @ts-ignore
process.env.MONGODB_ENV_URL = global.__MONGO_URI__ + '?authSource=admin'
const Base = require('./base')
const collectionName = 'test'
const { mongo } = require('@clabroche/common-mongo')
const Mock = require('../tests/MockUser')

describe('Crud > base.js', () => {
  beforeAll(async () => {
    await mongo.connect(process.env.MONGODB_ENV_URL, 'engine')
  })
  afterAll(async () => {
    await mongo.close()
  })
  beforeEach(async () => {
    await mongo.collection('test').deleteMany({})
  })
  it('should track correct collectionName', () => {
    const base = Base({ collectionName: collectionName })
    expect(base.collectionName).toBe(collectionName)
  })

  describe('getBy', () => {
    it('should getBy', async () => {
      const mock = { email: "1" }
      await mongo.collection(collectionName).insertOne(mock)
      const base = Base({ collectionName: collectionName })
      const res = await base.getBy({ Obj: Mock, filter: { _id: mock._id } })
      expect(res._id.toString()).toBe(mock._id.toString())
    })
    it('should return null if obj is not in database', async () => {
      const base = Base({ collectionName: collectionName })
      const res = await base.getBy({ Obj: Mock, filter: {} })
      expect(res).toBe(null)
    })
    it('should throw error if class not provided', async () => {
      const mock = { email: "1" }
      await mongo.collection(collectionName).insertOne(mock)
      const base = Base({ collectionName: collectionName })
      await expect(base.getBy({ filter: {} })).rejects.toThrowError('You should specify a class')
    })
    it('should throw error none is provided', async () => {
      const mock = { email: "1" }
      await mongo.collection(collectionName).insertOne(mock)
      const base = Base({ collectionName: collectionName })
      await expect(base.getBy()).rejects.toThrowError('You should specify a class')
    })
  })

  describe('reload', () => {
    it('should getById', async () => {
      const mock = { email: '1' }
      await mongo.collection(collectionName).insertOne(mock)
      const base = Base({ collectionName: collectionName })
      const res = await base.reload({ Obj: Mock, obj: mock })
      expect(res._id.toString()).toBe(mock._id.toString()) // should set _id on mock object
    })
    it('should throw error if obj is not in database', async () => {
      const mock = { email: "1" }
      const base = Base({ collectionName: collectionName })
      await expect(base.reload({ Obj: Mock, obj: mock })).rejects.toThrowError('Object not found in DB')
    })
    it('should throw error if class not provided', async () => {
      const mock = { email: "1" }
      await mongo.collection(collectionName).insertOne(mock)
      const base = Base({ collectionName: collectionName })
      await expect(base.reload({})).rejects.toThrowError('You should specify a class')
    })
    it('should throw error if none is provided', async () => {
      const mock = { email: "1" }
      await mongo.collection(collectionName).insertOne(mock)
      const base = Base({ collectionName: collectionName })
      await expect(base.reload()).rejects.toThrowError('You should specify a class')
    })
    it('should throw error if object not provided', async () => {
      const mock = { email: "1" }
      await mongo.collection(collectionName).insertOne(mock)
      const base = Base({ collectionName: collectionName })
      await expect(base.reload({ Obj: Mock })).rejects.toThrowError('You should specify an object')
    })
  })
  describe('allBy', () => {
    it('should allBy empty conf', async () => {
      await mongo.collection(collectionName).insertMany([
        { email: '1' }, { email: '1' }, { email: '0' }
      ])
      const base = Base({ collectionName: collectionName })
      const res = await base.allBy({ Obj: Mock })
      expect(res).toHaveLength(3)
    })
    describe('Filter', () => {

      it('should allBy with filter', async () => {
        await mongo.collection(collectionName).insertMany([
          { email: '1' }, { email: '1' }, { email: '0' }
        ])
        const base = Base({ collectionName: collectionName })
        const res = await base.allBy({ Obj: Mock, filter: { email: '1' } })
        expect(res).toHaveLength(2)
      })
      it('should allBy with filter null', async () => {
        await mongo.collection(collectionName).insertMany([
          { email: '1' }, { email: '1' }, { email: '0' }
        ])
        const base = Base({ collectionName: collectionName })
        const res = await base.allBy({ Obj: Mock, filter: null })
        expect(res).toHaveLength(3)
      })

      it('should allBy with filter empty', async () => {
        await mongo.collection(collectionName).insertMany([
          { email: '1' }, { email: '1' }, { email: '0' }
        ])
        const base = Base({ collectionName: collectionName })
        const res = await base.allBy({ Obj: Mock, filter: {} })
        expect(res).toHaveLength(3)
      })
      it('should throw error if filter is not an object', async () => {
        const base = Base({ collectionName: collectionName })
        // @ts-ignore
        await expect(base.allBy({ Obj: Mock, filter: 'demdeldm' })).rejects.toThrowError('Filter should be an object')
      })

      it('should throw error if class not provided', async () => {
        const base = Base({ collectionName: collectionName })
        await expect(base.allBy({})).rejects.toThrowError('You should specify a class')
      })
      it('should throw error if none is provided', async () => {
        const base = Base({ collectionName: collectionName })
        await expect(base.allBy()).rejects.toThrowError('You should specify a class')
      })
    })
    describe('Sort', () => {
      it('should throw error if sort is not an object', async () => {
        const base = Base({ collectionName: collectionName })
        // @ts-ignore
        await expect(base.allBy({ Obj: Mock, sort: 'demdeldm' })).rejects.toThrowError('Sort should be an object')
      })
      it('should allBy with sort null', async () => {
        await mongo.collection(collectionName).insertMany([
          { email: 3 }, { email: 1 }, { email: 0 }
        ])
        const base = Base({ collectionName: collectionName })
        const res = await base.allBy({ Obj: Mock, sort: null })
        expect(res).toHaveLength(3)
        expect(res.map(a => a.email)).toEqual([3, 1, 0])
      })
      it('should allBy with sort -1', async () => {
        await mongo.collection(collectionName).insertMany([
          { email: 3 }, { email: 1 }, { email: 0 }
        ])
        const base = Base({ collectionName: collectionName })
        const res = await base.allBy({ Obj: Mock, sort: { email: -1 } })
        expect(res).toHaveLength(3)
        expect(res.map(a => a.email)).toEqual([3, 1, 0])
      })
      it('should allBy with sort 1', async () => {
        await mongo.collection(collectionName).insertMany([
          { email: 3 }, { email: 1 }, { email: 0 }
        ])
        const base = Base({ collectionName: collectionName })
        const res = await base.allBy({ Obj: Mock, sort: { email: 1 } })
        expect(res).toHaveLength(3)
        expect(res.map(a => a.email)).toEqual([0, 1, 3])
      })
    })
    describe('Skip', () => {
      it('should skip 1', async () => {
        await mongo.collection(collectionName).insertMany([
          { email: 3 }, { email: 1 }, { email: 0 }
        ])
        const base = Base({ collectionName: collectionName })
        const res = await base.allBy({ Obj: Mock, sort: { email: -1 }, skip: 1 })
        expect(res).toHaveLength(2)
        expect(res.map(a => a.email)).toEqual([1, 0])
      })
      it('should skip 2', async () => {
        await mongo.collection(collectionName).insertMany([
          { email: 3 }, { email: 1 }, { email: 0 }
        ])
        const base = Base({ collectionName: collectionName })
        const res = await base.allBy({ Obj: Mock, sort: { email: -1 }, skip: 2 })
        expect(res).toHaveLength(1)
        expect(res.map(a => a.email)).toEqual([0])
      })
      it('should not skip if skip is null ', async () => {
        await mongo.collection(collectionName).insertMany([
          { email: 3 }, { email: 1 }, { email: 0 }
        ])
        const base = Base({ collectionName: collectionName })
        const res = await base.allBy({ Obj: Mock, sort: { email: -1 }, skip: null })
        expect(res).toHaveLength(3)
        expect(res.map(a => a.email)).toEqual([3, 1, 0])
      })
    })
    describe('Limit', () => {
      it('should limit 1', async () => {
        await mongo.collection(collectionName).insertMany([
          { email: 3 }, { email: 1 }, { email: 0 }
        ])
        const base = Base({ collectionName: collectionName })
        const res = await base.allBy({ Obj: Mock, sort: { email: -1 }, limit: 1 })
        expect(res).toHaveLength(1)
        expect(res.map(a => a.email)).toEqual([3])
      })
      it('should limit 2', async () => {
        await mongo.collection(collectionName).insertMany([
          { email: 3 }, { email: 1 }, { email: 0 }
        ])
        const base = Base({ collectionName: collectionName })
        const res = await base.allBy({ Obj: Mock, sort: { email: -1 }, limit: 2 })
        expect(res).toHaveLength(2)
        expect(res.map(a => a.email)).toEqual([3, 1])
      })
      it('should not limit if limit is null ', async () => {
        await mongo.collection(collectionName).insertMany([
          { email: 3 }, { email: 1 }, { email: 0 }
        ])
        const base = Base({ collectionName: collectionName })
        const res = await base.allBy({ Obj: Mock, sort: { email: -1 }, limit: null })
        expect(res).toHaveLength(3)
        expect(res.map(a => a.email)).toEqual([3, 1, 0])
      })
    })
  })
  describe('create', () => {
    it('should throw error if class not provided', async () => {
      const mock = { email: "1" }
      await mongo.collection(collectionName).insertOne(mock)
      const base = Base({ collectionName: collectionName })
      await expect(base.create({})).rejects.toThrowError('You should specify a class')
    })
    it('should throw error if none is provided', async () => {
      const mock = { email: "1" }
      await mongo.collection(collectionName).insertOne(mock)
      const base = Base({ collectionName: collectionName })
      await expect(base.create()).rejects.toThrowError('You should specify a class')
    })
    it('should create', async () => {
      const mock = { email: '1' }
      const base = Base({ collectionName: collectionName })
      const created = await base.create({ Obj: Mock, obj: mock })
      expect(created._id.constructor.name).toBe('ObjectId')
      expect(created._id.toString()).toHaveLength(24)
      delete created._id
      expect(created).toEqual({
        email: '1',
        firstname: null,
        lastname: null
      })
      const createdInMongo = await mongo.collection(collectionName).find().toArray()
      expect(createdInMongo).toHaveLength(1)
      delete createdInMongo[0]._id
      expect(createdInMongo[0]).toEqual({
        email: '1',
        firstname: null,
        lastname: null
      })
    })
    it('should create without field email', async () => {
      const mock = { email: '1' }
      const base = Base({ collectionName: collectionName })
      const created = await base.create({ Obj: Mock, obj: mock, excludedFields: ['email'] })
      expect(created._id.constructor.name).toBe('ObjectId')
      expect(created._id.toString()).toHaveLength(24)
      delete created._id
      expect(created).toEqual({
        email: undefined,
        firstname: null,
        lastname: null
      })
      const createdInMongo = await mongo.collection(collectionName).find().toArray()
      expect(createdInMongo).toHaveLength(1)
      delete createdInMongo[0]._id
      expect(createdInMongo[0]).toEqual({
        firstname: null,
        lastname: null
      })
    })
  })

  describe('Update', () => {
    it('should throw error if class not provided', async () => {
      const mock = { email: "1" }
      await mongo.collection(collectionName).insertOne(mock)
      const base = Base({ collectionName: collectionName })
      await expect(base.update({})).rejects.toThrowError('You should specify a class')
    })
    it('should throw error if none is provided', async () => {
      const mock = { email: "1" }
      await mongo.collection(collectionName).insertOne(mock)
      const base = Base({ collectionName: collectionName })
      await expect(base.update()).rejects.toThrowError('You should specify a class')
    })
    it('should update', async () => {
      const mock = { email: '1' }
      await mongo.collection(collectionName).insertOne(mock)
      const base = Base({ collectionName: collectionName })
      const created = await base.update({ Obj: Mock, obj: { _id: mock._id, email: '2' } })
      expect(created._id.constructor.name).toBe('ObjectId')
      expect(created._id.toString()).toHaveLength(24)
      delete created._id
      expect(created).toEqual({
        email: '2',
        firstname: null,
        lastname: null
      })
      const createdInMongo = await mongo.collection(collectionName).find().toArray()
      expect(createdInMongo).toHaveLength(1)
      delete createdInMongo[0]._id
      expect(createdInMongo[0]).toEqual({
        email: '2',
        firstname: null,
        lastname: null
      })
    })

    it('should update without field email', async () => {
      const mock = { email: '1', firstname: '1' }
      await mongo.collection(collectionName).insertOne(mock)
      const base = Base({ collectionName: collectionName })
      const created = await base.update({ Obj: Mock, obj: { _id: mock._id, email: '2', firstname: "3" }, excludedFields: ['email'] })
      expect(created._id.constructor.name).toBe('ObjectId')
      expect(created._id.toString()).toHaveLength(24)
      delete created._id
      expect(created).toEqual({
        email: '1',// same as initial mock
        firstname: '3',
        lastname: null
      })
      const createdInMongo = await mongo.collection(collectionName).find().toArray()
      expect(createdInMongo).toHaveLength(1)
      delete createdInMongo[0]._id
      expect(createdInMongo[0]).toEqual({
        email: '1',// same as initial mock
        firstname: '3',
        lastname: null
      })
    })
  })
  describe('UpdateOrCreate', () => {
    it('should throw error if class not provided', async () => {
      const mock = { email: "1" }
      await mongo.collection(collectionName).insertOne(mock)
      const base = Base({ collectionName: collectionName })
      await expect(base.updateOrCreate({})).rejects.toThrowError('You should specify a class')
    })

    it('should throw error if none is provided', async () => {
      const mock = { email: "1" }
      await mongo.collection(collectionName).insertOne(mock)
      const base = Base({ collectionName: collectionName })
      await expect(base.updateOrCreate()).rejects.toThrowError('You should specify a class')
    })
    it('should create then update', async () => {
      const mock = { email: '1' }
      const base = Base({ collectionName: collectionName })
      await base.updateOrCreate({ Obj: Mock, obj: mock })
      const created = await base.updateOrCreate({ Obj: Mock, obj: { _id: mock._id, email: '2' } })
      expect(created._id.constructor.name).toBe('ObjectId')
      expect(created._id.toString()).toHaveLength(24)
      delete created._id
      expect(created).toEqual({
        email: '2',
        firstname: null,
        lastname: null
      })
      const createdInMongo = await mongo.collection(collectionName).find().toArray()
      expect(createdInMongo).toHaveLength(1)
      delete createdInMongo[0]._id
      expect(createdInMongo[0]).toEqual({
        email: '2',
        firstname: null,
        lastname: null
      })
    })
  })

  describe('DeleteOne', () => {
    it('should throw error if none is provided', async () => {
      const base = Base({ collectionName: collectionName })
      await expect(base.deleteOne()).rejects.toThrowError('You should specify an object')
    })
    it('should delete', async () => {
      const mock = { email: '1' }
      await mongo.collection(collectionName).insertOne(mock)
      const base = Base({ collectionName: collectionName })
      await base.deleteOne({ obj: mock })
      const createdInMongo = await mongo.collection(collectionName).find().toArray()
      expect(createdInMongo).toHaveLength(0)
    })
  })
})
