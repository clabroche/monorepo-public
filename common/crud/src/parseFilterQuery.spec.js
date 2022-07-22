const parseFilterQuery = require('./parseFilterQuery')
const context = require('@clabroche-org/common-context')
const { ObjectId } = require('mongodb')
const getMockReq = () => ({ headers: {}, query: {} })
const getMockRes = () => ({ json: jest.fn(), status() { return this }, send: jest.fn() })
const initContext = (cb) => {
  context.middleware(getMockReq(), getMockRes(), () => {
    cb()
  })
}
const launchTest = ({
  fields = null,
  mockReq = getMockReq(),
  mockRes = getMockRes(),
} = {}) => {
  return new Promise((res) => {
    const searchableFields = parseFilterQuery(fields)
    expect(searchableFields.constructor.name).toBe('Function')
    initContext(() => {
      // @ts-ignore
      searchableFields(mockReq, mockRes, () => {
        res(context.getItem('search'))
      })
    })
  })
}
describe('ParseFilterQuery', () => {
  it('should return a middleware by default', async () => {
    const mockReq = getMockReq()
    const mockRes = getMockRes()
    const search = await launchTest({ mockReq, mockRes })
    expect(mockRes.json).toBeCalledTimes(0)
    expect(mockRes.send).toBeCalledTimes(0)
    expect(search).toEqual({ filter: {}, limit: 10000, skip: 0, sort: { _id: -1 } })
  })
  it('should return a middleware by default2', async () => {
    const mockReq = getMockReq()
    const mockRes = getMockRes()
    const search = await launchTest({ mockReq, mockRes, fields: [] })
    expect(mockRes.json).toBeCalledTimes(0)
    expect(mockRes.send).toBeCalledTimes(0)
    expect(search).toEqual({ filter: {}, limit: 10000, skip: 0, sort: { _id: -1 } })
  })
  describe('Limit', () => {
    it('should update limit correctly when it is a number', async () => {
      const mockReq = getMockReq()
      const mockRes = getMockRes()
      mockReq.query.limit = 100
      const search = await launchTest({ mockReq, mockRes, fields: [] })
      expect(mockRes.json).toBeCalledTimes(0)
      expect(mockRes.send).toBeCalledTimes(0)
      expect(search.limit).toBe(100)
    })
    it('should update limit correctly when it is a string', async () => {
      const mockReq = getMockReq()
      const mockRes = getMockRes()
      mockReq.query.limit = "100"
      const search = await launchTest({ mockReq, mockRes, fields: [] })
      expect(mockRes.json).toBeCalledTimes(0)
      expect(mockRes.send).toBeCalledTimes(0)
      expect(search.limit).toBe(100)
    })
    it('should send error when limit is not a parsable string to number', (done) => {
      const mockReq = getMockReq()
      const mockRes = getMockRes()
      mockReq.query.limit = "1a00"
      mockRes.send.mockImplementation((err) => {
        expect(err).toBe('Limit is not a parsable number')
        done()
      })
      launchTest({ mockReq, mockRes, fields: [] })
        .then(_ => done('Should not pass test'))

    })

    it('should send error when limit is not a boolean', (done) => {
      const mockReq = getMockReq()
      const mockRes = getMockRes()
      mockReq.query.limit = true
      mockRes.send.mockImplementation((err) => {
        expect(err).toBe('Limit is not a parsable number')
        done()
      })
      launchTest({ mockReq, mockRes, fields: [] })
        .then(() => done('Should not pass test'))

    })

    it('should send error when limit is negative', (done) => {
      const mockReq = getMockReq()
      const mockRes = getMockRes()
      mockReq.query.limit = -1
      mockRes.send.mockImplementation((err) => {
        expect(err).toBe('Limit should be positive')
        done()
      })
      launchTest({ mockReq, mockRes, fields: [] })
        .then(() => done('Should not pass test'))
    })
  })

  describe('Skip', () => {
    it('should update limit correctly when it is a number', async () => {
      const mockReq = getMockReq()
      const mockRes = getMockRes()
      mockReq.query.skip = 100
      const search = await launchTest({ mockReq, mockRes, fields: [] })
      expect(mockRes.json).toBeCalledTimes(0)
      expect(mockRes.send).toBeCalledTimes(0)
      expect(search.skip).toBe(100)
    })
    it('should update skip correctly when it is a string', async () => {
      const mockReq = getMockReq()
      const mockRes = getMockRes()
      mockReq.query.skip = "100"
      const search = await launchTest({ mockReq, mockRes, fields: [] })
      expect(mockRes.json).toBeCalledTimes(0)
      expect(mockRes.send).toBeCalledTimes(0)
      expect(search.skip).toBe(100)
    })
    it('should send error when skip is not a parsable string to number', (done) => {
      const mockReq = getMockReq()
      const mockRes = getMockRes()
      mockReq.query.skip = "1a00"
      mockRes.send.mockImplementation((err) => {
        expect(err).toBe('Skip is not a parsable number')
        done()
      })
      launchTest({ mockReq, mockRes, fields: [] })
        .then(() => done('Should not pass test'))
    })

    it('should send error when skip is not a boolean', (done) => {
      const mockReq = getMockReq()
      const mockRes = getMockRes()
      mockReq.query.skip = true
      mockRes.send.mockImplementation((err) => {
        expect(err).toBe('Skip is not a parsable number')
        done()
      })
      launchTest({ mockReq, mockRes, fields: [] })
        .then(() => done('Should not pass test'))
    })

    it('should send error when skip is negative', (done) => {
      const mockReq = getMockReq()
      const mockRes = getMockRes()
      mockReq.query.skip = -1
      mockRes.send.mockImplementation((err) => {
        expect(err).toBe('Skip should be positive')
        done()
      })
      launchTest({ mockReq, mockRes, fields: [] })
        .then(() => done('Should not pass test'))
    })
  })
  describe('Filter', () => {
    it('should parse empty filter', (done) => {
      const mockReq = getMockReq()
      const mockRes = getMockRes()
      mockReq.query.filter = "{}"
      mockRes.send.mockImplementation((err) => done(err))
      launchTest({ mockReq, mockRes, fields: [] })
        .then(search => {
          expect(search.filter).toEqual({})
          done()
        })
    })

    it('should parse filter', (done) => {
      const mockReq = getMockReq()
      const mockRes = getMockRes()
      mockReq.query.filter = '{"a": 1, "b":"3", "c":["4"]}'
      const expected = JSON.parse(mockReq.query.filter)
      mockRes.send.mockImplementation((err) => done(err))
      launchTest({ mockReq, mockRes, fields: [] })
        .then(search => {
          expect(search.filter).toEqual(expected)
          done()
        })
    })
    it('should send error when filter cannot be parsed', (done) => {
      const mockReq = getMockReq()
      const mockRes = getMockRes()
      mockReq.query.filter = '{"a": 1, b:"3", "c":["4"]}'
      mockRes.send.mockImplementation((err) => {
        expect(err).toBe('Filter is malformed')
        done()
      })
      launchTest({ mockReq, mockRes, fields: [] })
        .then(() => done('Should not pass test'))
    })

    it('should send error when context is not init', (done) => {
      const searchableFields = parseFilterQuery([])
      const mockReq = getMockReq()
      const mockRes = getMockRes()
      mockRes.send.mockImplementation((err) => {
        expect(err).toBe('Context seems to not be init. Call middleware before')
        done()
      })
      // @ts-ignore
      searchableFields(mockReq, mockRes, () => {
        done('Should not pass')
      })
    })
  })

  describe('Filter fields on query', () => {
    it('should parse as string', (done) => {
      const mockReq = getMockReq()
      const mockRes = getMockRes()
      mockReq.query.a = "1"
      mockRes.send.mockImplementation((err) => done(err))
      launchTest({ mockReq, mockRes, fields: [{ field: 'a', type: 'string' }] })
        .then(search => {
          expect(search.filter).toEqual({ a: "1" })
          done()
        })
    })
    it('should parse as number', (done) => {
      const mockReq = getMockReq()
      const mockRes = getMockRes()
      mockReq.query.a = "1"
      mockRes.send.mockImplementation((err) => done(err))
      launchTest({ mockReq, mockRes, fields: [{ field: 'a', type: 'number' }] })
        .then(search => {
          expect(search.filter).toEqual({ a: 1 })
          done()
        })
    })

    it('should parse as boolean', (done) => {
      const mockReq = getMockReq()
      const mockRes = getMockRes()
      mockReq.query.a = "true"
      mockRes.send.mockImplementation((err) => done(err))
      launchTest({ mockReq, mockRes, fields: [{ field: 'a', type: 'boolean' }] })
        .then(search => {
          expect(search.filter).toEqual({ a: true })
          done()
        })
    })
    it('should parse as boolean', (done) => {
      const mockReq = getMockReq()
      const mockRes = getMockRes()
      mockReq.query.a = "false"
      mockRes.send.mockImplementation((err) => done(err))
      launchTest({ mockReq, mockRes, fields: [{ field: 'a', type: 'boolean' }] })
        .then(search => {
          expect(search.filter).toEqual({ a: false })
          done()
        })
    })
    it('should parse as objectId', (done) => {
      const mockReq = getMockReq()
      const mockRes = getMockRes()
      mockReq.query.a = "507f191e810c19729de860ea"
      mockRes.send.mockImplementation((err) => done(err))
      launchTest({ mockReq, mockRes, fields: [{ field: 'a', type: 'objectId' }] })
        .then(search => {
          expect(search.filter).toEqual({ a: new ObjectId("507f191e810c19729de860ea") })
          done()
        })
    })

    it('should throw error when type is not defined', (done) => {
      const mockReq = getMockReq()
      const mockRes = getMockRes()
      mockReq.query.a = "507f191e810c19729de860ea"
      mockRes.send.mockImplementation((err) => {
        expect(err).toBe('Searchable fields is not correct')
        done()
      })
      launchTest({ mockReq, mockRes, fields: [{ field: 'a', type: 'dledeldkje' }] })
        .then(() => done('Should not pass test'))
    })
  })

  describe('Sort', () => {
    it('should parse empty sort', (done) => {
      const mockReq = getMockReq()
      const mockRes = getMockRes()
      mockReq.query.sort = "{}"
      mockRes.send.mockImplementation((err) => done(err))
      launchTest({ mockReq, mockRes, fields: [] })
        .then(search => {
          expect(search.sort).toEqual({})
          done()
        })
    })

    it('should parse sort', (done) => {
      const mockReq = getMockReq()
      const mockRes = getMockRes()
      mockReq.query.sort = '{"a": 1, "b":"3", "c":["4"]}'
      const expected = JSON.parse(mockReq.query.sort)
      mockRes.send.mockImplementation((err) => done(err))
      launchTest({ mockReq, mockRes, fields: [] })
        .then(search => {
          expect(search.sort).toEqual(expected)
          done()
        })
    })
    it('should send error when sort cannot be parsed', (done) => {
      const mockReq = getMockReq()
      const mockRes = getMockRes()
      mockReq.query.sort = '{"a": 1, b:"3", "c":["4"]}'
      mockRes.send.mockImplementation((err) => {
        expect(err).toBe('Sort is malformed')
        done()
      })
      launchTest({ mockReq, mockRes, fields: [] })
        .then(() => done('Should not pass test'))
    })
  })

})