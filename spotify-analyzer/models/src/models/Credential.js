const { core } = require('../apis/Core')

class Credential {
  /** @param {import('@clabroche-org/common-typings').NonFunctionProperties<Account>} accounts */
  constructor(credential = {}) {
    /** @type {import('mongodb').ObjectID | string} */
    this._id = credential._id
    /** @type {import('mongodb').ObjectID} */
    this.ownerId = credential.ownerId
    /** @type {string} */
    this.access_token = credential.access_token
    /** @type {string} */
    this.refresh_token = credential.refresh_token
    /** @type {number} */
    this.expires_in = credential.expires_in
    /** @type {string} */
    this.expires_at = credential.expires_at
    /** @type {boolean} */
    this.alreadyNotifyed = credential.alreadyNotifyed || false

    if(!this.ownerId) throw new Error('ownerId field is required')
  }

  static async getOauthUrl() {
    const {data: url} = await core.instance.get('/api/spotify/oauth-url')
    return url
  }

}

module.exports = Credential