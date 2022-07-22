const { ObjectID } = require('mongodb')
const context = require("@clabroche-org/common-context")
/**
 * Set a filter field on req. This object can be used to query mongo 
 * @param {import('@clabroche-org/common-typings').FieldDescriptior[]} availableFilters All your filter available (used to protect backend from front that query a forbidden field)
 * @return {import('express').RequestHandler}
 */
module.exports = (availableFilters) => (req, res, next) => {
  if (!availableFilters) availableFilters = []
  // @ts-ignore
  const { limit, skip, sort } = req.query
  const search = {
    limit: 10000,
    skip: 0,
    sort: { _id: -1 },
  }
  if (req.query.hasOwnProperty('limit')) {
    if (Number.isNaN(+limit) || typeof limit === 'boolean') {
      return res.status(400).send('Limit is not a parsable number')
    } else if (+limit < 0) {
      return res.status(400).send('Limit should be positive')
    } else {
      search.limit = +limit
    }
  }

  if (req.query.hasOwnProperty('skip')) {
    if (Number.isNaN(+skip) || typeof skip === 'boolean') {
      return res.status(400).send('Skip is not a parsable number')
    } else if (+skip < 0) {
      return res.status(400).send('Skip should be positive')
    } else {
      search.skip = +skip
    }
  }
  if (sort) {
    try {
      search.sort = JSON.parse(sort.toString())
    } catch (error) {
      return res.status(400).send('Sort is malformed')
    }
  }

  let filter = {}
  try { // Parse query for example ?filter='{field: {$eq: 0}}'
    if (req.query.filter) {
      filter = JSON.parse(req.query.filter.toString())
    } else if (typeof req.query.filter === 'object') {
      filter = req.query.filter
    }
  } catch (err) {
    return res.status(400).send('Filter is malformed')
  }

  for (const queryField in req.query) {
    const availableFilter = availableFilters.find(conf => conf.field === queryField)
    if (!availableFilter) continue
    let value
    if (availableFilter.type === 'string') {
      value = req.query[queryField]
    } else if (availableFilter.type === 'number') {
      value = +req.query[queryField]
    } else if (availableFilter.type === 'boolean') {
      value = req.query[queryField] === 'true' ? true : false
    } else if (availableFilter.type === 'objectId') {
      value = new ObjectID(req.query[queryField].toString())
    } else {
      return res.status(200).send('Searchable fields is not correct')
    }
    filter[queryField] = value
  }
  try {
    context.setItem('search', { ...search, filter })
    return next()
  } catch (error) {
    return res.status(500).send(error?.message || error)
  }
}
