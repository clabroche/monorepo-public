const path = require('path')
const {arraySum, launch} = require('../../utilities')

launch({
  inputsDir: path.resolve(__dirname, 'inputs'),
  format(fileContent) {
    let elfs = []
    let elf = 0
    fileContent.split('\n').forEach((line) => {
      if (line === "") return elf++
      if (!elfs[elf]) elfs[elf] = {elf: elf, calories: [], total: 0}
      elfs[elf].total += +(line.trim())
      elfs[elf].calories.push(+line.trim())
    })
    return {
      elfs
    }
  },
  tutos: [{
    shouldBe: 24000,
    exec: (content) => maxCalories(content)
  }],
  parts: [
    (content) => maxCalories(content),
    (content) => getCaloriesFromTopElfs(content, 3),
  ]
}).catch(err => {console.error(err); process.exit(1)})

function maxCalories(turn) {
  return Math.max(...turn.elfs.map(e => e.total))
}


function getCaloriesFromTopElfs(turn, nbElfs) {
  const elfs = turn.elfs
    .sort((a, b) => b.total - a.total)
    .slice(0, nbElfs)
  return arraySum(elfs.map(e => e.total))
}