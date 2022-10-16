const { core } = require('../apis/Core')

class Artist {
  /** @param {import('@clabroche-org/common-typings').NonFunctionProperties<Account>} accounts */
  constructor(accounts = {}) {
    /** @type {string} */
    this._id = accounts.id
    /** @type {string} */
    this.id = accounts.id
    /** @type {string}*/
    this.name = accounts.name
    /** @type {'artist'}*/
    this.type = accounts.type
    /** @type {string}*/
    this.href = accounts.href 
    /** @type {ExternalUrlObject}*/
    this.external_urls = accounts.external_urls
    /** @type {string}*/
    this.uri = accounts.uri

    /** Enriched fields */
    /** @type {{url: string} []}*/
    this.images = accounts.images
    /** @type {{href: string  | null, total: number}}*/
    this.followers = accounts.followers
    /** @type {string[]}*/
    this.genres = accounts.genres
    /** @type {number}*/
    this.popularity = accounts.popularity 
  }

  static async all(filter) {
    let { data: artists } = await core.instance.get(`/api/spotify/artists`, {
      params: { filter }
    })
    if (!artists) artists = []
    return artists.map(track => new Artist(track))
  }

}

module.exports = Artist