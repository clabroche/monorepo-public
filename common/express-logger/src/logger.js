const uuid = require('uuid').v4
const rfs = require('rotating-file-stream')
const dayjs = require('dayjs')
const HTTPError = require('@clabroche-org/common-express-http-error')
dayjs.locale('fr')
function Logger() { }

Logger.prototype.init = function ({
  path,
  size = '10M',
  interval = '1d',
  maxFiles = 120
}) {
  if (!path) throw new Error('You should set path for logger')
  const rotateConfig = {
    size,
    interval,
    maxFiles,
    path,
  }
  this.rotateConfig = rotateConfig
  this.accessLogStream = rfs.createStream('access.log', rotateConfig)
  this.errorLogStream = rfs.createStream('errors.log', rotateConfig)
}
/**
 * @param {Error | string | HTTPError} err
 */
Logger.prototype.error = function (err) {
  if (!this.rotateConfig) throw new Error('Logger not inited')
  const errorId = uuid()
  const date = dayjs().format('YYYY-MM-DD HH:mm:ss')
  let message =
    `┌ Error:\n` +
    `├── errorId: ${errorId}\n` +
    `├── date: ${date}\n` +
    // @ts-ignore
    `├── message: ${err.originalMessage || err.message || err}\n`
  // @ts-ignore
  if (err?.response?.request?.method) {
    // @ts-ignore
    message += '├── httpMethod: ' + err?.response?.request?.method + '\n'
  }
  // @ts-ignore
  if (err?.response?.request?.res?.responseUrl) {
    // @ts-ignore
    message += '├── httpRequest: ' + err.response.request?.res?.responseUrl + '\n'
  }
  // @ts-ignore
  if (err?.response?.data) {
    // @ts-ignore
    message += '├── httpMessage: ' + JSON.stringify(err.response.data) + '\n'
  }
  // @ts-ignore
  message += `├── stack: \n${formatStack(err.originalStack || err.stack || err)}\n` +
    `└\n`
  console.error(message)
  this.errorLogStream.write(message)

  return {
    errorId,
    date,
  }
}

/**@param {String}  stack*/
function formatStack(stack = '') {
  return stack
    .split('\n')
    .map((line) => `├── ${line}`)
    .join('\n')
}

module.exports = Logger
