const path = require('path')
const { launch, } = require('../../utilities')
const clc = require('cli-color')
const debug = process.env.debug

launch({
  inputsDir: path.resolve(__dirname, 'inputs'),
  format(fileContent) {
    let start = { x: -1, y: -1 }
    let end = { x: -1, y: -1 }
    let width = fileContent.split('\n')[0].split('').length
    let height = fileContent.split('\n').length
    const map = fileContent
      .split('\n')
      .map((line, y) =>
        line
          .split('')
          .map((letter, x) => {
            const cell = { elevation: letter.charCodeAt(0) - 96, x, y, cost: 0 }
            if (letter === 'S') {
              start = cell
              cell.elevation = 1
            }
            if (letter === 'E') {
              end = cell
              cell.elevation = 26
            }
            return cell
          })
      )
      .flat()
      .reduce((finalValue, cell) => {
        finalValue.set(`${cell.x}-${cell.y}`, cell)
        return finalValue
      }, new Map())
    map.forEach((cell) => {
      cell.neigbourghs = {
        top: map.get(`${cell.x}-${cell.y + 1}`),
        bottom: map.get(`${cell.x}-${cell.y - 1}`),
        left: map.get(`${cell.x - 1}-${cell.y}`),
        right: map.get(`${cell.x + 1}-${cell.y}`),
      }
      cell.neigbourghsSortByElevation = Object.keys(cell.neigbourghs)
        .map(direction => cell.neigbourghs[direction])
        .filter(c => c)
        .sort((a,b) => b.elevation - a.elevation)
    })
    return {
      width, height,
      start, end,
      map, allFloor: [...map].filter(([i, cell]) => cell.elevation === 1).map(a => a[1])
    }
  },
  tutos: [
    {
      shouldBe: 31,
      exec: (content) => guess(content)
    }, 
    {
      input: 'aaSabcdefghijklmnopqrstuvwxyzEaaaaa',
      shouldBe: 27,
      exec: (content) => guess(content)
    },
    {
      shouldBe: 29,
      exec: (content) => guess2(content)
    },
  ],
  parts: [
    (content) => guess(content),
    (content) => guess2(content),
  ]
}).catch(err => { console.error(err); process.exit(1) })


const search = (start, end) => {
  const queue = [[start, []]]
  const seen = new Set([start])
  let res = Number.POSITIVE_INFINITY

  while (queue.length) {
    const [currentCell, ancestors] = queue.shift() || []
    if (currentCell === end) {
      return ancestors
    }
    currentCell.neigbourghsSortByElevation
      .filter((neigh) => neigh.elevation - currentCell.elevation <= 1)
      .filter(neigh => !seen.has(neigh))
      .forEach(neigh => {
        seen.add(neigh)
        queue.push([neigh, [...ancestors, neigh]])
      })
  }
  return res
}
async function guess({ start, end, map, width, height }) {
  const path = search(start, end)
  if (debug) display(map, width, height, path, true)
  return path.length
}
async function guess2({ end, allFloor }) {
  const allPaths = allFloor.map(start => search(start, end).length).filter(a => a)
  return Math.min(...allPaths)
}

function display(map, width, height, cellsToFlag, force = false) {
  const display = Array(height).fill('').map(() => Array(width).fill(''))
  map.forEach(({x, y ,elevation}) => {
    const colors = [ 'green', 'greenBright', 'yellow', 'yellowBright', 'magenta', 'magentaBright', 'red', 'redBright']
    const i = Math.floor(elevation / 4)
    let color = colors[i]
    const char = String.fromCharCode(96 + elevation)
    display[y][x] = `${clc[color](char)}`
    cellsToFlag.forEach((cell) => {
      if (cell?.x === x && cell?.y === y) display[y][x] = clc.bgCyanBright(char)
    });
  })
  console.log('\n' +display.map(line => line.join('')).join('\n'))
}