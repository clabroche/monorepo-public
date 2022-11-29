const CoreAPI = require('./apis/Core')
module.exports = {
  models: {
    Account: require('./models/Account'),
    User: require('./models/User'),
    Credential: require('./models/Credential'),
    Screening: require('./models/Screening'),
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