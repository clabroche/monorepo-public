const { execSync } = require('child_process')

module.exports.suspend = async function () {
  execSync('systemctl suspend')
}