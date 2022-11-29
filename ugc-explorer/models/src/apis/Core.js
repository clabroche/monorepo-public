const Axios = require('axios').default
const CustomObservable = require('@clabroche-org/common-custom-observable')
const envs = require('@clabroche-org/ugc-explorer-env')

class Core {
  constructor() {
    this.instance = Axios.create({
      baseURL: `${envs.URL_CORE}/`,
    })
    this.errorObservable = new CustomObservable()
    this.requestObservable = new CustomObservable()
    this.instance.interceptors.request.use(request => {
      this.requestObservable.next(request)
      return request
    })
    this.instance.interceptors.response.use(response => response, error => {
      this.errorObservable.next(error)
      return Promise.reject(error);
    })
  }
}

module.exports = Core
module.exports.core = new Core()