const path = require('path')
const { launch, arrayMultiply } = require('../../utilities')
const clc = require('cli-color');
const PromiseB = require('bluebird')

const up = (point) => point.y -= 1
const left = (point) => point.x -= 1
const right = (point) => point.x += 1
const down = (point) => point.y += 1
const leftdown = (point) => { left(point); down(point) }
const rightdown = (point) => { right(point); down(point) }
const leftup = (point) => { left(point); up(point) }
const rightup = (point) => { right(point); up(point) }
const allDirections = [
  up,
  left,
  right,
  down,
  leftdown,
  rightdown,
  leftup,
  rightup,
]
const directions = {
  'U': up,
  'L': left,
  'R': right,
  'D': down,
}
launch({
  inputsDir: path.resolve(__dirname, 'inputs'),
  format(fileContent) {
    return {
      steps: fileContent.split('\n').map(line => {
        const direction = line.split(' ')[0]
        const steps = +line.split(' ')[1]
        return Array(steps).fill('').map(() => ({ applyDirection: directions[direction] }))
      }).flat(),
    }
  },
  tutos: [
    {
      shouldBe: 13,
      exec: (content) => guess(content, 2, true)
    },
    {
    shouldBe: 1,
    exec: (content) => guess(content, 10, false)
  }, 
  {
      input: `R 5
U 8
L 8
D 3
R 17
D 10
L 25
U 20`,
      shouldBe: 36,
      exec: (content) => guess(content, 10, false)
  }],
  parts: [
    (content) => guess(content, 2),
    (content) => guess(content, 10, false),
  ]
}).catch(err => { console.error(err); process.exit(1) })

function isAdjacent(tail, head) {
  return Math.abs(tail.x - head.x) <= 1 && Math.abs(tail.y - head.y) <= 1
}
function isOnSameColumnOrLine(tail, head) {
  return Math.abs(tail.x) === Math.abs(head.x) || Math.abs(tail.y) === Math.abs(head.y)
}
/** Guess part 7147 toohigh*/
async function guess({ steps }, nbPointsInRope, shouldBeOnSameLine=true) {
  let points = Array(nbPointsInRope).fill('').map((_, i) => ({
    x: 0,
    y: 0,
    point: i.toFixed(),
    label: '.'
  }))
  const tailHasVisited = new Set()
  await PromiseB.mapSeries(steps, async ({ applyDirection }, step) => {
    if (applyDirection !== steps[step - 1]?.applyDirection) await display([...points], tailHasVisited, 30, 30, 100)
    applyDirection(points[0])
    await PromiseB.mapSeries(points, async (point, i) => {
      const head = point
      const tail = points[i + 1]
      if (!tail) return
      if (!isAdjacent(tail, head)) {
        let _isOnSameColumnOrLine = false
        let initialPosition = Object.assign({}, tail)
        let i = 0

        // Test positions around to search the position that is On Same Column Or Line
        do {
          allDirections[i](tail)
          _isOnSameColumnOrLine = isOnSameColumnOrLine(tail, head) && isAdjacent(tail, head)
          if (!_isOnSameColumnOrLine) {
            Object.assign(tail, initialPosition)
            i++
          }
        } while (!_isOnSameColumnOrLine && allDirections[i])
        // if position not found on same column or line get just the adjacent cell 
        if (!shouldBeOnSameLine && !allDirections[i]) {
          Object.assign(tail, initialPosition)
          i = 0
          do {
            if (!allDirections[i]) {
            }
            allDirections[i](tail)
            _isOnSameColumnOrLine = isAdjacent(tail, head)
            if (!_isOnSameColumnOrLine) Object.assign(tail, initialPosition)
            i++
          } while (!_isOnSameColumnOrLine)
        }
      }
    })
    let tail = points[points.length - 1]
    tailHasVisited.add(`${tail.x}~${tail.y}`)

  });

  await display([...points], tailHasVisited, 30, 30, 10)
  return tailHasVisited.size
}




async function display(points, tailHasVisited, width, height, ms = 30) {
  if(!process.env.debug) return
  const display = Array(width).fill('').map(() => Array(height).fill(' X'))
  tailHasVisited.forEach(point => {
    const [x, y] = point.split('~')
    display[+y + Math.floor(height / 2)][+x + Math.floor(width / 2)] = clc.green(` #`)
  });
  points.forEach(point => {
    display[point.y + Math.floor(height / 2)][point.x + Math.floor(width / 2)] = clc.red(` ${point.point || point.label}`)
  });
  console.log(display.map(line => line.join('')).join('\n'))
  console.log()
  await wait(ms)
}


const wait = (ms) => new Promise(res => setTimeout(res, ms))