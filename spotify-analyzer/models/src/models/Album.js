const { core } = require('../apis/Core')

class Album {
  /** @param {import('@clabroche-org/common-typings').NonFunctionProperties<Album>} accounts */
  constructor(accounts = {}) {
    /** @type {string | undefined} */
    this._id = accounts.id
    /** @type { 'album' | 'single' | 'compilation' | 'appears_on' | undefined } */
    this.album_group = accounts.album_group
    /** @type { 'album' | 'single' | 'compilation' | undefined } */
    this.album_type = accounts.album_type
    /** @type { string[] | undefined } */
    this.available_markets = accounts.available_markets
    /** @type { string | undefined } */
    this.id = accounts.id
    /** @type {{
     *    height?: number | undefined;
     *    url: string;
     *    width?: number | undefined;
     * }[] | undefined} */
    this.images = accounts.images
    /** @type { string | undefined } */
    this.name = accounts.name
    /** @type { string | undefined} */
    this.release_date = accounts.release_date
    /** @type { 'year' | 'month' | 'day'| undefined } */
    this.release_date_precision = accounts.release_date_precision
    /** @type { Object | undefined } */
    this.restrictions = accounts.restrictions
    /** @type { 'album' } */
    this.type = 'album'
    /** @type { number } */
    this.total_albums = accounts.total_albums || 0
  }

  /** @return {Promise<Album[]>} */
  static async all(filter) {
    let { data: albums } = await core.instance.post(`/api/albums`, { filter })
    if (!albums) albums = []
    return albums.map(album => new Album(album))
  }
}

module.exports = Album