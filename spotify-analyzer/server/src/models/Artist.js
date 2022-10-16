const {mongo} = require('@clabroche-org/common-mongo')
const { Base } = require("@clabroche-org/common-crud");
const { Artist } = require("@clabroche-org/spotify-analyzer-models").models;
const PromiseB = require('bluebird');
const { getClient } = require('../services/spotify');
const dayjs = require('dayjs');
const CredentialPersistence = require('./Credential');
const base = Base({ collectionName: 'artists' })

class ArtistPersistence extends Artist{
  static collectionName = base.collectionName
  /** @param {import('@clabroche-org/common-typings').NonFunctionProperties<ArtistPersistence>} artist */
  constructor(artist = {}) {
    super(artist)
  }
  /**
  * @param {import('@clabroche-org/common-typings').NonFunctionProperties<ArtistPersistence>} filter
  * @returns {Promise<ArtistPersistence>}
  */
  static findOne(filter) {
    return base.getBy({ filter, Obj: ArtistPersistence })
  }
  /**
 * @param {{
 * filter?: import('@clabroche-org/common-typings').NonFunctionProperties<ArtistPersistence>
 * sort?: import('@clabroche-org/common-typings').NonFunctionPropertiesNumber<ArtistPersistence>,
 * skip?: number,
 * limit?: number
 * }} filter
 * @returns {Promise<ArtistPersistence[]>}
 */
  static async find(filter) {
    return base.allBy({ Obj: ArtistPersistence, ...filter })
  }


  delete() {
    return base.deleteOne({ obj: this })
  }


  save() {
    return base.updateOrCreate({ obj: this, Obj: ArtistPersistence })
  }

  static async enrich() {
    const artists = await ArtistPersistence.find({
      filter: {
        images: null
      },
    })
    const missingArtists = await mongo.collection(require('./Track').collectionName).aggregate([
      { $unwind: '$artistsIds' },
      { $project: { artistsIds: 1 } },
      {
        $lookup: {
          from: mongo.prefix + '-' + base.collectionName,
          localField: "artistsIds",
          foreignField: "_id",
          as: "artists"
        },
      },
      {
        $match: { 'artists.0': { $exists: false } }
      },
      {
        $group: { _id: "$artistsIds" }
      }
    ]).toArray()
    artists.push(...missingArtists)
    const credential = await CredentialPersistence.findOne({
      alreadyNotifyed: { $ne: true },
      expires_at: {
        $gt: dayjs().add(1, 'minutes').toISOString()
      }
    })
    const client = getClient(credential.access_token, credential.refresh_token)
    const chunckedArtists = chunck(artists, 50)

    await PromiseB.map(chunckedArtists, async (chunck) => {
      const res = await client.getArtists(chunck.map(c => c._id))
      await PromiseB.map(res.body.artists, async (spotArtist) => {
        return new ArtistPersistence(spotArtist)
          .save()
      })
      await wait(500)
    }, { concurrency: 2 })
  }
}

module.exports = ArtistPersistence

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