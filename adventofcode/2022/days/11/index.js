const path = require('path')
const { launch, arrayMultiply, } = require('../../utilities')

const debug = process.env.debug

launch({
  inputsDir: path.resolve(__dirname, 'inputs'),
  format(fileContent) {
    return fileContent.split('\n\n').map(monkeyInstructions => {
      const monkey = { inspectTimes: 0 }
      const lines = monkeyInstructions.split('\n')
      lines.forEach((line, i) => {
        line = line.trim()
        if (line.startsWith('Starting items: ')) {
          monkey.items = line.split('Starting items: ')[1].trim().split(', ').map(a => +a.trim())
        }
        if (line.startsWith('Operation: ')) {
          monkey.inspect = (old, damageRatio = 0) => {
            let [val1, operator, val2] = line.split('Operation: ')[1].trim().split('=')[1].trim().split(' ')
            if (val1 === 'old') val1 = old
            else val1 = +val1
            if (val2 === 'old') val2 = old
            else val2 = +val2
            let newValue
            if (operator === '+') newValue = val1 + val2
            if (operator === '*') newValue = val1 * val2
            if (operator === '-') newValue = val1 - val2
            if (operator === '/') newValue = val1 / val2
            return Math.floor(newValue / (damageRatio || 1))
          }
        }
        if (line.startsWith('Test: ')) {
          const operation = line.split('Test: ')[1].trim()
          const divisibleBy = +operation.split('divisible by ')[1].trim()
          monkey.divisibleBy = divisibleBy
          monkey.getMonkeyToThrow = (val) => {
            let result = val % divisibleBy === 0
            if (result) return +lines[i + 1].trim().split('If true: throw to monkey ')[1]
            return +lines[i + 2].trim().split('If false: throw to monkey ')[1]
          }
        }
      })
      return monkey
    })
  },
  tutos: [
    {
      shouldBe: 10605,
      exec: (content) => guess(content, 20, 3)
    },
    {
      shouldBe: 10605,
      exec: (content) => guess(content, 20, 3)
    }
    , {
      shouldBe: 24,
      exec: (content) => guess(content, 1, 0)
    },
    {
      shouldBe: 10197,
      exec: (content) => guess(content, 20, 0)
    },
    {
      shouldBe: 2713310158,
      exec: (content) => guess(content, 10000, 0)
    },
  ],
  parts: [
    (content) => guess(content, 20, 3),
    (content) => guess(content, 10000, 0),
  ]
}).catch(err => { console.error(err); process.exit(1) })

function makeRound(monkeys, damageRatio, divider) {
  monkeys.forEach((monkey, monkeyNumber) => {
    const items = monkey.items
    monkey.items = []
    monkey.inspectTimes += items.length
    items.forEach((item) => {
      let worry = monkey.inspect(item, damageRatio)
      worry = worry % divider
      const throwTo = monkey.getMonkeyToThrow(worry)
      monkeys[throwTo].items.push(worry)
    });
  });
}

async function guess(monkeys, roundNumbers, damageRatio) {
  const divider = monkeys.map(m => m.divisibleBy).reduce((a, b) => a * b, 1)
  for (let i = 0; i < roundNumbers; i++) {
    makeRound(monkeys, damageRatio, divider)
  }
  display(monkeys)
  return arrayMultiply(
    monkeys
      .sort((a, b) => b.inspectTimes - a.inspectTimes)
      .slice(0, 2)
      .map(a => a.inspectTimes)
  )
}


function display(monkeys) {
  monkeys.forEach(monkey => {
    console.log('times: ', monkey.inspectTimes, 'items: ', monkey.items.join(', '))
  });
}