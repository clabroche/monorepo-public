const dayjs = require('dayjs')
const uuid = require('uuid').v4

const statusMessage = {
  500: 'We cannot respond to your request for moment. Contact support for more information',
}

function HTTPError(
  message,
  code,
  errorId = uuid(),
  date = dayjs().format('YYYY-MM-DD HH:mm:ss'),
) {
  this.code = code || 500
  this.errorId = errorId
  this.date = date
  this.message = statusMessage[this.code] || message
  this.originalMessage = message
  this.originalStack = new Error().stack
}

HTTPError.prototype = Error.prototype

module.exports = HTTPError
module.exports.statusMessage = statusMessage
