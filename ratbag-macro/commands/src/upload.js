const { execSync } = require('child_process');
const { writeFileSync, readFileSync, existsSync } = require('fs');
const { profiles } = require('./conf');
const cli = require('./cli')


function getBaseProfileCommand(profile) {
  return `ratbagctl "Logitech G915 WIRELESS RGB MECHANICAL GAMING KEYBOARD" profile ${profile}`
}
function getBaseKeysCommand(profile, button) {
  return `${getBaseProfileCommand(profile)} button ${button}`
}
function getBaseLedCommand(profile, led) {
  return `${getBaseProfileCommand(profile)} led ${led}`
}

function getMacroCommand(profile, button, macro) {
  return `${getBaseKeysCommand(profile, button)} action set macro ${macro}`
}
function getSpecialCommand(profile, button, special) {
  return `${getBaseKeysCommand(profile, button)} action set special ${special}`
}
function getLedCommand(profile, button, key, value) {
  return `${getBaseLedCommand(profile, button)} set ${key} ${value}`
}

module.exports = function uploadIfNeeded() {
  if (!existsSync('./backup.json')) writeFileSync('./backup.json', '{}', 'utf-8')
  const backup = readFileSync('./backup.json', 'utf-8')
  if (cli.forceUpload || backup !== JSON.stringify(profiles)) {
    console.log(' ==> Upload profiles')
    profiles.forEach((profile, profileNumber) => {
      console.log(' ====> Profile')
      console.log(' ======> Keys')
      profile.buttons.forEach(({ button, macro, special }) => {
        if (macro) {
          execSync(getMacroCommand(profileNumber, button, macro))
        }
        if (special) {
          execSync(getSpecialCommand(profileNumber, button, special))
        }
      })
      console.log(' ======> LED')
      profile.led.forEach(({ led, mode, color, duration, brightness }) => {
        if (mode === 'breathing') {
          execSync(getLedCommand(profileNumber, led, 'mode', "breathing"))
          execSync(getLedCommand(profileNumber, led, 'color', color))
          execSync(getLedCommand(profileNumber, led, 'duration', duration))
          execSync(getLedCommand(profileNumber, led, 'brightness', brightness))
        }
        if (mode === 'on') {
          execSync(getLedCommand(profileNumber, led, 'mode', 'on'))
          execSync(getLedCommand(profileNumber, led, 'color', color))
        }
        if (mode === 'off') {
          execSync(getLedCommand(profileNumber, led, 'mode', 'off'))
        }
        if (mode === 'cycle') {
          execSync(getLedCommand(profileNumber, led, 'mode', "cycle"))
          execSync(getLedCommand(profileNumber, led, 'duration', duration))
          execSync(getLedCommand(profileNumber, led, 'brightness', brightness))
        }
      })
    })
    writeFileSync('./backup.json', JSON.stringify(profiles), 'utf-8')
    console.log('OK !')
  } else {
    console.log('Keyboard is up to date')
  }
}