const path = require('path')
const { launch, arraySum, arrayMultiply, } = require('../../utilities')
const clc = require('cli-color')
const debug = process.env.debug

launch({
  inputsDir: path.resolve(__dirname, 'inputs'),
  format(fileContent) {
    return {
      pairs: fileContent
        .split('\n\n')
        .map(pair => pair.split('\n'))
        .map(([pair1, pair2], i) => ({ pair1:JSON.parse(pair1), pair2: JSON.parse(pair2), index: i + 1 }))
    }
  },
  tutos: [
    { shouldBe: 13, exec: (content) => guess(content) },
    { shouldBe: 0, exec: (content) => guess(content), input: '[]\n[]' },
    { shouldBe: 1, exec: (content) => guess(content), input: '[]\n[0]' },
    { shouldBe: 0, exec: (content) => guess(content), input: '[0]\n[0]' },
    { shouldBe: 0, exec: (content) => guess(content), input: '[0]\n[]' },
    { shouldBe: 0, exec: (content) => guess(content), input: '[[0]]\n[]' },
    { shouldBe: 0, exec: (content) => guess(content), input: '[[0]]\n[[0]]' },
    { shouldBe: 0, exec: (content) => guess(content), input: '[[0, 0]]\n[[0, [0]]]' },
    { shouldBe: 0, exec: (content) => guess(content), input: '[0, 0]\n[0, [0]]' },
    { shouldBe: 0, exec: (content) => guess(content), input: '[0, [0, 0]]\n[0, 0]' },
    { shouldBe: 1, exec: (content) => guess(content), input: '[0, [0, 0]]\n[0, 1]' },
    { shouldBe: 0, exec: (content) => guess(content), input: '[0, [0], 1]\n[0, 0, 1]' },
    { shouldBe: 0, exec: (content) => guess(content), input: '[0, [0], 1]\n[0, 0, 1]' },
    { shouldBe: 1, exec: (content) => guess(content), input: '[0, [0], 1]\n[0, [0,0,0], 0]' },
    { shouldBe: 1, exec: (content) => guess(content), input: '[0, [0], 0]\n[0, [0,0,0], 1]' }, 
    { shouldBe: 140, exec: (content) => guess2(content) },
  ],
  parts: [
    (content) => guess(content),
    (content) => guess2(content),
  ]
}).catch(err => { console.error(err); process.exit(1) })

const isNumber = (number) => typeof number === 'number' 
function checkPair(pair1, pair2, indent = 0) {
  if(debug) console.log(`${Array(indent).fill('').join('  ')} - Compare ${JSON.stringify(pair1)} vs ${JSON.stringify(pair2)}`)
  if (isNumber(pair1) && isNumber(pair2)) {
    if(pair1 === pair2) return
    return pair1 <= pair2
  }
  if (Array.isArray(pair1) && Array.isArray(pair2)) {
    for (let j = 0; j < pair2.length; j++) {
      const subPair1 = pair1[j];
      const subPair2 = pair2[j];
      if(subPair1 == undefined) return true
      const _isGood = checkPair(subPair1, subPair2, indent + 1)
      if (_isGood !== undefined) return _isGood
    }
    if (pair1.length > pair2.length) return false
    return undefined
  }
  if (Array.isArray(pair1) && isNumber(pair2)) {
    pair2 = [pair2]
    return checkPair(pair1, pair2, indent + 1)
  }
  if (Array.isArray(pair2) && isNumber(pair1)) {
    pair1 = [pair1]
    return checkPair(pair1, pair2, indent + 1)
  }
}

async function guess({ pairs }) {
  const goods = pairs.filter(({ pair1, pair2, index }) => {
    if(debug)console.log(`== Pair ${index} ==`)
    return checkPair(pair1, pair2)
  })
  return arraySum(goods.map(g => g.index))
}
async function guess2({ pairs }) {
  const allpairs = [
    ...pairs.map(({ pair1, pair2 }) => ([pair1, pair2])).flat(),
    [[2]],
    [[6]]
  ]
  allpairs.sort((a,b)=> checkPair(a,b) ? -1 : 1)
  const allpairsStringified = allpairs.map(pair => JSON.stringify(pair))
  const dividedPacketIndexes = [
    allpairsStringified.findIndex((a) => a === '[[2]]') + 1,
    allpairsStringified.findIndex((a) => a === '[[6]]') + 1,
  ]
  if(debug) console.log(allpairsStringified)
  if(debug) console.log(dividedPacketIndexes)
  return arrayMultiply(dividedPacketIndexes)
}