const { core } = require('../apis/Core')

class Artist {
  /** @param {import('@clabroche/common-typings').NonFunctionProperties<Artist>} accounts */
  constructor(accounts = {}) {
    /** @type {string | undefined} */
    this._id = accounts.id
    /** @type {string | undefined} */
    this.id = accounts.id
    /** @type {string | undefined}*/
    this.name = accounts.name
    /** @type {'artist'}*/
    this.type = 'artist'
    /** @type {string | undefined}*/
    this.href = accounts.href 
    /** @type {Object}*/
    this.external_urls = accounts.external_urls
    /** @type {string | undefined}*/
    this.uri = accounts.uri

    /** Enriched fields */
    /** @type {{url: string} [] | undefined}*/
    this.images = accounts.images
    /** @type {{href: string  | null, total: number} | undefined}*/
    this.followers = accounts.followers
    /** @type {string[] | undefined}*/
    this.genres = accounts.genres
    /** @type {number | undefined}*/
    this.popularity = accounts.popularity 
  }

  static async all(filter) {
    let { data: artists } = await core.instance.post(`/api/artists`, { filter })
    if (!artists) artists = []
    return artists.map(track => new Artist(track))
  }

}

module.exports = Artist