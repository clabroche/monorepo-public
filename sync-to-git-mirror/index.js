const fse = require('fs-extra')
const pathfs = require('path')
const {execSync} = require('child_process')
const {getWorkspaces} = require('./searchForWorkspaces')
const { readdirSync, existsSync } = require('fs')
const Octokit = require('@octokit/core').Octokit

const patToken = process.env.patToken
if(!patToken) throw new Error('Pass a "patToken" env')

;(async () => {
  const octokit = new Octokit({
    auth: patToken
  })
  const { data: {login}} = await octokit.request('GET /user')

  const getPublicRepo = () => octokit.request(`GET /repos/${login}/monorepo-public`, {
    owner: 'OWNER',
    repo: 'REPO'
  }).catch(err => {
    if (err?.status === 404) return { data: null }
    throw new Error(err)
  })
  let {data: public} = await getPublicRepo() 
  if(!public) {
    await octokit.request('POST /user/repos', {
      name: 'monorepo-public',
      description: `READ-ONLY mirror of the private ${login}/monorepo with only public packages`,
      'private': false,
      is_template: false
    })
    let { data: _public } = await getPublicRepo() 
    public = _public
  }
  
  const workspaces = getWorkspaces(pathfs.resolve(__dirname, '..'))
  const publicWorkspaces = workspaces.filter(({ path, packageJSON: {name}}) => {
    const dir = readdirSync(path)
    return dir.includes('.mirror')
  });
  const rootDir = pathfs.resolve(__dirname, '..')
  const filter = publicWorkspaces.map(w => w.path.replace(rootDir + '/', ''))
  const additionalPathsToKeep = [
    'README.md',
    '.gitignore',
    'LICENSE.md'
  ]
  const cliFilter = [...filter, ...additionalPathsToKeep].map(path => `--path "${path}"`).join(' ')
  const pulledPath = pathfs.resolve(__dirname, 'pulled')
  const subRepo = `https://${patToken}@github.com/${login}/monorepo-public`
  if(existsSync(pulledPath)) fse.removeSync(pulledPath)
  execSync(`git clone --no-local ${rootDir} ${pulledPath}`)
  execSync(`git filter-repo ${cliFilter} --quiet`, { cwd: pulledPath })
  execSync(`git push ${subRepo} --follow-tags --force --quiet`, { cwd: pulledPath })
})()




