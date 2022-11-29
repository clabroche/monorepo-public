import User from './User'
import { ref } from 'vue'
import { apis } from '@clabroche-org/ugc-explorer-models'
function Auth() {
  /**
   * @type {import('vue').Ref<import('./User').default>}
   */
  this.user = ref(null)
  /** @type {String} */
  this.token = localStorage.getItem('token') || ''
  apis.coreAPI.instance.defaults.headers.authorization = this.token
  if (this.token) {
    this.getUser()
  }

}
/**
 * @return {Promise<Boolean>}
 */
Auth.prototype.isLogged = async function () {
  const { data: isLogged } = await apis.coreAPI.instance.get('api/accounts/me')
  return isLogged
}
/**
 * @return {Promise<User>}
 */
Auth.prototype.getUser = async function () {
  const { data: user } = await apis.coreAPI.instance.get('api/accounts/me', {
    headers: {
      token: this.token
    }
  })
  this.user.value = new User(user)
  return this.user.value
}
/**
 * @return {Promise<User>}
 */
Auth.prototype.save = async function () {
  await apis.coreAPI.instance.post('api/accounts/me', this.user.value, {
    headers: {
      token: this.token
    }
  })
  return this.user.value
}
Auth.prototype.disconnect = async function () {
  this.user.value = null
  this.token = null
  localStorage.setItem('token', null)
}

/**
 * @param {User} user
 * @return {Promise<string|boolean>}
 */
Auth.prototype.login = async function (user) {
  const { data: token } = await apis.coreAPI.instance.post('api/accounts/login', user)
  if (token) {
    this.token = token
    apis.coreAPI.instance.defaults.headers.authorization = this.token
    this.user.value = await this.getUser()
  }
  localStorage.setItem('token', this.token)
  return token
}

/**
 * @param {User} user
 * @return {Promise<string|boolean>}
 */
Auth.prototype.register = async function (user) {
  const { data: token } = await apis.coreAPI.instance.post('api/accounts/register', user)
  if (token) {
    this.token = token
    apis.coreAPI.instance.defaults.headers.authorization = this.token
    this.user.value = await this.getUser()
  }
  localStorage.setItem('token', this.token)
  return token
}
export default new Auth()
