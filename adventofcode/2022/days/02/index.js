const path = require('path')
const {launch, reverseObject} = require('../../utilities')

const winRules = {
  'ROCK': 'SCISSORS',
  'PAPPER': 'ROCK',
  'SCISSORS': 'PAPPER',
}
const defeatRules = reverseObject(winRules)

const scoreForElements = {
  'ROCK': 1,
  'PAPPER': 2,
  'SCISSORS': 3,
}

launch({
  inputsDir: path.resolve(__dirname, 'inputs'),
  format(fileContent) {
    const translate = {
      'A': 'ROCK',
      'B': 'PAPPER',
      'C': 'SCISSORS',

      // Only for Part1
      'X': 'ROCK',
      'Y': 'PAPPER',
      'Z': 'SCISSORS',
    }
    return {
      turns: fileContent.split('\n').map(turn => ({
        opponent: translate[turn.split(' ')[0]],
        me: translate[turn.split(' ')[1]],
        end: ends[turn.split(' ')[1]] 
      }))
    }
  },
  tutos: [{
    shouldBe: 15,
    exec: (content) => part1(content)
  }, {
    shouldBe: 12,
    exec: (content) => part2(content)
  }],
  parts: [
    (content) => part1(content),
    (content) => part2(content),
  ]
}).catch(err => {console.error(err); process.exit(1)})

function part1(game) {
  const total = game.turns.reduce((total, { opponent, me }) => {
    let score = 0
    if (opponent === me) score = 3
    if (winRules[opponent] === me) score = 0
    if (winRules[me] === opponent) score = 6
    return total + score + scoreForElements[me]
  }, 0)
  return total
}


const ends = { // Only for part2
  'X': 'LOSE',
  'Y': 'DRAW',
  'Z': 'WIN',
}
function part2(game) {
  const total = game.turns.reduce((total, { opponent, end }) => {
    let score = 0
    let me
    if (end === 'LOSE') {
      score = 0
      me = winRules[opponent]
    }
    if (end === 'DRAW') {
      score = 3
      me = opponent
    }
    if (end === 'WIN') {
      score = 6
      me = defeatRules[opponent]
    }
    return total + score + scoreForElements[me]
  }, 0)
  return total
}
