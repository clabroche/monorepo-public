const { execSync } = require('child_process')

module.exports.expandWindow = async function () {
  const expandMore = ['Chromium','Chrome']
  const className = execSync(`xdotool getactivewindow getwindowclassname`, { encoding: 'utf-8' }).trim()
  console.log(`Resize: ${className}`)
  execSync(`xdotool getactivewindow windowstate --remove MODAL`)
  execSync(`xdotool getactivewindow windowstate --remove STICKY`)
  execSync(`xdotool getactivewindow windowstate --remove MAXIMIZED_VERT`)
  execSync(`xdotool getactivewindow windowstate --remove MAXIMIZED_HORZ`)
  execSync(`xdotool getactivewindow windowstate --remove SHADED`)
  execSync(`xdotool getactivewindow windowstate --remove SKIP_TASKBAR`),
  execSync(`xdotool getactivewindow windowstate --remove SKIP_PAGER`)
  execSync(`xdotool getactivewindow windowstate --remove HIDDEN`)
  execSync(`xdotool getactivewindow windowstate --remove FULLSCREEN`)
  execSync(`xdotool getactivewindow windowstate --remove ABOVE`)
  execSync(`xdotool getactivewindow windowstate --remove BELOW`)
  execSync(`xdotool getactivewindow windowstate --remove DEMANDS_ATTENTION`)
  execSync(`xdotool getactivewindow windowstate --remove FULLSCREEN`)
  if (expandMore.includes(className)) {
    execSync(`xdotool getactivewindow windowsize --sync 5200 1520`)
    execSync(`xdotool getactivewindow windowmove --sync -- "-40" "-40"`)
  } else {
    execSync(`xdotool getactivewindow windowsize --sync 5120 1440`)
    execSync(`xdotool getactivewindow windowmove --sync 0 0`)
  }
  // const geometryLine = execSync(`xwininfo -id $(xdotool getactivewindow) | grep 'geometry'`, {encoding: 'utf-8'}).trim()
  // const geometry = geometryLine.split('-geometry').pop().trim()
  // const [width, height]
  // console.log(geometry)
  // execSync('wmctrl -e "0,0,0,5120,1440" -r :ACTIVE:')
}