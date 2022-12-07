const path = require('path')
const { launch, arraySum } = require('../../utilities')
const dot = require('dot-object')

const dirPrefix = 'zeiguhzegiuhzefiuzehufzeiuf'

launch({
  inputsDir: path.resolve(__dirname, 'inputs'),
  format(fileContent) {
    const lines = fileContent.split('\n')
    const directory = {

    }
    let pwd = ''
    let pwdAsDot = ''
    lines.forEach((line, i) => {
      if (line.startsWith('$ cd')) {
        let goTo = line.split('$ cd ')[1].trim()
        if (goTo === '/') goTo = 'root'
        pwd = path.join(pwd, goTo)
        pwdAsDot = pwd.replaceAll('/', '.')
        return
      }
      if (line.startsWith('$ ls')) {
        let j = i + 1
        while (lines[j] && !lines[j].startsWith('$')) {
          let name = lines[j].split(' ').slice(1).join('').trim()
          const size = +lines[j].split(' ')[0].trim()
          const isDir = Number.isNaN(size)
          name = isDir
            ? `${dirPrefix}${name}`
            : `${name}`
          dot.str(`${pwdAsDot}.${name}`, size, directory)
          j++
        }
      }
    })
    return directory
  },
  tutos: [{
    shouldBe: 95437,
    exec: (content) => guess(content)
  }, {
    shouldBe: 24933642,
    exec: (content) => guess2(content)
  }],
  parts: [
    (content) => guess(content),
    (content) => guess2(content),
  ]
}).catch(err => { console.error(err); process.exit(1) })

/** Helpers part */
const getAllDirs = (root) => Object.keys(dot.dot(root)).filter(path => path.includes(dirPrefix)).map(path => path.replaceAll(dirPrefix, ''))
const getAllFiles = (root) => Object.keys(dot.dot(root)).filter(path => !path.includes(dirPrefix)).map(path => path.replaceAll(dirPrefix, ''))
function getTotalSize(root) {
  return arraySum(
    getAllFiles(root)
      .map(path => dot.pick(path, root))
  )
}

/** Guess part */
function guess({ root }) {
  const res = getAllDirs(root)
    .map(dir => getTotalSize(dot.pick(dir, root)))
    .filter(dirSize => dirSize < 100000)
  return arraySum(res)
}

function guess2({ root }) {
  const total = 70000000
  const update = 30000000
  let used = 0
  used = getTotalSize(root)
  const shouldBeDeleted = used - (total - update)
  const dir = getAllDirs(root)
    .map(dir => ({ dir, size: getTotalSize(dot.pick(dir, root)) }))
    .filter(({ size }) => size > shouldBeDeleted)
    .sort((a, b) => a.size - b.size)
  [0]
  return dir.size
}
