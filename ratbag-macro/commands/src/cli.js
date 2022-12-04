
const args = process.argv.splice(2)
if (args) 

module.exports = {
  forceUpload: args.includes('--upload')
}