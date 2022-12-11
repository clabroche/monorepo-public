const path = require('path')
const { launch, arraySum, isBetween } = require('../../utilities')
const { readFileSync } = require('fs-extra')

const allCommands = {
  addx: {
    cycle: 2,
    exec(value, instruction) {
      return value + instruction
    }
  },
  noop: {
    cycle: 1,
    exec(value) {
      return value
    }
  }
}
const debug = process.env.debug

launch({
  inputsDir: path.resolve(__dirname, 'inputs'),
  format(fileContent) {
    return fileContent.split('\n').map(line => {
      const [commandName, instruction] = line.split(' ')
      return { commandName, instruction: +instruction }
    })
  },
  tutos: [
    {
      shouldBe: 13140,
      exec: (content) => guess(content)
    },
    {
      input: readFileSync(path.resolve(__dirname, 'inputs', 'tuto'), 'utf-8'),
      shouldBe: '##..##..##..##..##..##..##..##..##..##..###...###...###...###...###...###...###.####....####....####....####....####....#####.....#####.....#####.....#####.....######......######......######......###########.......#######.......#######.............................................',
      exec: (content) => guess2(content)
    }
  ],
  parts: [
    (content) => guess(content),
    (content) => guess2(content),
  ]
}).catch(err => { console.error(err); process.exit(1) })

/**
 * Get commands as inputs and get cycles as output with the current value of each cycle
 */
function commandsToCycles(commands) {
  let cycles = [{ commandName: 'initial', value: 1, }]
  commands.forEach(({ commandName, instruction }) => {
    const command = allCommands[commandName]
    const { cycle, exec } = command
    const lastValue = cycles[cycles.length - 1]
    cycles.push(...Array(cycle - 1).fill('').map(_ => ({ commandName, instruction, value: lastValue.value }))) // Not change values until the good cycle
    const value = exec(lastValue.value, instruction) // exec the command
    cycles.push({ commandName, instruction, value: value }) // change the value
  });
  cycles.forEach((a, i) => { // Enrich cycle number
    a.cycle = i + 1 // count begin at 1 not 0
    return a
  })
  return cycles
}

async function guess(commands) {
  const cycles = commandsToCycles(commands)
  const scores = cycles
    .filter((a) => ((a.cycle + 20) % 40) === 0) // Extract 20th and each 40 after
    .map((a) => a.cycle * a.value) // Extract the score
  return arraySum(scores)
}

async function guess2(commands) {
  const cycles = commandsToCycles(commands)
  let CRT = 0
  let lines = []
  cycles.forEach(({ cycle, value: registerX }) => {
    CRT = ((cycle - 1) % 40)
    if (!CRT) lines.push(Array(40).fill('.'))
    const lastLine = lines[lines.length - 1]
    if (isBetween(CRT, registerX - 1, registerX + 1)) lastLine[CRT] = '#'
  })
  if(debug) display(lines)
  return lines.flat().join('')
}


const display = (map) => map.forEach(line => console.log(line.join('')))