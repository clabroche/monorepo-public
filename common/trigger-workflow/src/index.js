const { execSync } = require('child_process')
const { readdirSync } = require('fs')
const https = require('https')
const version = execSync("git describe --exact-match --tags $(git log -n1 --pretty=' % h')").toString().trim().slice(1)
const { EVENT_TYPE, NODE_AUTH_TOKEN, REPO } = process.env
if (!EVENT_TYPE) {
  console.error('EVENT_TYPE env variable is required')
  process.exit(1)
}
if (!NODE_AUTH_TOKEN) {
  console.error('NODE_AUTH_TOKEN env variable is required. It\'s a PAT token from github')
  process.exit(1)
}
if (!REPO) {
  console.error('REPO env variable is required. Ex: <org or user>/<repo>')
  process.exit(1)
}

const path = execSync(`yarn workspace @clabroche-org/${EVENT_TYPE} exec pwd`)
const files = readdirSync(path.toString().trim())

if (files.includes('Dockerfile')) {
  console.log('Found a Dockerfile, we contact github to trigger the build...')
  const data = new TextEncoder().encode(
    JSON.stringify({
      "ref": "v" + version,
      "inputs": {
        "package_version": version,
      }
    })
  )

  const options = {
    hostname: 'api.github.com',
    port: 443,
    path: `/repos/${REPO}/actions/workflows/${EVENT_TYPE}-docker.yml/dispatches`,
    method: 'POST',
    headers: {
      'User-Agent': "mybank",
      'Accept': 'application/vnd.github.everest-preview+json',
      'Authorization': `token ${NODE_AUTH_TOKEN}`
    }
  }

  const req = https.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)

    res.on('data', d => {
      process.stdout.write(d)
    })
  })

  req.on('error', error => {
    console.error(error)
  })

  req.write(data)
  req.end()
}
if (files.includes('capacitor.config.json')) {
  console.log('Found a Capacitor project, we contact github to trigger the build...')
  const data = new TextEncoder().encode(
    JSON.stringify({
      "ref": "v" + version,
      "inputs": {
        "package_version": version,
      }
    })
  )

  const options = {
    hostname: 'api.github.com',
    port: 443,
    path: `/repos/${REPO}/actions/workflows/${EVENT_TYPE}-mobile.yml/dispatches`,
    method: 'POST',
    headers: {
      'User-Agent': "mybank",
      'Accept': 'application/vnd.github.everest-preview+json',
      'Authorization': `token ${NODE_AUTH_TOKEN}`
    }
  }

  const req = https.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)

    res.on('data', d => {
      process.stdout.write(d)
    })
  })

  req.on('error', error => {
    console.error(error)
  })

  req.write(data)
  req.end()
}
