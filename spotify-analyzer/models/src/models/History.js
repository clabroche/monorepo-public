const CustomObservable = require('@clabroche/common-custom-observable')
const { core } = require('../apis/Core')

class History {
  static updated = new CustomObservable()
  /** @param {import('@clabroche/common-typings').NonFunctionProperties<History>} history */
  constructor(history = {}) {
    /** @type {string | undefined} */
    this._id = history._id
    /** @type {string | undefined} */
    this.trackId = history.trackId
    /** @type {string | undefined} */
    this.ownerId = history.ownerId
    /** @type {string | undefined} */
    this.played_at = history.played_at
  }

  /**
 * @returns {Promise<History[]>}
 */
  static async recentlyPlayed() {
    let { data: histories } = await core.instance.get(`/api/histories`, {
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
    await core.instance.post(`/api/histories`)
  }

  /**
   * 
   * @param {string} from 
   * @param {string} to 
   * @returns 
   */
  static async stats(from, to) {
    let { data: stats } = await core.instance.get(`/api/stats`, {params: {from, to}})
    return stats
  }
}

module.exports = History