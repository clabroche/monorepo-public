// @ts-ignore
if (typeof window === 'undefined') {
  module.exports = require('./nodeCls')
} else {
  // @ts-ignore
  module.exports = window.localStorage
} 