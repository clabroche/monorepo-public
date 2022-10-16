const { core } = require('../apis/Core')

class Account {
  /** @param {import('@clabroche-org/common-typings').NonFunctionProperties<Account>} accounts */
  constructor(accounts = {}) {
    /** @type {import('mongodb').ObjectID | string} */
    this._id = accounts._id
    /** @type {string} */
    this.password = undefined
  }
  /**
   * @param {import('mongodb').ObjectID | string} _id
   * @returns {Promise<Account>}
   */
  static async get(_id) {
    if (!_id) throw new Error('_id param is empty')
    const { data: account } = await core.instance.get(`/api/accounts/${_id}`)
    return account ? new Account(account) : null
  }
}

module.exports = Account