const fse = require('fs-extra')
const path = require('path')
const PromiseB = require('bluebird')
module.exports.reverseObject = (obj) => {
  return Object.keys(obj).reduce((rule, win) => {
    const defeat = obj[win]
    rule[defeat] = win
    return rule
  }, {})
}

module.exports.parse = (file, format) => {
  const input = fse.readFileSync(file, 'utf-8')
  return format(input)
}

/**
 * @param {Opts} param0 
 */
module.exports.launch = async ({
  inputsDir = __dirname,
  tutos = [],
  format = (a) => a,
  parts = []
} = {
  inputsDir: __dirname,
  tutos: [],
  format: (a) => a,
  parts: []
}) => {
  console.log()
  console.log('Day n°' + path.basename(path.dirname(inputsDir)))
  await PromiseB.mapSeries(tutos, async (tuto, i) => {
    const file = tuto.path || 'tuto'
    const parsed = module.exports.parse(path.resolve(inputsDir, file), format)
    const res = await tuto.exec(parsed)
    if(res !== tuto.shouldBe) {
      throw new Error(`Tuto n°${i}: Should be "${tuto.shouldBe}" but "${res}" found`)
    }
    console.log('Tuto n°' +i +':  Ok')
  })
  await PromiseB.mapSeries(parts, async (part, i) => {
    const parsed = module.exports.parse(path.resolve(inputsDir, 'part' + (i +1)), format)
    const res = await part(parsed)
    console.log('Result n°' + i + ': ', res)
  })
}

module.exports.arraySum = (entries) => {
  return entries.reduce((a, b) => a + b, 0)
}
/**
 * @typedef Opts
 * @property {string} inputsDir
 * @property {{exec: (content: any) => string | number, shouldBe: any, path?:string}[]} tutos
 * @property {(fileContent: string) => any} format
 * @property {((content: any) => string | number)[]} parts
 */