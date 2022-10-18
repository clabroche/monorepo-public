const dayjs = require('dayjs')
const precomputeFrom = getUnixDate(dayjs().subtract(10, 'years'))
const precomputeTo = getUnixDate(dayjs().add(10, 'years'))
const oneDayInMs = 24 * 60 * 60 * 1000
let precomputedDate = []
module.exports = {
  getAllDatesBetween(from, to) {
    if (!precomputedDate?.length) precomputeDates()
    const indexStart = precomputedDate.indexOf(getUnixDate(from))
    const indexStop = precomputedDate.indexOf(getUnixDate(to))
    return precomputedDate.slice(indexStart + 1, indexStop + 1)
  },
  getDaysArray,
  guessIntervals,
  indexOfDate(date) {
    if (!precomputedDate?.length) precomputeDates()
    return precomputedDate.indexOf(getUnixDate(date))
  },
}
function precomputeDates() {
  precomputedDate = getDaysArray(precomputeFrom, precomputeTo)
  const intervals = guessIntervals(precomputedDate)
  if(intervals.length > 1) {
    throw new Error('PrecomputedDates is breaked')
  }
}
function getDaysArray (start, end) {
  start = new Date(start).getTime() - oneDayInMs
  end = new Date(end).getTime() - oneDayInMs
  for (var arr = [], dt = start; dt < end; arr.push(dt += oneDayInMs));
  return arr;
}

function getISOString(date) {
  return new Date(dayjs(date).toISOString().substring(0, 10)).toISOString()
}

function getUnixDate(date) {
  return new Date(dayjs(date).toISOString().substring(0, 10)).getTime()
}

function guessIntervals(unixDates) {
  let aggr = { from: null, to: null }
  const result = []
  const oneDayInMs = 24 * 60 * 60 * 1000
  const unixDatesSorted = unixDates.sort((a, b) => a - b)
  unixDatesSorted.reduce((acc, date, i, arr) => {
    const previous = arr[i - 1]
    if (!previous) {
      aggr.from = date
      return acc
    }
    if (date - previous > oneDayInMs) {
      aggr.to = previous
      result.push(aggr)
      aggr = { from: date, to: null }
      return acc
    }
    return acc
  }, [])

  aggr.to = unixDatesSorted.pop()
  result.push(aggr)
  return result
}