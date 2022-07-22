const context = require("@clabroche-org/common-context")
module.exports = {
  Base: require('./base'),
  middlewares: {
    parseFilterQuery: require('./parseFilterQuery'),
    /** 
     * @type {() => {
     * filter?: {[key: string]: any}
     * sort?: {[key: string]: number}
     * skip?: number,
     * limit?: number
     * }}
     */
    // @ts-ignore
    getFilterQuery: () => context.getItem('search')
  },
  CRUDTests: require('./tests')
}