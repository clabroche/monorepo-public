const {mongo} = require('@clabroche-org/common-mongo')
const { Base } = require("@clabroche-org/common-crud");
const CredentialPersistence = require('./Credential');
const dayjs = require('dayjs');
const { getClient } = require('../services/spotify');
const { Track } = require("@clabroche-org/spotify-analyzer-models").models;
const base = Base({ collectionName: 'tracks' })
const PromiseB = require('bluebird')

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


  save() {
    return base.updateOrCreate({ obj: this, Obj: TrackPersistence })
  }

  static async enrich() {
    const tracks = await TrackPersistence.find({
      filter: {
        'features.danceability': null
      },
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
        console.log('update')
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