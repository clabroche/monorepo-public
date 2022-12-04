const HTTPError = require('@clabroche/common-express-http-error')

module.exports = ({
  logger
}) => {
  if (!logger) throw new Error('No logger found')
  return (err, req, res, next) => {
    const isValidCode = !Number.isNaN(Number(err.code))
    const { errorId, date } = logger.error(err)
    const httpErr =
      !err.code || !isValidCode
        ? new HTTPError(err, 500, errorId, date)
        : new HTTPError(err.message, err.code, errorId, date)
    res.status(httpErr.code).json({
      errorId,
      date,
      code: httpErr.code,
      message: httpErr.message,
    })
    next(err)
  }
}
