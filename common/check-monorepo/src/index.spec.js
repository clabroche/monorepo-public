const { describe, it, expect } = require('@jest/globals')
const { checkIfAllWorkspacesAreLinkedToYarn, checkIfAllWorkspacesAreLinkedToLerna, getWorkspaces } = require('./searchForWorkspaces')
const pathfs = require('path')
const fse = require('fs')


describe('Workspaces binding', () => {
  it('All workspaces should be bind to Yarn', () => {
    checkIfAllWorkspacesAreLinkedToYarn()
  })
  it('All workspaces should be bind to Lerna', () => {
    checkIfAllWorkspacesAreLinkedToLerna()
  })
})

describe('Workspaces naming', () => {
  it('All packages should have correct names', () => {
    const rootDir = pathfs.resolve(__dirname, '../../..')
    getWorkspaces().map(workspace => {
      const expectedName = workspace.path
        .replace(rootDir + '/', '')
        .split('/')
        .join('-')
      const rootName = require(pathfs.resolve(rootDir, 'package.json')).name
      const prefix = rootName.split('/').length === 2 // If is a scoped package
        ? rootName.split('/')[0]
        : null
      if (prefix) {
        expect(workspace.packageJSON.name).toBe(prefix + '/' + expectedName)
      } else {
        expect(workspace.packageJSON.name).toBe(expectedName)
      }
    })
  })
})

describe('Dependencies', () => {
  describe('All packages should inherit from the retrigger-all-build package', () => {
    const workspaces = getWorkspaces()
    const retriggerAllPackage = workspaces.find(w => w.packageJSON.name.includes('retrigger-all-build'))
    workspaces
      .filter(workspace => workspace.packageJSON.name !== retriggerAllPackage.packageJSON.name)
      .map(workspace => {
        it(`${workspace.packageJSON.name} should have a devDependencies section`, () => {
          expect(workspace.packageJSON.devDependencies).not.toBeFalsy()
        })
        it(`${workspace.packageJSON.name} should inherit from the retrigger-all-build package`, () => {
          expect(workspace.packageJSON.devDependencies).toMatchObject({
            [retriggerAllPackage.packageJSON.name]: 'workspace:*'
          })
        })
      })
  })
})

describe('Files', () => {
  describe('All packages should have a npmrc to the root of package', () => {
    getWorkspaces().forEach(workspace => {
      it(workspace.packageJSON.name + ' should have a npmrc to the root of package', () => {
        const hasNpmRC = fse.existsSync(pathfs.resolve(workspace.path, '.npmrc'))
        expect(hasNpmRC).toBe(true)
      })
    })
  })
  describe('All packages should not have a packagelock to the root of package', () => {
    getWorkspaces().forEach(workspace => {
      it(workspace.packageJSON.name + ' should have a npmrc to the root of package', () => {
        const hasPackageLock = fse.existsSync(pathfs.resolve(workspace.path, 'package-lock.json'))
        expect(hasPackageLock).toBe(false)
      })
    })
  })
})