const {mongo} = require('@clabroche-org/common-mongo')
const { Base } = require("@clabroche-org/common-crud");
const { Credential } = require("@clabroche-org/spotify-analyzer-models").models;
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
}

module.exports = CredentialPersistence