const path = require('path')
const {launch, arraySum} = require('../../utilities')

launch({
  inputsDir: path.resolve(__dirname, 'inputs'),
  format(fileContent) {
    let elfs = []
    let elf = 0
    fileContent.split('\n').forEach((line, i) => {
      if (i%3 === 0 && elfs.length) elf++
      if (!elfs[elf]) elfs[elf] = { elf: elf, ruckstacks: [], total: 0 }
      elfs[elf].ruckstacks.push(line.trim())
    })
    return {
      elfs,
      ruckstacks: fileContent.split('\n').map(ruckstack => {
        return {
          compartment1: ruckstack.slice(0, ruckstack.length / 2),
          compartment2: ruckstack.slice(ruckstack.length / 2),
        }
      })
    }
    
  },
  tutos: [{
    shouldBe: 157,
    exec: (content) => part1(content)
  },{
    shouldBe: 70,
    exec: (content) => part2(content)
  } ],
  parts: [
    (content) => part1(content),
    (content) => part2(content),
  ]
}).catch(err => {console.error(err); process.exit(1)})

function getScoreFromLetter(letter) {
  const alphabetPlace = letter.toLowerCase().charCodeAt(0) - 96
  return letter == letter.toUpperCase() ? alphabetPlace + 26 : alphabetPlace
}

function part1({ ruckstacks }) {
  const allScore = ruckstacks.map(({ compartment1, compartment2 }) => {
    const common = compartment1.split('').filter(letter => compartment2.includes(letter)).pop()
    return getScoreFromLetter(common)
  })
  return arraySum(allScore)
}


function part2({ elfs }) {
  const allScore = elfs.map(({ruckstacks}) => {
    const ruckstack1 = ruckstacks[0]
    const ruckstack2 = ruckstacks[1]
    const ruckstack3 = ruckstacks[2]
    const common = ruckstack1.split('').filter(letter => ruckstack2.includes(letter) && ruckstack3.includes(letter)).pop()
    return getScoreFromLetter(common)
  })
  return arraySum(allScore)
}

