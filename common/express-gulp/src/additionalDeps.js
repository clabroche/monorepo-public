const pathfs = require('path')
const rootDir = pathfs.resolve(__dirname, '..', '..', '..')
const libs = []
const fs = require('fs')
const { execSync } = require('child_process')
const getPkgJSON = (file) => {
  const pkgJSONPath = pathfs.resolve(file, 'package.json')
  let pkg
  if (fs.existsSync(pkgJSONPath)) {
    pkg = require(pkgJSONPath)
  } 
  return {
    file: () => pkg,
    name: () => pkg?.name,
    version: () => pkg?.version,
    allDependencies: () => Object.keys(Object.assign({}, pkg?.dependencies, pkg?.devDependencies)),
    correlateDependencies() {
      const libsName = libs.map(dep => dep.name)
      const correlate = []
      this.allDependencies()
        .filter(depName => libsName.includes(depName))
        .map(depName => {
          const lib = libs.find(a => a.name === depName)
          correlate.push(lib)
          correlate.push(...getPkgJSON(lib.path).correlateDependencies())
        })
      return correlate.reduce((_correlate, _pkg) => {
        if (!_correlate.includes(_pkg)) {
          _correlate.push(_pkg)
        }
        return _correlate
      }, [])
    },
  }
}

execSync('yarn workspaces list --json', { encoding: 'utf-8' })
  .trim().split('\n')
  .map(package => JSON.parse(package))
  .forEach(package => {
    const file = pathfs.resolve(rootDir, package.location)
    libs.push({ name: package.name, path: file })
  })

module.exports = {
  getAdditionalDeps: (dir) => getPkgJSON(dir).correlateDependencies(),
  getPkgJSON
}