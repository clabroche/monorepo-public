const {mongo} = require('@clabroche/common-mongo')
const { Base } = require("@clabroche/common-crud");
const { Album } = require("@clabroche/spotify-analyzer-models").models;
const base = Base({ collectionName: 'albums' })

class AlbumPersistence extends Album{
  /** @param {import('@clabroche/common-typings').NonFunctionProperties<AlbumPersistence>} album */
  constructor(album = {}) {
    super(album)
  }
  /**
  * @param {import('@clabroche/common-typings').NonFunctionProperties<AlbumPersistence>} filter
  * @returns {Promise<AlbumPersistence>}
  */
  static findOne(filter) {
    return base.getBy({ filter, Obj: AlbumPersistence })
  }
  /**
 * @param {{
 * filter?: import('@clabroche/common-typings').NonFunctionProperties<AlbumPersistence>
 * sort?: import('@clabroche/common-typings').NonFunctionPropertiesNumber<AlbumPersistence>,
 * skip?: number,
 * limit?: number
 * }} filter
 * @returns {Promise<AlbumPersistence[]>}
 */
  static async find(filter) {
    return base.allBy({ Obj: AlbumPersistence, ...filter })
  }


  delete() {
    return base.deleteOne({ obj: this })
  }


  save() {
    return base.updateOrCreate({ obj: this, Obj: AlbumPersistence })
  }
}

module.exports = AlbumPersistence