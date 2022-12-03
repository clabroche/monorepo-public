const { core } = require('../apis/Core')

class Credential {
  /** @param {import('@clabroche/common-typings').NonFunctionProperties<Credential>} credential */
  constructor(credential = {}) {
    /** @type {string | undefined} */
    this._id = credential._id
    /** @type {string | undefined} */
    this.ownerId = credential.ownerId
    /** @type {string | undefined} */
    this.access_token = credential.access_token
    /** @type {string | undefined} */
    this.refresh_token = credential.refresh_token
    /** @type {number | undefined} */
    this.expires_in = credential.expires_in
    /** @type {string | undefined} */
    this.expires_at = credential.expires_at
    /** @type {boolean | undefined} */
    this.alreadyNotifyed = credential.alreadyNotifyed || false

    if(!this.ownerId) throw new Error('ownerId field is required')
  }

  static async getOauthUrl() {
    const {data: url} = await core.instance.get('/api/spotify-auth/oauth-url')
    return url
  }

}

module.exports = Credential