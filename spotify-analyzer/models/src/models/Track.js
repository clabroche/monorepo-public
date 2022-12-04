const { core } = require('../apis/Core');
const genres = require('./genres');

class Track {
  /** @param {import('@clabroche/common-typings').NonFunctionProperties<Track&{artists?:{id: string}[], album?:{id: string}}>} track */
  constructor(track = {}) {
    /** @type {string | undefined} */
    this._id = track.id
    /**@type {string[]}*/
    this.artistsIds = track.artistsIds || []
    if(track.artists) track.artists.forEach(artist => {
      if(!this.artistsIds.includes(artist.id)) this.artistsIds.push(artist.id)
    });
    /**@type {string[] | undefined}*/
    this.available_markets = track.available_markets
    /**@type {number  | undefined}*/
    this.disc_number = track.disc_number
    /**@type {number | undefined}*/
    this.duration_ms = track.duration_ms
    /**@type {boolean | undefined}*/
    this.explicit = track.explicit
    /**@type {{spotify: string} | undefined}*/
    this.external_urls = track.external_urls
    /**@type {string | undefined}*/
    this.href = track.href
    /**@type {string | undefined}*/
    this.id = track.id
    /** @type {Object | undefined}*/
    this.restrictions = track.restrictions
    /**@type {string | undefined}*/
    this.name = track.name
    /**@type {string | null}*/
    this.preview_url = track.preview_url || null
    /**@type {number | undefined}*/
    this.track_number = track.track_number
    /**@type {'track'}*/
    this.type = 'track'
    /**@type {string | undefined}*/
    this.uri = track.uri
    /**@type {string | undefined}*/
    this.albumId = track.albumId
    if (track.album) this.albumId = track.album.id
    /**@type {number | undefined}*/
    this.popularity = track.popularity
    /**@type {string[] | undefined}*/
    this.genres = track.genres
    
    /** @type {{
      * danceability?: number
      * energy?: number
      * key?: number
      * loudness?: number
      * mode?: number
      * speechiness?: number
      * acousticness?: number
      * instrumentalness?: number
      * liveness?: number
      * valence?: number
      * tempo?: number
      * time_signature?: number
     * }} */
    this.features = track.features || {}
  }

  /** @return {Promise<Track[]>} */
  static async all(filter) {
    let { data: tracks } = await core.instance.post(`/api/tracks`, {filter: filter})
    if(!tracks) tracks = []
    return tracks.map(track => new Track(track))
  }

}

module.exports = Track