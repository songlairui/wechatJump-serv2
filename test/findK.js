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
;[arrR, arrG, arrB].forEach((arr, i) => {
  console.log(i + '\n')
  log(arr)
})
var dArrays = [arrR, arrG, arrB].map(deltaArray)

dArrays.forEach((arr, i) => {
  console.log(i + '\n')
  log(arr)
})

ddArrays = dArrays.map(deltaArray)

ddArrays.forEach((arr, i) => {
  console.log(i + '\n')
  log(arr)
})

function log(title = '', arr = []) {
  if (Array.isArray(title) && arr === undefined) {
    arr = title
    title = 'array'
  }
  console.log(title + ':\n', arr.slice(0, 30).join(','), '...')
}

function deltaArray(array) {
  return array.map((v, i, a) => {
    if (a[i - 1] === undefined) return
    return v - a[i - 1]
  })
}
