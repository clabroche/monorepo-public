const gulp = require('@clabroche-org/common-express-gulp')
const pathfs = require('path')
module.exports.default = gulp.generateGulpfile({
  entryPoint: pathfs.resolve(__dirname, 'src', 'server.js'),
  baseUrl: __dirname
})
