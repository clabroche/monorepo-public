const {mongo} = require('@clabroche-org/common-mongo')
const { Base } = require("@clabroche-org/common-crud");
const ArtistPersistence = require('./Artist');
const AlbumPersistence = require('./Album');
const TrackPersistence = require('./Track');
const { History } = require("@clabroche-org/spotify-analyzer-models").models;
const PromiseB = require('bluebird');
const SpotifyWebApi = require('spotify-web-api-node');
const dayjs = require('dayjs');

const base = Base({ collectionName: 'histories' })

class HistoryPersistence extends History{
  static collectionName = base.collectionName
  /** @param {import('@clabroche-org/common-typings').NonFunctionProperties<HistoryPersistence>} history */
  constructor(history = {}) {
    super(history)
  }
  /**
  * @param {import('@clabroche-org/common-typings').NonFunctionProperties<HistoryPersistence>} filter
  * @returns {Promise<HistoryPersistence>}
  */
  static findOne(filter) {
    return base.getBy({ filter, Obj: HistoryPersistence })
  }
  /**
 * @param {{
 * filter?: import('@clabroche-org/common-typings').NonFunctionProperties<HistoryPersistence>
 * sort?: import('@clabroche-org/common-typings').NonFunctionPropertiesNumber<HistoryPersistence>,
 * skip?: number,
 * limit?: number
 * }} filter
 * @returns {Promise<HistoryPersistence[]>}
 */
  static async find(filter) {
    return base.allBy({ Obj: HistoryPersistence, ...filter })
  }


  delete() {
    return base.deleteOne({ obj: this })
  }


  save() {
    return base.updateOrCreate({ obj: this, Obj: HistoryPersistence })
  }

  /**
   * 
   * @param {SpotifyWebApi} client 
   * @returns 
   */
  static async parseHistory(client, user) {
    const tracks = await client.getMyRecentlyPlayedTracks({limit:50})
    return PromiseB.map(tracks.body?.items || [], async item => {
      /** @type {TrackPersistence} */
      let track
      if (!await TrackPersistence.findOne({ _id: item.track.id })) {
        track = new TrackPersistence(item.track)
        await track.save()
      }
      if (!await AlbumPersistence.findOne({ _id: item.track.album.id })) {
        const album = new AlbumPersistence(item.track.album)
        await album.save()
      }
      await PromiseB.map(item.track.artists, async artist => {
        if(!await ArtistPersistence.findOne({_id: artist.id})) {
          const artistPersistence = new ArtistPersistence(artist)
          await artistPersistence.save()
        }
      })
      let history = await HistoryPersistence.findOne({
        ownerId: user._id,
        trackId: item.track.id,
        played_at: item.played_at
      })
      if (!history) {
        history = new HistoryPersistence({
          ownerId: user._id,
          trackId: item.track.id,
          played_at: item.played_at
        })
        await history.save()
      }
      return history
    }, { concurrency: 5 })
    .then(async (histories) => {
      await ArtistPersistence.enrich()
      await TrackPersistence.enrich()
      return histories
    })
  }

  /**
   * 
   * @param {string} ownerId 
   * @param {string} from 
   * @param {string} to 
   * @returns 
   */
  static async getBestArtists(ownerId, from, to) {
    if (!ownerId) throw new Error('ownerId is required')
    return mongo.collection(base.collectionName).aggregate([
      { $match: {
        ownerId: mongo.getID(ownerId),
        played_at: { 
          $gt: dayjs(from).toISOString(),
          $lt: dayjs(to).toISOString()
        },
      }},
      {
        $lookup: {
          from: `${mongo.prefix}-${require('./Track').collectionName}`,
          localField: "trackId",
          foreignField: "_id",
          as: "track"
        }
      },
      { $unwind: '$track' },
      { $unwind: '$track.artistsIds' },
      { $group: { _id: "$track.artistsIds", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray()
  }
  /**
 * 
 * @param {string} ownerId 
 * @param {string} from 
 * @param {string} to 
 * @returns 
 */
  static async getNbDifferentArtists(ownerId, from, to) {
    if (!ownerId) throw new Error('ownerId is required')
    return HistoryPersistence.getDifferentArtists(ownerId,from, to)
      .then(res => res.length)
  }

  static async getDifferentArtists(ownerId, from, to) {
    return mongo.collection(base.collectionName).aggregate([
      {
        $match: {
          ownerId: mongo.getID(ownerId),
          played_at: {
            $gt: dayjs(from).toISOString(),
            $lt: dayjs(to).toISOString()
          },
        }
      },
      {
        $lookup: {
          from: `${mongo.prefix}-${require('./Track').collectionName}`,
          localField: "trackId",
          foreignField: "_id",
          as: "track"
        }
      },
      { $unwind: '$track' },
      { $unwind: '$track.artistsIds' },
      {
        $group: {
          _id: "$track.artistsIds",
          count: {$sum: 1}
        }
      },
      {
        $sort: {count: -1}
      }
    ]).toArray()
  }



  /**
 * 
 * @param {string} ownerId 
 * @param {string} from 
 * @param {string} to 
 * @returns 
 */
  static async getNewArtists(ownerId, from, to) {
    if (!ownerId) throw new Error('ownerId is required')
    const differentArtistsFromPeriod = await HistoryPersistence.getDifferentArtists(ownerId, from, to)
    const differentArtistsBefore = await HistoryPersistence.getDifferentArtists(ownerId, dayjs().subtract(100, 'years').toISOString(), from)
    const idsBefore = differentArtistsBefore.map(a => a._id)
    const newArtists = differentArtistsFromPeriod
      .filter(stat => !idsBefore.includes(stat._id))
    return newArtists
  }
  /**
   * 
   * @param {string} ownerId 
   * @param {string} from 
   * @param {string} to 
   * @returns 
   */
  static async getBestTitles(ownerId, from, to) {
    if (!ownerId) throw new Error('ownerId is required')
    return mongo.collection(base.collectionName).aggregate([
      { $match: {
        ownerId: mongo.getID(ownerId),
        played_at: { 
          $gt: dayjs(from).toISOString(),
          $lt: dayjs(to).toISOString()
        },
      }},
      {
        $lookup: {
          from: `${mongo.prefix}-${require('./Track').collectionName}`,
          localField: "trackId",
          foreignField: "_id",
          as: "track"
        }
      },
      { $unwind: '$track' },
      { $group: { _id: "$track._id", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray()
  }

  /**
   * 
   * @param {string} ownerId 
   * @param {string} from 
   * @param {string} to 
   * @returns 
   */
  static async getFeatures(ownerId, from, to) {
    if (!ownerId) throw new Error('ownerId is required')
    return mongo.collection(HistoryPersistence.collectionName).aggregate([
      { $match: {
        ownerId: mongo.getID(ownerId),
        played_at: { 
          $gt: dayjs(from).toISOString(),
          $lt: dayjs(to).toISOString()
        },
      }},
      {
        $lookup: {
          from: `${mongo.prefix}-${TrackPersistence.collectionName}`,
          localField: "trackId",
          foreignField: "_id",
          as: "track"
        }
      }, {
        $unwind: '$track'
      },
      {
        $replaceRoot: { newRoot: "$track.features" }
      },
      {
        $addFields: { 
          liveness: { $cond: [{ $gt: ['$liveness', 0.8] }, 1, 0] },
          speechiness: { $cond: [{ $gt: ['$speechiness', 0.66] }, 1, 0] },
          instrumentalness: { $cond: [{ $gt: ['$instrumentalness', 0.5] }, 1, 0] },
          acousticness: { $cond: [{ $gt: ['$acousticness', 0.5] }, 1, 0] },
        }
      },
      {
        $group: {
          _id: "",
          avg_loundness: { $avg: "$loudness" },
          avg_danceability: { $avg: "$danceability" },
          avg_energy: { $avg: "$energy" },
          avg_key: { $avg: "$key" },
          avg_mode: { $avg: "$mode" },
          avg_speechiness: { $avg: "$speechiness" },
          avg_acousticness: { $avg: "$acousticness" },
          avg_instrumentalness: { $avg: "$instrumentalness" },
          avg_liveness: { $avg: "$liveness" },
          avg_valence: { $avg: "$valence" },
          avg_tempo: { $avg: "$tempo" },
          avg_duration_ms: { $avg: "$duration_ms" },
          avg_time_signature: { $avg: "$time_signature" },
        }
      },
    ]).toArray().then(a => {
      return a[0] || {}
    })
  }
  

}

module.exports = HistoryPersistence