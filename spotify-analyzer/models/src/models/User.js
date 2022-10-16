const { core } = require('../apis/Core')
const Account = require('./Account')

class User {
  /**
   * 
   * @param {import('@clabroche-org/common-typings').NonFunctionProperties<User>} user
   */
  constructor(user = {}) {
    /** @type {import('mongodb').ObjectId | string} */
    this._id = user._id
    /** @type {string} */
    this.email = user.email
    /** @type {import('mongodb').ObjectId | string} */
    this.accountId = user.accountId
    /** @type {import('./Account')} */
    this.account = user.account ? new Account(user.account) : null
    /** @type {boolean} */
    this.isAdmin = user.isAdmin ? true : false
    /** @type {Object[]} */
    this.requisitions = user.requisitions || []
    /** @type {String[]} */
    this.tinkIds = user.tinkIds || []
    /** @type {String} */
    this.tinkId = user.tinkId || ''

  }
  static async me() {
    const { data: me } = await core.instance.get('/api/accounts/me')
    return me ? new User(me) : null
  }

  static async get(id) {
    if (!id) throw new Error('Id is required')
    const { data: user } = await core.instance.get('/api/accounts/users/' + id)
    return user ? new User(user) : null
  }

  async loadAccount() {
    if (this.accountId) {
      this.account = await Account.get(this.accountId)
    }
    return this.account
  }


  /**
   * 
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<string>}
   */
  static async login(email, password) {
    const { data: token } = await core.instance.post('/api/accounts/login', {
      email, password
    })
    return token
  }

  /**
   * 
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<string>}
   */
  static async register(email, password) {
    const { data: token } = await core.instance.post('/api/accounts/register', {
      email, password
    })
    return token
  }
}

module.exports = User