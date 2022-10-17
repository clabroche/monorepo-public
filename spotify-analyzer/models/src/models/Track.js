const { core } = require('../apis/Core');
const genres = require('./genres');

class Track {
  /** @param {import('@clabroche-org/common-typings').NonFunctionProperties<Track>} track */
  constructor(track = {}) {
    /** @type {string} */
    this._id = track.id
    /**@type {string[]}*/
    this.artistsIds = track.artistsIds || []
    if(track.artists) track.artists.forEach(artist => {
      if(!this.artistsIds.includes(artist.id)) this.artistsIds.push(artist.id)
    });
    /**?@type {string[] | undefined}*/
    this.available_markets = track.available_markets
    /**@type {number}*/
    this.disc_number = track.disc_number
    /**@type {number}*/
    this.duration_ms = track.duration_ms
    /**@type {boolean}*/
    this.explicit = track.explicit
    /**@type {{spotify: string}}*/
    this.external_urls = track.external_urls
    /**@type {string}*/
    this.href = track.href
    /**@type {string}*/
    this.id = track.id
    /** @type {RestrictionsObject | undefined}*/
    this.restrictions = track.restrictions
    /**@type {string}*/
    this.name = track.name
    /**@type {string | null}*/
    this.preview_url = track.preview_url
    /**@type {number}*/
    this.track_number = track.track_number
    /**@type {'track'}*/
    this.type = track.type
    /**@type {string}*/
    this.uri = track.uri
    /**@type {string}*/
    this.albumId = track.albumId
    if (track.album) this.albumId = track.album.id
    /**@type {number}*/
    this.popularity = track.popularity
    /**@type {string[]}*/
    this.genres = track.genres
    
    /** @type {{
      * danceability: number
      * energy: number
      * key: number
      * loudness: number
      * mode: number
      * speechiness: number
      * acousticness: number
      * instrumentalness: number
      * liveness: number
      * valence: number
      * tempo: number
      * time_signature: number
     * }} */
    this.features = track.features || {}
  }

  /** @return {Promise<Track[]>} */
  static async all(filter) {
    let { data: tracks } = await core.instance.post(`/api/spotify/tracks`, {filter: filter})
    if(!tracks) tracks = []
    return tracks.map(track => new Track(track))
  }

}

module.exports = Track