const { createRequestContext, getRequestContext } = require("./asyncHooks")

module.exports = {
  createContext() {
    createRequestContext()
  },
  middleware: function (req, res, next) {
    module.exports.createContext()
    module.exports.setItem('req', req)
    module.exports.setItem('res', req)
    module.exports.setItem('jwt', req.headers.authorization)
    next()
  },
  getItem(key) {
    const context = getRequestContext()
    if(!context) throw new Error('Context seems to not be init. Call middleware before')
    return context.data[key];
  },
  setItem(key, value) {
    const context = getRequestContext()
    if(!context) throw new Error('Context seems to not be init. Call middleware before')
    return context.data[key] = value;
  },
  removeItem(key) {
    const context = getRequestContext()
    if(!context) throw new Error('Context seems to not be init. Call middleware before')
    delete context.data[key];
  }
}