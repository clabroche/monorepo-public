const path = require('path')
const { launch, arrayMultiply } = require('../../utilities')
const clc = require('cli-color');

launch({
  inputsDir: path.resolve(__dirname, 'inputs'),
  format(fileContent) {
    let width = fileContent.split('\n')[0].split('').length
    let height = fileContent.split('\n').length
    // Build map
    const map = fileContent.split('\n').map((line, y) => line.split('').map((a, x) => ({ val: +a, x, y }))).flat(3).reduce((finalValue, cell) => {
      finalValue.set(`${cell.x}-${cell.y}`, cell)
      return finalValue
    }, new Map())
    // Add on each cell info like neigbourghs or important computation for future guess
    map.forEach((value, key) => {
      const neighbourghs = {
        top: Array(value.y).fill('').map((_, i) => map.get(`${value.x}-${i}`)?.val).reverse(),
        bottom: Array(height - value.y - 1).fill('').map((_, i) => map.get(`${value.x}-${value.y + i + 1}`)?.val),
        left: Array(value.x).fill('').map((_, i) => map.get(`${i}-${value.y}`)?.val).reverse(),
        right: Array(height - value.x - 1).fill('').map((_, i) => map.get(`${value.x + i + 1}-${value.y}`)?.val),
      }
      const isVisibleFrom = {
        top: neighbourghs.top.every(n => n < value.val),
        bottom: neighbourghs.bottom.every(n => n < value.val),
        left: neighbourghs.left.every(n => n < value.val),
        right: neighbourghs.right.every(n => n < value.val),
      }
      const blockedAt = {
        top: neighbourghs.top.findIndex(c => c >= value.val) + 1 || neighbourghs.top.length,
        bottom: neighbourghs.bottom.findIndex(c => c >= value.val) + 1 || neighbourghs.bottom.length,
        left: neighbourghs.left.findIndex(c => c >= value.val) + 1 || neighbourghs.left.length,
        right: neighbourghs.right.findIndex(c => c >= value.val) + 1 || neighbourghs.right.length,
      }
      map.set(key, {
        ...value,
        neighbourghs,
        blockedAt,
        scenicScore: arrayMultiply([blockedAt.top, blockedAt.bottom, blockedAt.left, blockedAt.right]),
        isVisible: isVisibleFrom?.top
          || isVisibleFrom?.bottom
          || isVisibleFrom?.left
          || isVisibleFrom?.right
      })
    })
    return {
      width,
      height,
      map
    }
  },
  tutos: [{
    shouldBe: 21,
    exec: (content) => guess(content)
  }, {
    shouldBe: 8,
    exec: (content) => guess2(content)
  }],
  parts: [
    (content) => guess(content),
    (content) => guess2(content),
  ]
}).catch(err => { console.error(err); process.exit(1) })

/** Guess part */
function guess({ map, width, height }) {
  const nbVisibleTrees = [...map]
    .filter(([key, cell]) => cell.isVisible)
    .length
  // display(map, width, height)
  return nbVisibleTrees
}
function guess2({ map, width, height }) {
  const scenicScores = [...map]
    .map(([key, cell]) => cell.scenicScore)
  // console.log(map.get(`2-3`))
  return Math.max(...scenicScores)
}

function display(map, width, height) {
  const display = Array(height).fill('').map(() => Array(width).fill(''))
  map.forEach(({ x, y, val, isVisible }) => {
    display[y][x] = isVisible ? clc.green(val.toString()) : clc.red(val.toString())
  })
  console.log(display.map(line => line.join('')).join('\n'))
}