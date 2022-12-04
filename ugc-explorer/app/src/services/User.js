import { apis } from "@clabroche/ugc-explorer-models"
import Auth from "./Auth"

/**
 * 
 * @param {User} user 
 */
// @ts-ignore
// eslint-disable-next-line no-unused-vars
function User(user = {}) {
  this._id = user._id || null
  this.email = user.email || ""
  this.username = user.username || ""
  this.password = ""
  this.requisitions = user.requisitions || []
}

User.prototype.save = async function () {
  const { data: user } = await apis.coreAPI.instance.post('api/user', this, {
    headers: { token: Auth.token }
  })
  this._id = user._id
}

export default User
