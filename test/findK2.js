var { data: array } = require('./test.json')

var ori = array.slice(0)

var index = 0
let arrR = [],
  arrG = [],
  arrB = []
while (index < array.length) {
  index += 1
  arrR.push(array[index])
  index += 1
  arrG.push(array[index])
  index += 1
  arrB.push(array[index])
}

let bg = findHead5(arrR)

let result1 = arrR.map(item => item - bg)

log(result1)

let param1 = Math.round(
  Math.sqrt(result1.reduce((a, b) => a + b * b, 0) / arrR.length)
)
let classes = []
let tmpLinkArr = new Array(result1.length).fill(0)
for (let i = 0; i < result1.length; i++) {
  if (Math.abs(result1[i]) > param1) {
    // try to classify this value

    if (tmpLinkArr[i - 1] && typeof tmpLinkArr[i - 1] === 'object') {
      // 如果上一个元素被分发过，则将当前元素分发到上一个组中
      tmpLinkArr[i] = tmpLinkArr[i - 1]
    } else {
      tmpLinkArr[i] = []
      classes.push(tmpLinkArr[i])
    }
    tmpLinkArr[i].push({ i, v: result1[i] })
  }
}
let largestClass =
  classes[
    classes.map(class1 => class1.length).reduce((result, v, i) => {
      if (result.v) {
        if (v > result.v) {
          result = { v, i }
        }
        return result
      } else {
        return {
          v,
          i
        }
      }
    }, {})['i']
  ]
console.log(largestClass)
let left = Math.round(
  (largestClass[0].i + largestClass[largestClass.length - 1].i) / 2
)
console.log({ left })
//////////////

function findHead5(arr) {
  if (arr.length < 5) throw new Exception('little array')
  return Math.round(arr.slice(0, 5).reduce((a, b) => a + b, 0) / 5)
}

function log(title = '', arr = []) {
  if (Array.isArray(title) && arr === undefined) {
    arr = title
    title = 'array'
  }
  console.log(title + ':\n', arr.slice(0, 30).join(','), '...')
}
