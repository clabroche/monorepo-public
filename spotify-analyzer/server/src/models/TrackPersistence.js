const { Base } = require("@clabroche-org/common-crud");
const CredentialPersistence = require('./CredentialPersistence');
const dayjs = require('dayjs');
const { getClient } = require('../services/spotify');
const { Track } = require("@clabroche-org/spotify-analyzer-models").models;
const base = Base({ collectionName: 'tracks' })
const PromiseB = require('bluebird');
const { mongo } = require("@clabroche-org/common-mongo");

class TrackPersistence extends Track{
  static collectionName = base.collectionName
  /** @param {import('@clabroche-org/common-typings').NonFunctionProperties<TrackPersistence>} track */
  constructor(track = {}) {
    super(track)
  }
  /**
  * @param {import('@clabroche-org/common-typings').NonFunctionProperties<TrackPersistence>} filter
  * @returns {Promise<TrackPersistence>}
  */
  static findOne(filter) {
    return base.getBy({ filter, Obj: TrackPersistence })
  }
  /**
 * @param {{
 * filter?: import('@clabroche-org/common-typings').NonFunctionProperties<TrackPersistence>
 * sort?: import('@clabroche-org/common-typings').NonFunctionPropertiesNumber<TrackPersistence>,
 * skip?: number,
 * limit?: number
 * }} filter
 * @returns {Promise<TrackPersistence[]>}
 */
  static async find(filter) {
    return base.allBy({ Obj: TrackPersistence, ...filter })
  }


  delete() {
    return base.deleteOne({ obj: this })
  }


  async save() {
    if(!this.genres) {
      const artist = await require('./ArtistPersistence').findOne({_id: this.artistsIds[0]})
      this.genres = artist?.genres
    }
    return base.updateOrCreate({ obj: this, Obj: TrackPersistence })
  }

  static async search(filter) {
    const credential = await CredentialPersistence.findOne({
      alreadyNotifyed: { $ne: true },
      expires_at: {
        $gt: dayjs().add(1, 'minutes').toISOString()
      }
    })
    const client = getClient(credential.access_token, credential.refresh_token)
    const searchstring = Object.keys(filter).map(key => (`${key}:${filter[key]}`)).join(' ')
    const search = await client.searchTracks(searchstring,{
      limit:1,
    })
    const item = search.body.tracks?.items?.[0]
    if (item) {
      const track = new TrackPersistence(item)
      const ArtistPersistence = require('./ArtistPersistence')
      const AlbumPersistence = require('./AlbumPersistence')
      await PromiseB.map(item.artists, async artist => {
        if (!await ArtistPersistence.findOne({ _id: artist.id })) {
          const artistPersistence = new ArtistPersistence(artist)
          await artistPersistence.save()
        }
      })
      if (!await AlbumPersistence.findOne({ _id: item.album.id })) {
        const album = new AlbumPersistence(item.album)
        await album.save()
      }
      if (!await TrackPersistence.findOne({ _id: item.id })) {
        await track.save()
      }
      return track
    }
  }

  /**
   * 
   * @param {string} trackName 
   * @param {string} artistName 
   * @returns {Promise<string | undefined>}
   */
  static async searchTrackIdFromArtistAndTitle(trackName, artistName) {
    const tracksFromMongo = await mongo.collection("tracks").aggregate([{
      $match: {
        name: trackName
      },
    }, {
      $lookup: {
        from: `${mongo.prefix}-${require('./ArtistPersistence').collectionName}`,
        localField: "artistsIds",
        foreignField: "id",
        as: "artists"
      }
    }, {
      $project: {
        artists: 1
      }
    }, {
      $match: {
        'artists.name': artistName
      }
    }
    ]).toArray()
    return tracksFromMongo?.[0]?._id 
  }

  static async enrich() {
    await TrackPersistence.enrichWithFeatures().catch(console.error)
    await TrackPersistence.enrichWithGenres().catch(console.error)
  }
  static async enrichWithGenres() {
    const tracks = await TrackPersistence.find({filter: {'genres.0': {$exists:false}}})
    await PromiseB.map(tracks, track => track.save(), {concurrency: 8})
  }
  static async enrichWithFeatures() {
    const tracks = await TrackPersistence.find({
      filter: { 'features.danceability': null },
    })
    const credential = await CredentialPersistence.findOne({
      alreadyNotifyed: { $ne: true },
      expires_at: {
        $gt: dayjs().add(1, 'minutes').toISOString()
      }
    })
    const client = getClient(credential.access_token, credential.refresh_token)
    const chunckedTracks = chunck(tracks, 100)
    await PromiseB.map(chunckedTracks, async (chunck) => {
      const res = await client.getAudioFeaturesForTracks(chunck.map(c => c._id))
      await PromiseB.map(res.body.audio_features, async (spotFeatures) => {
        const track = await TrackPersistence.findOne({ _id: spotFeatures.id })
        track.features = spotFeatures
        await track.save()
      })
      await wait(500)
    }, { concurrency: 2 })
  }
}

/**
 * @template T
 * @param {T} arr 
 * @param {*} size 
 * @returns {T[]}
 */
function chunck(arr, size) {
  return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  )
}
const wait = (ms) => new Promise(res => setTimeout(res, ms))
module.exports = TrackPersistence