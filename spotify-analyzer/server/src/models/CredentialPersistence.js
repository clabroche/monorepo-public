const { Base } = require("@clabroche-org/common-crud");
const dayjs = require("dayjs");
const { getClient } = require("../services/spotify");
const { Credential } = require("@clabroche-org/spotify-analyzer-models").models;
const sendinblue = require('../services/sendinblue');
const PromiseB = require('bluebird');
const path = require('path')
const { readFileSync } = require('fs-extra');
const { mongo } = require('@clabroche-org/common-mongo')
const reconnectTemplate = readFileSync(path.resolve(__dirname, '..', 'templatesEmail', 'reconnect.html'), 'utf-8')
const { User } = require('@clabroche-org/mybank-modules-auth').models;

const base = Base({ collectionName: 'credentials' })

class CredentialPersistence extends Credential{
  /** @param {import('@clabroche-org/common-typings').NonFunctionProperties<CredentialPersistence>} credential */
  constructor(credential = {}) {
    super(credential)
  }
  /**
  * @param {import('@clabroche-org/common-typings').NonFunctionProperties<CredentialPersistence>} filter
  * @returns {Promise<CredentialPersistence>}
  */
  static findOne(filter) {
    return base.getBy({ filter, Obj: CredentialPersistence })
  }
  /**
 * @param {{
 * filter?: import('@clabroche-org/common-typings').NonFunctionProperties<CredentialPersistence>
 * sort?: import('@clabroche-org/common-typings').NonFunctionPropertiesNumber<CredentialPersistence>,
 * skip?: number,
 * limit?: number
 * }} filter
 * @returns {Promise<CredentialPersistence[]>}
 */
  static async find(filter) {
    return base.allBy({ Obj: CredentialPersistence, ...filter })
  }


  delete() {
    return base.deleteOne({ obj: this })
  }


  save() {
    return base.updateOrCreate({ obj: this, Obj: CredentialPersistence })
  }

  static async refreshAllTokenThatNeedIt() {
    try {
      const credentialExpiresSoon = await CredentialPersistence.find({
        filter: {
          expires_at: {
            $lt: dayjs().add(2, 'minutes').toISOString(),
            $gt: dayjs().subtract(1, 'second').toISOString()
          }
        }
      })
      await PromiseB.map(credentialExpiresSoon, async credential => {
        try {
          const client = getClient(credential.access_token, credential.refresh_token)
          const res = await client.refreshAccessToken()
          const { access_token, expires_in, refresh_token } = res.body
          credential.access_token = access_token
          credential.expires_in = expires_in
          credential.expires_at = dayjs().add(expires_in, 'seconds').toISOString()
          if (refresh_token) credential.refresh_token = refresh_token
          await credential.save()
        } catch (error) {

        }
      }, { concurrency: 5 })
    } catch (error) {
      console.error(error)
    }
  }
  static async detectAllExpiredTokens() {
    try {
      const credentialExpiresSoon = await CredentialPersistence.find({
        filter: {
          alreadyNotifyed: { $ne: true },
          expires_at: {
            $lt: dayjs().subtract(1, 'second').toISOString()
          }
        }
      })
      await PromiseB.map(credentialExpiresSoon, async credential => {
        try {
          credential.alreadyNotifyed = true
          credential.save()
          const user = await User.findOne({
            _id: mongo.getID(credential.ownerId)
          })
          await sendinblue.send(user.email, user.email, reconnectTemplate)
        } catch (error) {
          console.error(error)
        }
      }, { concurrency: 5 })
    } catch (error) {
      console.error(error)
    }
  }

}

module.exports = CredentialPersistence