const { execSync } = require('child_process')

let id = null
async function saveWindow() {
  const res = execSync(`xdotool getactivewindow`, { encoding: 'utf-8' })
  const newId = res.trim()
  if(id !== newId) id = newId
}
async function switchWindow() {
  const isreduced = execSync(`xprop -id ${id} WM_STATE | grep state`).includes('Iconic')
  if (isreduced) {
    execSync(`xdotool windowraise ${id}`)
    execSync(`xdotool windowactivate ${id}`)
  } else {
    execSync(`xdotool windowminimize ${id}`)
  }
}
module.exports.saveWindow = saveWindow
module.exports.switchWindow = switchWindow
