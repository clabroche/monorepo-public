const path = require('path')
const { launch } = require('../../utilities')

launch({
  inputsDir: path.resolve(__dirname, 'inputs'),
  format(fileContent) {
    return fileContent.split('')
  },
  tutos: [{
    input: 'mjqjpqmgbljsphdztnvjfqwrcgsmlb',
    shouldBe: 7,
    exec: (content) => guess(content, 4)
  }, {
    input: 'bvwbjplbgvbhsrlpgdmjqwftvncz',
    shouldBe: 5,
    exec: (content) => guess(content, 4)
  }, {
    input: 'nppdvjthqldpwncqszvftbrmjlhg',
    shouldBe: 6,
    exec: (content) => guess(content, 4)
  }, {
    input: 'nznrnfrfntjfmvfwmzdfjlvtqnbhcprsg',
    shouldBe: 10,
    exec: (content) => guess(content, 4)
  }, {
    input: 'zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw',
    shouldBe: 11,
    exec: (content) => guess(content, 4)
  }, {
    input: 'mjqjpqmgbljsphdztnvjfqwrcgsmlb',
    shouldBe: 19,
    exec: (content) => guess(content, 14)
  }, {
    input: 'bvwbjplbgvbhsrlpgdmjqwftvncz',
    shouldBe: 23,
    exec: (content) => guess(content, 14)
  }, {
    input: 'nppdvjthqldpwncqszvftbrmjlhg',
    shouldBe: 23,
    exec: (content) => guess(content, 14)
  }, {
    input: 'nznrnfrfntjfmvfwmzdfjlvtqnbhcprsg',
    shouldBe: 29,
    exec: (content) => guess(content, 14)
  }, {
    input: 'zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw',
    shouldBe: 26,
    exec: (content) => guess(content, 14)
  }],
  parts: [
    (content) => guess(content, 4),
    (content) => guess(content, 14),
  ]
}).catch(err => { console.error(err); process.exit(1) })


function guess(signal, numberOfDifferentCharacters) {
  let positionOfStartSignal = 0
  for (let i = 0; i < signal.length; i++) {
    const fourthPacket = signal.slice(i, i + numberOfDifferentCharacters)
    const set = [...new Set(fourthPacket)]
    if (set.length === numberOfDifferentCharacters) {
      positionOfStartSignal = i + numberOfDifferentCharacters
      break
    }
  }
  return positionOfStartSignal
}
