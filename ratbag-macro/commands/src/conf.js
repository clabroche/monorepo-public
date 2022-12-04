const { launchOrDisplaySpotify } = require('./commands/spotify')
const keycodeToRatbag = require('./resources/keycodeToRatbag.json')
const XF86 = require('./resources/X86Keys.json')
const { execSync } = require('child_process')
const { saveWindow, switchWindow } = require('./commands/switch')
const { suspend } = require('./commands/suspend')
const { alttab } = require('./commands/navigation')

const ledBlue = [
  { led: 0, mode: 'breathing', color: '0882ff', duration: 3000, brightness: 255 },
  { led: 1, mode: "on", color: "0882ff" }
]
const ledRed = [
  { led: 0, mode: 'breathing', color: 'ff0000', duration: 3000, brightness: 255 },
  { led: 1, mode: "on", color: "ff0000" }
]
const ledOrange = [
  { led: 0, mode: 'breathing', color: 'FA6500', duration: 3000, brightness: 255 },
  { led: 1, mode: "on", color: "FA6500" }
]

module.exports = {
  commands: {
    'M0-G2': alttab,
    'M0-G3': launchOrDisplaySpotify,
    'M0-G4': switchWindow,
    'M0-G5': saveWindow,
    'M1-G2': launchOrDisplaySpotify,
    'M1-G3': launchOrDisplaySpotify,
    'M1-G4': launchOrDisplaySpotify,
    'M1-G5': launchOrDisplaySpotify,
    'M2-G2': suspend,
    'M2-G3': launchOrDisplaySpotify,
  },
  gsettings: [
    // ['volume-down-static', XF86.AudioLowerVolume.key],
    // ['volume-down-precise-static', XF86.AudioLowerVolume.key],
    // ['volume-down-quiet-static', XF86.AudioLowerVolume.key],
    // ['volume-up-static', XF86.AudioRaiseVolume.key],
    // ['volume-up-precise-static', XF86.AudioRaiseVolume.key],
    // ['volume-up-quiet-static', XF86.AudioRaiseVolume.key],
    ['volume-down-quiet', XF86.AudioLowerVolume.key],
    ['volume-up-quiet', XF86.AudioRaiseVolume.key],
    ['next-static', XF86.AudioNext.key],
    ['play-static', XF86.AudioPlay.key],
    ['previous-static', XF86.AudioPrev.key],
    ['volume-mute-quiet-static', XF86.AudioMute.key],
    ['mic-mute-static', XF86.Tools.key],
  ],
  profiles: [
    {
      led: ledBlue,
      buttons: [
        { button: 0, macro: keycodeToRatbag[XF86.AudioMicMute.keycode] },
        { button: 1, macro: keycodeToRatbag[184] },
        { button: 2, macro: keycodeToRatbag[185] },
        { button: 3, macro: keycodeToRatbag[186] },
        { button: 4, macro: keycodeToRatbag[187] },
        { button: 5, special: 'profile-cycle-up' },
        { button: 6, special: 'profile-cycle-up' },
        { button: 7, special: 'profile-cycle-up' },
      ]
    },
    {
      led: ledOrange,
      buttons: [
        { button: 0, macro: keycodeToRatbag[XF86.AudioMicMute.keycode] }, // Reserved to dictXF86.XF86Tools mapped on mic mute
        { button: 1, macro: keycodeToRatbag[188] },
        { button: 2, macro: keycodeToRatbag[189] },
        { button: 3, macro: keycodeToRatbag[190] },
        { button: 4, macro: keycodeToRatbag[191] },
        { button: 5, special: 'profile-cycle-up' },
        { button: 6, special: 'profile-cycle-up' },
        { button: 7, special: 'profile-cycle-up' },
      ]
    },
    {
      led: ledRed,
      buttons: [
        { button: 0, macro: keycodeToRatbag[XF86.AudioMicMute.keycode] }, // Reserved to dictXF86.XF86Tools mapped on mic mute
        { button: 1, macro: keycodeToRatbag[193] },
        { button: 2, macro: keycodeToRatbag[194] },
        { button: 3, macro: keycodeToRatbag[195] },
        { button: 4, macro: keycodeToRatbag[196] },
        { button: 5, special: 'profile-cycle-up' },
        { button: 6, special: 'profile-cycle-up' },
        { button: 7, special: 'profile-cycle-up' },
      ]
    }
  ]
}