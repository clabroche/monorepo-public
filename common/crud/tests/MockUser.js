const Base = require('../src/base')
const collectionName = 'users'
const excludedFieldsFromMongo = [
]
const base = Base({ collectionName })
class Mock {
  /** @param {MockWithoutMethods} mock */
  constructor(mock = {}) {
    /** @type {string} */
    this._id = mock._id
    /** @type {string} */
    this.email = mock.email
    /** @type {string} */
    this.firstname = mock.firstname
    /** @type {string} */
    this.lastname = mock.lastname
  }
  /**
   * @param {{
   * filter?: MockWithoutMethods,
   * sort?: import('@clabroche/common-typings').NonFunctionPropertiesNumber<Mock>,
   * skip?: number,
   * limit?: number
   * }} param0
   */
  static allBy({ filter = {}, sort = { _id: 1 }, skip = 0, limit = 100000 } = {}) {
    return base.allBy({ filter, sort, skip, limit, Obj: Mock })
  }

  /**
   * @param {MockWithoutMethods} filter
   */
  static getBy(filter) {
    return base.getBy({ filter, Obj: Mock })
  }

  save() {
    return base.updateOrCreate({ obj: this, excludedFields: excludedFieldsFromMongo, Obj: Mock })
  }

  /**
   * @param {MockWithoutMethods} mock
   */
  static updateOrCreate(mock = {}) {
    return base.updateOrCreate({ obj: mock, excludedFields: excludedFieldsFromMongo, Obj: Mock })
  }

  /**
   * @param {MockWithoutMethods} mock
   */
  static create(mock) {
    return base.create({ obj: mock, excludedFields: excludedFieldsFromMongo, Obj: Mock })
  }

  /**
   * @param {MockWithoutMethods} mock
   */
  static update(mock) {
    return base.update({ obj: mock, excludedFields: [], Obj: Mock })
  }
  /**
   * @param {MockWithoutMethods} mock
   */
  static delete(mock) {
    return base.deleteOne({ obj: mock })
  }
}
module.exports = Mock
module.exports.collectionName = collectionName


/**
 * @typedef {import('@clabroche/common-typings').NonFunctionProperties<Mock>} MockWithoutMethods
 */