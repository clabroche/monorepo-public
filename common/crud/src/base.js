// @ts-ignore
const { mongo } = require('@clabroche/common-mongo')

const errors = {
  ObjIsUndefined: 'You should specify a class',
  objIsUndefined: 'You should specify an object',
  objNotFound: 'Object not found in DB',
  filterIsObject: 'Filter should be an object',
  sortIsObject: 'Sort should be an object'
}
function updateForMongoId(filter) {
  if (!filter) return null
  if (filter._id && typeof filter._id === "string" && new RegExp(/^[0-9a-fA-F]{24}$/).test(filter._id)) {
    filter._id = mongo.getID(filter._id)
  }
  return filter
}
class Base {
  constructor({ collectionName }) {
    this.collectionName = collectionName
  }

  /**
   * @param {{
   * filter?: import('@clabroche/common-typings').NonFunctionProperties<T>,
   * Obj?: { new(): T }
   * }} param0
   * @returns {Promise<T>}
   * @template T
   */
  async getBy({ filter, Obj, lookups } = {}) {
    if (!Obj) throw new Error(errors.ObjIsUndefined)
    updateForMongoId(filter)
    const aggr = [
      { $match: filter },
    ]
    if (lookups?.length) {
      aggr.push(...lookups)
    }
    const base = await mongo.collection(this.collectionName)
      .aggregate(aggr)
      .toArray()
    // @ts-ignore
    return base[0] ? new Obj(base[0]) : null
  }


  /**
   * @param {{
   * obj?: import('@clabroche/common-typings').NonFunctionProperties<T> ,
   * Obj?: { new(): T }
   * }} obj
   * @returns {Promise<T>}
   * @template T
   */
  async reload({ obj, Obj } = {}) {
    if (!Obj) throw new Error(errors.ObjIsUndefined)
    if (!obj) throw new Error(errors.objIsUndefined)
    updateForMongoId(obj)
    // @ts-ignore
    const base = await this.getBy({ filter: { _id: obj._id }, Obj })
    if (!base) throw new Error(errors.objNotFound)
    Object.keys(base).map((key) => (obj[key] = base[key]))
    // @ts-ignore
    return obj
  }

  /**
   * @param {{
   * filter?: import('@clabroche/common-typings').NonFunctionProperties<T>
   * sort?: import('@clabroche/common-typings').NonFunctionPropertiesNumber<T>,
   * Obj?: {new(t:import('@clabroche/common-typings').NonFunctionProperties<{ new(): T }>): T},
   * skip?: number,
   * limit?: number
   * }} param0
   * @returns {Promise<T[]>}
   * @template T
   */
  // @ts-ignore
  async allBy({ filter = {}, sort = { _id: 1 }, skip = 0, limit = 100000, project, Obj } = {}) {
    if (!Obj) throw new Error(errors.ObjIsUndefined)
    if (filter != null && typeof filter !== 'object') throw new Error(errors.filterIsObject)
    if (sort != null && typeof sort !== 'object') throw new Error(errors.sortIsObject)
    const aggregate = []
    if (filter != null && Object.keys(filter)) aggregate.push({ $match: filter })
    if (sort != null && Object.keys(sort)) aggregate.push({ $sort: sort })
    if (skip == null || Number.isNaN(+skip) || +skip < 0) skip = 0
    if (limit == null || Number.isNaN(+limit) || +limit < 0) limit = 100000
    aggregate.push({ $skip: +skip })
    aggregate.push({ $limit: +limit })
    if (project) aggregate.push({ $project: project })
    updateForMongoId(filter)
    const bases = await mongo.collection(this.collectionName).aggregate(aggregate).toArray()
    const res = []
    let i = 0
    while (i < bases.length) {
      const base = bases[i];
      res.push(new Obj(base))
      i++
    }
    return res
  }

  async aggregate(aggregate) {
    return mongo.collection(this.collectionName).aggregate(aggregate).toArray()

  }

  /**
   * @param {{
   * filter?: import('@clabroche/common-typings').NonFunctionProperties<T>
   * }} param0
   * @returns {Promise<number>}
   * @template T
   */
  async count({ filter = {} } = {}) {
    if (filter != null && typeof filter !== 'object') throw new Error(errors.filterIsObject)
    updateForMongoId(filter)
    return mongo.collection(this.collectionName).find(filter).count()
  }

  /**
   * @param {{
   * obj?: import('@clabroche/common-typings').NonFunctionProperties<T>,
   * excludedFields?: string[],
   * Obj?: { new(): T }
   * }} param0
   * @returns {Promise<T>}
   * @template T
   */
  async create({ obj, excludedFields = [], Obj } = {}) {
    if (!Obj) throw new Error(errors.ObjIsUndefined)
    const clone = cloneAndExcludeFields({ obj, excludedFields, Obj })
    // @ts-ignore
    if (!clone._id) clone._id = mongo.getID()
    updateForMongoId(clone)
    const res = await mongo.collection(this.collectionName).insertOne(clone)
    // @ts-ignore
    obj._id = res.insertedId
    return this.reload({ obj, Obj })
  }

  /**
   * @param {{
   * obj?: import('@clabroche/common-typings').NonFunctionProperties<T>,
   * excludedFields?: string[],
   * Obj?: {new(): T},
   * }} param0
   * @returns {Promise<T>}
   * @template T
   */
  async update({ obj, excludedFields = [], Obj } = {}) {
    if (!Obj) throw new Error(errors.ObjIsUndefined)
    const clone = cloneAndExcludeFields({ obj, excludedFields, Obj })
    // @ts-ignore
    const _id = obj._id?.length ? mongo.getID(obj._id) : obj._id
    // @ts-ignore
    delete clone._id
    await mongo
      // @ts-ignore
      .collection(this.collectionName)
      // @ts-ignore
      .updateOne({ _id }, { $set: clone }, { upsert: true })
    // @ts-ignore
    obj._id = _id
    return this.reload({ obj, Obj })
  }

  /**
   * @param {{
   * obj?: import('@clabroche/common-typings').NonFunctionProperties<T>,
   * filter?: import('@clabroche/common-typings').NonFunctionProperties<T>,
   * excludedFields?: string[],
   * Obj?: {new(): T},
   * }} param0
   * @template T
   */
  async updateMany({ filter, obj, excludedFields = [], Obj } = {}) {
    if (!Obj) throw new Error(errors.ObjIsUndefined)
    updateForMongoId(filter)
    const clone = cloneAndExcludeFields({ obj, excludedFields, Obj })
    // @ts-ignore
    delete clone._id
    await mongo
      // @ts-ignore
      .collection(this.collectionName)
      // @ts-ignore
      .updateMany(filter, { $set: clone }, { upsert: true })
  }

  /**
   * @param {{
   * obj?: import('@clabroche/common-typings').NonFunctionProperties<T>,
   * excludedFields?: string[],
   * Obj?: { new(): T }
   * }} param0
   * @returns {Promise<T>}
   * @template T
   */
  async updateOrCreate({ obj, excludedFields = [], Obj } = {}) {
    if (!Obj) throw new Error(errors.ObjIsUndefined)
    updateForMongoId(obj)
    // @ts-ignore
    return obj._id
      ? this.update({ obj, excludedFields, Obj })
      : this.create({ obj, excludedFields, Obj })
  }

  /**
   * @param {{
   * obj?: T
   * }} param0
   * @return {Promise<T>}
   * @template T
   */
  async deleteOne({ obj } = {}) {
    if (!obj) throw new Error(errors.objIsUndefined)
    // @ts-ignore
    const _id = mongo.getID(obj._id)
    await mongo.collection(this.collectionName).deleteOne({ _id })
    return obj
  }
}

/**
 * @param {{
 * obj: T,
 * excludedFields: string[],
 * Obj?: { new(): T }
 * }} param0
 * @return {T}
 * @template T
 */
function cloneAndExcludeFields({ obj, excludedFields, Obj }) {
  // @ts-ignore
  const clone = Object.assign({}, new Obj(obj))
  Object.keys(clone).forEach((key) => {
    if (clone[key] instanceof Function || excludedFields.includes(key)) {
      delete clone[key]
    }
  })
  return clone
}
module.exports = ({ collectionName }) => {
  return new Base({ collectionName })
}
