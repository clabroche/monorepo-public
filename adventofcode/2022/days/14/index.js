const path = require('path')
const clc = require('cli-color')
const { launch, } = require('../../utilities')
const debug = process.env.debug

const range = (min, max) => {
  return Array(Math.abs(max - min) + 1).fill('').map((_, i)=> Math.min(min, max)+i)
}

launch({
  inputsDir: path.resolve(__dirname, 'inputs'),
  format(fileContent) {
    const allPoints = [{ x: 500, y: 0, label: '+'}]
    const paths = fileContent.split('\n').map(line => {
      return line.split(' -> ').map(point => point.split(',')).map(([_x, _y], i, points) => {
        const x = +_x
        const y = +_y
        const next = points[i+1]
        if(next) {
          const xRange = range(x, next[0])
          const yRange = range(y, next[1])
          if (xRange.length > 1) xRange.forEach(x => {
            const point = { x, y, label: '#' }
            allPoints.push(point)
          })
          else if (yRange.length > 1) yRange.forEach(y => {
            const point = { x, y, label: '#' }
            allPoints.push(point)
          })
        } 
        // return point
      })
    })
    const minY = Math.min(...allPoints.map(a => a.y))
    const maxY = Math.max(...allPoints.map(a => a.y)) + 2
    const height = maxY - minY
    const minX = Math.ceil(500 - (height))
    const maxX = Math.ceil(500 + (height))
    const width = maxX - minX
    const grid = new Map()
    // Build grid with air
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const cell = { x, y, label: '.' }
        grid.set(`${x}-${y}`, cell)
      }
    }
    // Enrich with neighbourghs
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const cell = grid.get(`${x}-${y}`)
        cell.neigbourghs = {
          top: grid.get(`${cell.x}-${cell.y - 1}`),
          topLeft: grid.get(`${cell.x - 1}-${cell.y - 1}`),
          topRight: grid.get(`${cell.x + 1}-${cell.y - 1}`),
          bottom: grid.get(`${cell.x}-${cell.y + 1}`),
          bottomLeft: grid.get(`${cell.x - 1}-${cell.y + 1}`),
          bottomRight: grid.get(`${cell.x + 1}-${cell.y + 1}`),
          left: grid.get(`${cell.x - 1}-${cell.y}`),
          right: grid.get(`${cell.x + 1}-${cell.y}`),
        }
      }
    }
    // Add all rocks
    allPoints.forEach((point) => {
      const cell = grid.get(`${point.x}-${point.y}`)
      cell.label = point.label
    })
    return {
      minX,
      minY,
      maxX,
      maxY,
      width,
      height,
      paths,
      grid,
      sandSources: [...grid].filter(([key, cell]) => cell.label === '+').map(([key, cell]) => cell)
    }
  },
  tutos: [
    { shouldBe: 24, exec: (content) => guess(content) },
    { shouldBe: 93, exec: (content) => guess2(content, true) },
  ],
  parts: [
    // (content) => guess(content),
    // (content) => guess2(content),
  ]
}).catch(err => { console.error(err); process.exit(1) })

function searchForStable(cell, hasFloor) {
  const bottom = cell?.neigbourghs?.bottom
  const bottomLeft = cell?.neigbourghs?.bottomLeft
  const bottomRight = cell?.neigbourghs?.bottomRight
  if(
    cell.y === 0 
    && bottom.label === 'o' 
    && bottomLeft.label === 'o'
    && bottomRight.label === 'o' 
  ) return null
  if(
    !bottom ||
    !bottomLeft ||
    !bottomRight
  ) return null
  if (bottom.label === '.') {
    return searchForStable(bottom)
  } else if (bottomLeft.label === '.') {
    return searchForStable(bottomLeft)
  } else if (bottomRight.label === '.') {
    return searchForStable(bottomRight)
  }
  return cell
}

function step({ grid, width, height, minX, minY, maxX, maxY, sandSources, hasFloor, stepNumber }) {
  const stableSources = sandSources.map(source => {
    let cell = Object.assign({}, source)
    const stableCell = searchForStable(cell, hasFloor)
    if(stableCell) stableCell.label = 'o'
    else return true
    return false
  });
  if (debug) display(grid, width, height, minX, minY, maxX, maxY, stepNumber)
  return {
    end: stableSources.every((isStable) => isStable),
    nbSand: [...grid].filter(([key, cell]) => cell.label === 'o').length
  }
}

function launchSandPile({ minX, minY, maxX, maxY, width, height, grid, sandSources }, hasFloor) {
  let stepNumber = 0
  let end = false
  let sand = 0
  while (!end) {
    const res = step({ minX, minY, maxX, maxY, width, height, grid, sandSources, hasFloor, stepNumber })
    end = res.end
    sand = res.nbSand
    stepNumber++
  }
  return sand
}

async function guess(input, hasFloor) {
  return launchSandPile(input, hasFloor)
}

async function guess2(input, hasFloor) {
  range(input.minX, input.maxX).forEach(x => {
    const cell = input.grid.get(`${x}-${input.maxY}`)
    cell.label = '~'
  })
  return launchSandPile(input, hasFloor) + 1
}



function display(map, width, height, minX, minY, maxX, maxY, step) {
  if(step % 100 != 0) return
  const display = Array(height+1).fill('').map(() => Array(width+1).fill(''))
  map.forEach(({ x, y, label }) => {
    display[y - minY][x - minX] = `${clc.white(label)}`
  })
  console.log('\n' + display.map(line => line.join('')).join('\n'))
  console.log()
}