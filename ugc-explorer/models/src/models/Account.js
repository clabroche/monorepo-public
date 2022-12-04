const { core } = require('../apis/Core')

class Account {
  /** @param {import('@clabroche/common-typings').NonFunctionProperties<Account>} accounts */
  constructor(accounts = {}) {
    /** @type {string | undefined} */
    this._id = accounts._id
    /** @type {string | undefined} */
    this.password = undefined
  }
  /**
   * @param {string} _id
   * @returns {Promise<Account | null>}
   */
  static async get(_id) {
    if (!_id) throw new Error('_id param is empty')
    const { data: account } = await core.instance.get(`/api/accounts/${_id}`)
    return account ? new Account(account) : null
  }
}

module.exports = Account