const CoreAPI = require('./apis/Core')
module.exports = {
  models: {
    Account: require('./models/Account'),
    User: require('./models/User'),
    Track: require('./models/Track'),
    Album: require('./models/Album'),
    History: require('./models/History'),
    Artist: require('./models/Artist'),
    Credential: require('./models/Credential'),
  },
  apis: {
    CoreAPI,
    coreAPI: CoreAPI.core,
  },
  /**
   * 
   * @param {string} bearer 
   */
  setBearer(bearer) {
    // @ts-ignore
    CoreAPI.core.instance.defaults.headers.authorization = bearer
  }
} 