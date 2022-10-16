const { core } = require('../apis/Core')

class Album {
  /** @param {import('@clabroche-org/common-typings').NonFunctionProperties<Album>} accounts */
  constructor(accounts = {}) {
    /** @type {string} */
    this._id = accounts.id
    /** @type { 'album' | 'single' | 'compilation' | 'appears_on' | undefined } */
    this.album_group = accounts.album_group
    /** @type { 'album' | 'single' | 'compilation' } */
    this.album_type = accounts.album_type
    /** @type { string[] | undefined } */
    this.available_markets = accounts.available_markets
    /** @type { string } */
    this.id = accounts.id
    /** @type {{
     *    height?: number | undefined;
     *    url: string;
     *    width?: number | undefined;
     * }[]} */
    this.images = accounts.images
    /** @type { string } */
    this.name = accounts.name
    /** @type { string } */
    this.release_date = accounts.release_date
    /** @type { 'year' | 'month' | 'day' } */
    this.release_date_precision = accounts.release_date_precision
    /** @type { RestrictionsObject | undefined } */
    this.restrictions = accounts.restrictions
    /** @type { 'album' } */
    this.type = accounts.type
    /** @type { number } */
    this.total_albums = accounts.total_albums
  }

  /** @return {Promise<Album[]>} */
  static async all(filter) {
    let { data: albums } = await core.instance.get(`/api/spotify/albums`, {
      params: { filter }
    })
    if (!albums) albums = []
    return albums.map(album => new Album(album))
  }
}

module.exports = Album