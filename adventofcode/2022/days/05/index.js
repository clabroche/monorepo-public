const path = require('path')
const {launch} = require('../../utilities')

launch({
  inputsDir: path.resolve(__dirname, 'inputs'),
  format(fileContent) {
    const [stackPart, movesPart] = fileContent.split('\n\n')
    const stacksLines = stackPart.split('\n').slice(0, -1)
    const columnConf = stackPart.split('\n').slice(-1).pop()
    // Search on each string columns are the containers
    const columns = columnConf?.split('').reduce((columns, letter, i) => {
      // @ts-ignore
      if(letter.trim()) columns.push(i)
      return columns
    }, [])
    // Arrange stacks by column instead of lines
    const stacks = []
    stacksLines.forEach((stacksLine) => {
      columns?.map((column, x )=> {
        if (!stacks[x]) stacks[x] = []
        if (stacksLine[column]?.trim()) {
          stacks[x].push(stacksLine[column])
        }
      })
    })
    // Parse moves instructions
    const moves = movesPart.split('\n').map(line => line.split(' ').filter(a => !Number.isNaN(+a)))
      .map(line => ({numberToMove: +line[0], from: +line[1] - 1, to: +line[2] - 1}))
    return {
      moves,
      stacks
    }
  },
  tutos: [{
    shouldBe: 'CMZ',
    exec: (content) => guess(content, true)
  },{
    shouldBe: 'MCD',
    exec: (content) => guess(content, false)
  }],
  parts: [
    (content) => guess(content, true),
    (content) => guess(content, false),
  ]
}).catch(err => {console.error(err); process.exit(1)})


function guess({ moves, stacks }, shouldReverse) {
  moves.forEach(({ numberToMove, from, to }) => {
    let toMove = stacks[from].splice(0, numberToMove)
    if(shouldReverse) toMove = toMove.reverse()
    stacks[to].unshift(...toMove)
  });
  return stacks.map(stack => stack[0]).join('')
}
