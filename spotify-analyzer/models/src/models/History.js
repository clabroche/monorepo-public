const { core } = require('../apis/Core')

class History {
  /** @param {import('@clabroche-org/common-typings').NonFunctionProperties<Account>} accounts */
  constructor(accounts = {}) {
    /** @type {import('mongodb').ObjectID} */
    this._id = accounts._id
    /** @type {string} */
    this.trackId = accounts.trackId
    /** @type {import('mongodb').ObjectID} */
    this.ownerId = accounts.ownerId
    /** @type {string} */
    this.played_at = accounts.played_at
  }

  /**
 * @returns {Promise<History[]>}
 */
  static async recentlyPlayed() {
    let { data: histories } = await core.instance.get(`/api/spotify/recently-played`, {
      params: {
        sort: {
          played_at: -1
        }
      }
    })
    if (!histories?.length) histories = []
    return histories.map(h => new History(h))
  }

  static async stats() {
    let { data: stats } = await core.instance.get(`/api/spotify/stats`, )
    return stats
  }

}

module.exports = History