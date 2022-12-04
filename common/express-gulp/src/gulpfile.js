const { series, watch, parallel, } = require('gulp')
const spawn = require('child_process').spawn
const pathfs = require('path')
const killport = require('kill-port')
const { getAdditionalDeps, getPkgJSON } = require('./additionalDeps')
let node

module.exports = {
  generateGulpfile: ({
    entryPoint = './src/server.js',
    baseUrl = __dirname,
    port = process.env.PORT
  }) => {
    require('dotenv').config({ path: pathfs.resolve(baseUrl, '.env') })
    function server(done) {
      if (node) {
        node.kill()
        if (port) {
          killport(port)
        }
      }
      node = spawn('node', [entryPoint], { stdio: 'inherit' })
      done()
    }

    function varEnv(done) {
      done()
    }
    function watchFiles() {
      const additionnalDeps = getAdditionalDeps(baseUrl)
      const glob = [
        `${baseUrl}/**/*.js`,
        `!${baseUrl}/node_modules/**/*.js`,
        ...additionnalDeps.map(a => a.path + '/**/*.js'),
        ...additionnalDeps.map(a => '!' + a.path + '/node_modules/**/*.js'),
        '!**/*/coverage/**/*',
        '!coverage/**/*',
      ]
      const pkgJSON = getPkgJSON(baseUrl)
      console.log(`Watch ${pkgJSON.name()} => v${pkgJSON.version()}`)
      console.log(`Watch ${additionnalDeps.length} additionnal deps`)
      console.log(additionnalDeps.map(a => '   - ' + a.name).join('\n'))
      watch(glob, server)
    }
    const reload = parallel(watchFiles, server)
    return series(varEnv, reload)
  }
}