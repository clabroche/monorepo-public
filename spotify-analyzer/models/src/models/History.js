const CustomObservable = require('@clabroche-org/common-custom-observable')
const { core } = require('../apis/Core')

class History {
  static updated = new CustomObservable()
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

  /**
 */
  static async sync() {
    await core.instance.post(`/api/spotify/recently-played`)
  }

  /**
   * 
   * @param {string} from 
   * @param {string} to 
   * @returns 
   */
  static async stats(from, to) {
    let { data: stats } = await core.instance.get(`/api/spotify/stats`, {params: {from, to}})
    return stats
  }
}

module.exports = History