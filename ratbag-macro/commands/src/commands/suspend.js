const { execSync } = require('child_process')

module.exports.suspend = async function () {
  const job = Number.parseInt(execSync('systemctl list-jobs | grep suspend.target' , {encoding: 'utf-8'}).trim())
  if (!Number.isNaN(job)) execSync(`systemctl cancel ${job}`)
  execSync('systemctl suspend')
}