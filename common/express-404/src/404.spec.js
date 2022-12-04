const middleware404 = require('./404')
const mockRes = {
  status: jest.fn(function () {
    return this
  }),
  send: jest.fn(function () {
    return this
  }),
}

describe('Middleware: 404', function () {
  it('should set 404 status', async function () {
    middleware404({}, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(404)
  })
})
