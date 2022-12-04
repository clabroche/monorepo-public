const {execSync} = require('child_process')
const conf = require('./conf')

module.exports = {
  // Reset media keys
  reset: () => {
    execSync('gsettings list-recursively org.gnome.settings-daemon.plugins.media-keys', { encoding: 'utf-8' })
      .split('\n')
      .map(resetKey => {
        const split = resetKey.split(' ')
        split[2] = split.splice(2, 100).join(' ')
        return split
      })
      .filter(r => r.length === 3 && r[2].includes('XF86'))
      .forEach(resetKey => execSync(`gsettings set org.gnome.settings-daemon.plugins.media-keys ${resetKey[1]} "['']"`, { encoding: 'utf-8' }))
    conf.gsettings.forEach(([gsettingKey, xf86Key]) => {
      execSync(`gsettings set org.gnome.settings-daemon.plugins.media-keys ${gsettingKey} "['${xf86Key}']"`, { encoding: 'utf-8' })
    })

  }
}