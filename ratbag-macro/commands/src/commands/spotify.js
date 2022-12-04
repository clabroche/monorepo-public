const { execSync, exec } = require('child_process')


async function isSpotifyLaunched() {
  return new Promise(resolve => {
    exec(
      `dbus-send --print-reply --dest=org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 org.freedesktop.DBus.Properties.Get string:'org.mpris.MediaPlayer2.Player' string:'PlaybackStatus'`,
      { timeout: 100 }
      , err => {
        if (err) return resolve(false)
        return resolve(true)
      }
    )
  });
}
async function launchOrDisplaySpotify() {
  if (!(await isSpotifyLaunched())) {
    exec('spotify', { killSignal: "SIGKILL" })
  } else {
    execSync(`wmctrl -x -r "spotify.Spotify" -N Spotify-controlled`)
    const res = execSync(`wmctrl -l | grep Spotify-controlled`, { encoding: 'utf-8' })
    const id = res.split(' ')[0].trim()
    if (id) {
      const isreduced = execSync(`xprop -id ${id} WM_STATE | grep state`).includes('Iconic')
      if (isreduced) {
        console.log(id)
        execSync(`xdotool windowraise ${id}`)
        execSync(`xdotool windowactivate ${id}`)
      } else {
        execSync(`xdotool windowminimize ${id}`)
      }
    }
  }
}

module.exports.launchOrDisplaySpotify = launchOrDisplaySpotify