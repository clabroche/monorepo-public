const { profiles, commands } = require('./conf');
const init = require('./events');
const gsettings = require('./gsettings');
const keycodeToRatbag = require('./resources/keycodeToRatbag.json');
const uploadIfNeeded = require('./upload')

const keyLabel = {
  0: 'G1',
  1: 'G2',
  2: 'G3',
  3: 'G4',
  4: 'G5',
}
const profileLabel = {
  0: 'M0',
  1: 'M1',
  2: 'M2',
}


try {
  gsettings.reset()
  console.log('Reset Media keys')
} catch (error) {
  console.error(error)  
}


init({
  async onkeypress({ code }) {
    const ratbagKey = keycodeToRatbag[code?.toString()]
    if(!ratbagKey) return
    let key = null
    let profile = null
    profiles.some((_profile, profileNumber) => _profile.buttons.some(button => {
      if (ratbagKey === button.macro) {
        key = keyLabel[button.button]
        profile = profileLabel[profileNumber]
      }
    }))
    const command = commands[`${profile}-${key}`] // Commands are set in conf.js
    try {
      if(command) await command()
    } catch (error) {
      console.error(error)
    }
  },
  onRemote() {
    console.log('Lightspeed mode')
  },
  onUSB() {
    console.log('USB mode')
    uploadIfNeeded()
  }
})

