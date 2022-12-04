const { execSync } = require('child_process')

module.exports.alttab = () => execSync("xdotool keydown Alt && sleep 0.01 && xdotool key Tab && sleep 0.2 && xdotool  keyup Alt")