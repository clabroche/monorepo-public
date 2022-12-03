const jsonwebtoken = require('jsonwebtoken')
const env = require('@clabroche/mybank-libs-env')
const { mongo } = require('@clabroche/common-mongo')
const context = require('@clabroche/common-context')
const { checkPermissions } = require('@clabroche/common-permissions')
const JWT_PRIVATE_KEY = env.JWT_PRIVATE_KEY
module.exports = {
  /** 
   * @return {{
   *   "user_id": string,
   *   "account_id": string,
   *   "plan": "'perso' | 'enterprise' | 'none'",
   *   "isAdmin": boolean,
   *   "iat": number
   * }}
   */
  getJwt() {
    // @ts-ignore
    return context.getItem('jwt')
  },
  userIsAuthenticated(req, res, next) {
    const auth_header = req.headers.authorization
    if (auth_header === env.JWT_PRIVATE_KEY) {
      context.setItem('jwt', { isAdmin: true })
      return next()
    }
    if (auth_header) {
      const token = auth_header.replace('Bearer ', '')
      req.jwt = module.exports.verify(token)
      if (req.jwt?.user_id) req.jwt.user_id = mongo.getID(req.jwt.user_id)
      context.setItem('jwt', req.jwt)
      if (req.jwt) return next()
    }
    res.status(401).json({ message: 'You are not logged' })
  },
  parseAuth(req, res, next) {
    const auth_header = req.headers.authorization
    if (auth_header === env.JWT_PRIVATE_KEY) {
      context.setItem('jwt', { isAdmin: true })
    }
    if (auth_header) {
      const token = auth_header.replace('Bearer ', '')
      req.jwt = module.exports.verify(token)
      if (req.jwt?.user_id) req.jwt.user_id = mongo.getID(req.jwt.user_id)
      context.setItem('jwt', req.jwt)
    }
    return next()
  },
  /**
   * @param {string[]} permissions 
   */
  can(permissions) {
    return (req, res, next) => {
      const jwt = context.getItem('jwt')
      const authorized = checkPermissions(permissions, jwt)
      if (!authorized) return res.status(403).send('Not authorized')
      next()
    }
  },
  /** @return {Object} */
  verify(token) {
    if (!env.JWT_PRIVATE_KEY) throw new Error('JWT_PRIVATE_KEY env not present')
    try {
      return jsonwebtoken.verify(token, JWT_PRIVATE_KEY)
    } catch {
      return undefined
    }
  },
  sign(payload, option = {}) {
    if (!env.JWT_PRIVATE_KEY) throw new Error('JWT_PRIVATE_KEY env not present')
    return jsonwebtoken.sign(payload, JWT_PRIVATE_KEY, option)
  },
  /** @return {Object} */
  decode(token) {
    return jsonwebtoken.decode(token)
  },
}