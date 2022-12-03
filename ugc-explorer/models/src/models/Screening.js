const { core } = require('../apis/Core')
const dayjs = require('dayjs')

class Screening {

  /** @param {import('@clabroche/common-typings').NonFunctionProperties<Screening>} screenings */
  constructor(screenings = {}) {
    /** @type {string} */
    this.title = screenings.title || ''
    /** @type {string} */
    this.out = screenings.out || ''
    /** @type {string[]} */
    this.realisators = screenings.realisators || []
    /** @type {string[]} */
    this.actors = screenings.actors || []
    /** @type {string} */
    this.resume = screenings.resume || ''
    /** @type {string} */
    this.cover = screenings.cover || ''
    /** @type {string} */
    this.external = screenings.external || ''
    /** @type {string[]} */
    this.categories = screenings.categories || []
    /** @type {{
     * start: string,
     * end: string,
     * version: string,
     * }[]} */
    this.screenings = screenings.screenings || []
  }
  /**
   * @returns {Promise<Screening | null>}
   */
  static async all(search = '', day = dayjs()) {
    let date = dayjs(day).toISOString()
    let { data: screenings } = await core.instance.get(`/api/screenings`, {
      params: {
        search, date
      }
    })
    if (!screenings?.length) screenings = []
    return screenings.map(s => new Screening(s))
  }
}

module.exports = Screening