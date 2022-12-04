
const additionalDeps = require('./additionalDeps')
const pathfs = require('path')
describe('Gulp > additionalDeps', () => {
  it('getAdditionalDeps', async () => {
    const additionalDepsRes = await additionalDeps.getAdditionalDeps(pathfs.resolve(__dirname, '..', '..', 'express-logger'))
    expect(additionalDepsRes).toHaveLength(1)
    expect(additionalDepsRes[0].name).toEqual('@clabroche/common-express-http-error')
    expect(additionalDepsRes[0].name).toEqual('@clabroche/common-express-http-error')
  })
  it('getPkgJSON', async () => {
    const additionalDepsRes = await additionalDeps.getPkgJSON(pathfs.resolve(__dirname, '..', '..', 'express-logger'))
    expect(additionalDepsRes.name()).toEqual('@clabroche/common-express-logger')
    expect(additionalDepsRes.file().name).toEqual(additionalDepsRes.name())
    expect(additionalDepsRes.file().version).toEqual(additionalDepsRes.version())
  })
})