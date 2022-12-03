mockModules()
function mockModules() {
  jest.mock('@clabroche/common-express-logger', () => {
    const mockError = {
      errorId: 'errorId',
      date: new Date(),
    }
    function Logger() {
      this.mockError = mockError
    }
    Logger.prototype.error = jest.fn(function () {
      return mockError
    })
    Logger.logger = new Logger()
    return Logger
  })
}
const ErrorHandler = require('./errorHandler')
const HTTPError = require('@clabroche/common-express-http-error')
const Logger = require('@clabroche/common-express-logger')
const mockedLoggerError = new Logger().error(null)

const mockRes = {
  status: jest.fn(function () {
    return this
  }),
  send: jest.fn(function () {
    return this
  }),
  json: jest.fn(function () {
    return this
  }),
}

describe('Middleware: ErrorHandler', function () {
  it('should set 500 status and change message', async function () {
    const err = new HTTPError('This is an error')
    const errorHandler = ErrorHandler({ logger: new Logger() })
    errorHandler(err, {}, mockRes, () => { })
    // @ts-ignore
    const { errorId, date } = mockedLoggerError
    expect(mockRes.status).toHaveBeenCalledWith(500)
    expect(mockRes.json).toHaveBeenCalledWith({
      code: 500,
      errorId,
      date,
      message:
        'We cannot respond to your request for moment. Contact support for more information',
    })
  })
  it('should set 500 status when err.code is not valid', async function () {
    const err = new HTTPError('This is an error')
    err.code = 'this is not a valid code http'
    const errorHandler = ErrorHandler({ logger: new Logger() })
    errorHandler(err, {}, mockRes, () => { })
    // @ts-ignore
    const { errorId, date } = mockedLoggerError
    expect(mockRes.status).toHaveBeenCalledWith(500)
    expect(mockRes.json).toHaveBeenCalledWith({
      code: 500,
      errorId,
      date,
      message:
        'We cannot respond to your request for moment. Contact support for more information',
    })
  })
  it('should set 400 status with simple object', async function () {
    const err = new HTTPError('This is an error')
    err.code = 400
    const errorHandler = ErrorHandler({ logger: new Logger() })
    errorHandler(err, {}, mockRes, () => { })
    // @ts-ignore
    const { errorId, date } = mockedLoggerError
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({
      code: err.code,
      errorId,
      date,
      message: err.message,
    })
  })
  it('should set 400 status with HTTPErrror', async function () {
    const err = new HTTPError('This is an error', 400)
    const errorHandler = ErrorHandler({ logger: new Logger() })
    errorHandler(err, {}, mockRes, () => { })
    // @ts-ignore
    const { errorId, date } = mockedLoggerError
    expect(mockRes.status).toHaveBeenCalledWith(400)
    expect(mockRes.json).toHaveBeenCalledWith({
      code: err.code,
      errorId,
      date,
      message: err.message,
    })
  })
  it('should throw error if logger not provided', async function () {
    try {
      ErrorHandler({ logger: null })
      throw new Error('Should not pass test')
    } catch (error) {
      expect(error.message).toBe('No logger found')
    }
  })
})
