const {mongo} = require('@clabroche/common-mongo')
const { Base } = require("@clabroche/common-crud");
const ArtistPersistence = require('./ArtistPersistence');
const AlbumPersistence = require('./AlbumPersistence');
const TrackPersistence = require('./TrackPersistence');
const { History } = require("@clabroche/spotify-analyzer-models").models;
const PromiseB = require('bluebird');
const SpotifyWebApi = require('spotify-web-api-node');
const dayjs = require('dayjs');
const { getAllDatesBetween } = require('../services/dates');
const CredentialPersistence = require('./CredentialPersistence');
const { getClient } = require('../services/spotify');
const UsersPersistence = require('@clabroche/mybank-modules-auth/src/models/Users');
const { sockets } = require('@clabroche/common-socket-server');
dayjs.locale('fr')
var utc = require('dayjs/plugin/utc')
dayjs.extend(utc)


const base = Base({ collectionName: 'histories' })

class HistoryPersistence extends History{
  static collectionName = base.collectionName
  /** @param {import('@clabroche/common-typings').NonFunctionProperties<HistoryPersistence>} history */
  constructor(history = {}) {
    super(history)
  }
  /**
  * @param {import('@clabroche/common-typings').NonFunctionProperties<HistoryPersistence>} filter
  * @returns {Promise<HistoryPersistence>}
  */
  static findOne(filter) {
    return base.getBy({ filter, Obj: HistoryPersistence })
  }
  /**
 * @param {{
 * filter?: import('@clabroche/common-typings').NonFunctionProperties<HistoryPersistence>
 * sort?: import('@clabroche/common-typings').NonFunctionPropertiesNumber<HistoryPersistence>,
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

  static async importFromFile(ownerId, file) {
    if(!ownerId) throw new Error('ownerId not found')
    const histories = await PromiseB.map(file, async history => {
      const {endTime,artistName,trackName,msPlayed} = history
      const trackId = await TrackPersistence.searchTrackIdFromArtistAndTitle(trackName, artistName)
      return {
        endTime, artistName, trackName, msPlayed, trackId
      }
    }, {concurrency: 8})
    const goodHistories = histories.filter(h => h.trackId)
    const badHistories = histories.filter(h => !h.trackId)
    let i = 0
    await PromiseB.map(badHistories, async history => {
      i++
      console.log('Process missing tracks from db', `${i}/${badHistories.length}`)
      const { endTime, artistName, trackName, msPlayed } = history
      
      const trackIdFromMongo = await TrackPersistence.searchTrackIdFromArtistAndTitle(trackName, artistName)
      if (trackIdFromMongo) {
        goodHistories.push({
          artistName,
          endTime,
          trackId: trackIdFromMongo,
          trackName,
          msPlayed
        })
      } else {
        const track = await TrackPersistence.search({
          artist: artistName,
          track: trackName
        }).catch(err => {
          console.error(err)
        })
        if(track) {
          goodHistories.push({
            artistName,
            endTime,
            trackId: track._id,
            trackName,
            msPlayed
          })
        }
        await new Promise(res => setTimeout(res, 1000)) 
      }
    }, {concurrency: 2})


    await PromiseB.map(goodHistories, async history => {
      const historyToInsert = {
        ownerId,
        played_at: dayjs(history.endTime).toISOString(),
        trackId: history.trackId
      }
      const existingHistory = await HistoryPersistence.findOne(historyToInsert)
      if(!existingHistory) {
        const historyPersistence = new HistoryPersistence(historyToInsert)
        await historyPersistence.save()
      }
    }, {concurrency: 8})
    console.log('end')
  }


  /**
   * 
   * @param {SpotifyWebApi} client 
   * @returns 
   */
  static async parseHistory(client, user) {
    const tracks = await client.getMyRecentlyPlayedTracks({limit:50}) // Took ~200ms
    return PromiseB.map(tracks.body?.items || [], async item => {
      /** @type {TrackPersistence} */
      let track
      await PromiseB.map(item.track.artists, async artist => {
        if(!await ArtistPersistence.findOne({_id: artist.id})) {
          const artistPersistence = new ArtistPersistence(artist)
          await artistPersistence.save()
        }
      })
      if (!await AlbumPersistence.findOne({ _id: item.track.album.id })) {
        const album = new AlbumPersistence(item.track.album)
        await album.save()
      }
      if (!await TrackPersistence.findOne({ _id: item.track.id })) {
        track = new TrackPersistence(item.track)
        await track.save()
      }
      let history = await HistoryPersistence.findOne({
        ownerId: user._id,
        trackId: item.track.id,
        played_at: dayjs(item.played_at).toISOString()
      })
      if (!history) {
        history = new HistoryPersistence({
          ownerId: user._id,
          trackId: item.track.id,
          played_at: dayjs(item.played_at).toISOString()
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
          from: `${mongo.prefix}-${require('./TrackPersistence').collectionName}`,
          localField: "trackId",
          foreignField: "_id",
          as: "track"
        }
      },
      { $unwind: '$track' },
      { $unwind: '$track.artistsIds' },
      { $group: { _id: "$track.artistsIds", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]).toArray()
  }

  /**
   * 
   * @param {string} ownerId 
   * @param {string} from 
   * @param {string} to 
   * @returns 
   */
  static async getGenres(ownerId, from, to) {
    if (!ownerId) throw new Error('ownerId is required')
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
          from: `${mongo.prefix}-${TrackPersistence.collectionName}`,
          localField: "trackId",
          foreignField: "_id",
          as: "track"
        }
      },
      { $unwind: '$track' },
      { $unwind: '$track.genres' },
      { $group: { _id: "$track.genres", count: { $sum: 1 } } },
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
          from: `${mongo.prefix}-${TrackPersistence.collectionName}`,
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
      { $sort: { count: -1 } },
      { $limit: 100 }
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
          from: `${mongo.prefix}-${TrackPersistence.collectionName}`,
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
  static async getNbListeningByDays(ownerId, from, to) {
    if (!ownerId) throw new Error('ownerId is required')
    return PromiseB.map(getAllDatesBetween(from, to), async date => {
      return {
        date: dayjs(date).toISOString(),
        nbListening: (await this.getListeningForDay(ownerId, date))?.length || 0
      }
    })
  }

  /**
   * 
   * @param {string} ownerId 
   * @param {string} from 
   * @param {string} to 
   * @returns 
   */
  static async getListeningTopHours(ownerId, from, to) {
    if (!ownerId) throw new Error('ownerId is required')
    return mongo.collection(base.collectionName).aggregate([
      {
        $match: {
          ownerId: mongo.getID(ownerId),
          played_at: {
            $gt: dayjs(from).toISOString(),
            $lt: dayjs(to).toISOString()
          },
        }
      }, {
        $addFields: {
          date: {
            $dateFromString: {
              dateString: '$played_at',
            }
          },
        }
      },
      {
        $project: {
          hour: { $hour: { date: "$date" } },
          trackId: 1
        }
      }, {
        $group: {
          _id: "$hour",
          count: { $sum: 1 },
          // titles: { $push: '$trackId' }
        }
      }, {
        $sort: {
          _id: 1
        }
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
  static async getListeningTopDays(ownerId, from, to) {
    if (!ownerId) throw new Error('ownerId is required')
    if (!ownerId) throw new Error('ownerId is required')
    return mongo.collection(base.collectionName).aggregate([
      {
        $match: {
          ownerId: mongo.getID(ownerId),
          played_at: {
            $gt: dayjs(from).startOf('day').toISOString(),
            $lt: dayjs(to).endOf('day').toISOString()
          },
        }
      }, {
        $addFields: {
          date: {
            $dateFromString: {
              dateString: '$played_at',
            }
          },
        }
      },
      {
        $project: {
          day: { $dayOfWeek: { date: "$date" , timezone: 'Europe/Paris'} },
          trackId: 1
        }
      }, {
        $group: {
          _id: "$day",
          count: { $sum: 1 },
          // titles: { $push: '$trackId' }
        }
      }, {
        $sort: {
          _id: 1
        }
      }
    ]).toArray()
  }

  /**
   * 
   * @param {string} ownerId 
   * @param {string} day 
   * @returns 
   */
  static async getListeningForDay(ownerId, day) {
    if (!ownerId) throw new Error('ownerId is required')
    const from = dayjs(day).startOf('day').toISOString()
    const to = dayjs(day).endOf('day').toISOString()
    return mongo.collection(base.collectionName).aggregate([
      {
        $match: {
          ownerId: mongo.getID(ownerId),
          played_at: {
            $gt: from,
            $lt: to
          },
        }
      },
      { $sort: { played_at: -1 } }
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

    const rand = Math.random()
    console.time(rand)
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
          sum_duration_ms: { $sum: "$duration_ms" },
          avg_time_signature: { $avg: "$time_signature" },
        }
      },
    ]).toArray().then(a => {
      console.timeEnd(rand)
      return a[0] || {}
    })
  }
  
  static async resyncHistory() {
    try {
      const credentialNotExpired = await CredentialPersistence.find({
        filter: {
          expires_at: {
            $gt: dayjs().toISOString()
          }
        }
      })
      const emailsToNotify = []
      await PromiseB.map(credentialNotExpired, async credential => {
        try {
          const user = await UsersPersistence.findOne({ _id: mongo.getID(credential.ownerId) })
          const client = getClient(credential.access_token, credential.refresh_token)
          const lastHistory = await HistoryPersistence.find({
            filter: { ownerId: user._id },
            sort: { played_at: -1 }
          })
          await HistoryPersistence.parseHistory(client, user)
          const newLastHistory = await HistoryPersistence.find({
            filter: { ownerId: user._id },
            sort: { played_at: -1 }
          })
          if (newLastHistory[0]?._id?.toString() !== lastHistory[0]?._id?.toString()) {
            emailsToNotify.push(user.email)
          }
        } catch (error) {
          console.error(error)
        }
      })

      await ArtistPersistence.enrich()
      await TrackPersistence.enrich()
      setTimeout(() => {
        emailsToNotify.map(email => sockets.emit(email, 'update:histories'))
      }, 100);
    } catch (error) {
      console.error(error)
    }

  }


}

module.exports = HistoryPersistence