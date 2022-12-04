const path = require('path')
const {launch, isBetween} = require('../../utilities')

launch({
  inputsDir: path.resolve(__dirname, 'inputs'),
  format(fileContent) {
    const groups = fileContent.split('\n').map((line, i) => ({
      group: i,
      sections: line.split(',').map(sections => ({
        begin: +sections.split('-')[0],
        end: +sections.split('-')[1], 
      }))
    }))
    return {groups}
  },
  tutos: [{
    shouldBe: 2,
    exec: (content) => part1(content)
  }, {
    shouldBe: 4,
    exec: (content) => part2(content)
  }],
  parts: [
    (content) => part1(content),
    (content) => part2(content),
  ]
}).catch(err => {console.error(err); process.exit(1)})

function isSectionOverlapping(section1, section2) {
  return isBetween(section1.begin, section2.begin, section2.end)
    || isBetween(section1.end, section2.begin, section2.end)
    || isBetween(section2.begin, section1.begin, section1.end)
    || isBetween(section2.end, section1.begin, section1.end)
}

function isSectionFullyOverlapping(section1, section2) {
  return (
    isBetween(section1.begin, section2.begin, section2.end)
    && isBetween(section1.end, section2.begin, section2.end)
  ) || (
    isBetween(section2.begin, section1.begin, section1.end)
    && isBetween(section2.end, section1.begin, section1.end)
  )
    || (section2.begin >= section1.begin && section2.end <= section1.end)
}


function part1({ groups }) {
  const overlaps = groups.filter(({ sections: [section1, section2] }) => {
    return isSectionFullyOverlapping(section1, section2)
  });
  return overlaps.length
}

function part2({ groups }) {
  const overlaps = groups.filter(({ sections: [section1, section2] }) => {
    return isSectionOverlapping(section1, section2)
  });
  return overlaps.length
}
