const cv = require('opencv4nodejs')
const path = require('path')

module.exports = function findTopXY(binMat) {
  // 高斯模糊之后，定点可能被去掉。
  let targletLine = getTopLine(binMat) + 2
  let per = 1

  // 找到对应像素点

  let { rows: height, cols: width } = binMat
  let line = binMat
    .getData()
    .slice(width * per * (targletLine - 1), width * per * targletLine)

  // console.info({ y: targletLine })

  let bg = 255

  let deltaBg = line.map(item => item - bg)
  let std = Math.round(
    Math.sqrt(deltaBg.reduce((a, b) => a + b * b, 0) / deltaBg.length)
  )
  let classes = []
  let tmpLinkArr = new Array(deltaBg.length).fill(0)
  for (let i = 0; i < deltaBg.length; i++) {
    if (Math.abs(deltaBg[i]) > std) {
      // try to classify this value
      if (tmpLinkArr[i - 1] && typeof tmpLinkArr[i - 1] === 'object') {
        // 如果上一个元素被分发过，则将当前元素分发到上一个组中
        tmpLinkArr[i] = tmpLinkArr[i - 1]
      } else {
        tmpLinkArr[i] = []
        classes.push(tmpLinkArr[i])
      }
      tmpLinkArr[i].push({ i, v: deltaBg[i] })
    }
  }
  // console.log({ std, classes })
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
  // console.log(largestClass)
  let left = +Infinity
  if (largestClass) {
    left = Math.round(
      (largestClass[0].i + largestClass[largestClass.length - 1].i) / 2
    )
  }
  // console.log({ x: left })

  let centerPoint = {
    y: targletLine,
    x: left
  }

  // console.log(centerPoint, rect)
  return centerPoint
}

function getTopLine(mat) {
  let buffer = mat.getData()
  let per = 1
  let { rows: height, cols: width } = mat

  let targletLine = +Infinity

  for (let i = 0; i < height; i += 3) {
    let start = i * width * per
    let end = start + width * per
    let line = buffer.slice(start, end)
    let sumRGB = [0] // [sumR, sumG, sumB]

    // [avgR, avgG, avgB]
    let avgRGB = [255]
    for (let j = 0; j < width; j += 3) {
      ;[0].forEach(_ => {
        sumRGB[_] += Math.pow(thresold(line[j * per + _] - avgRGB[_]), 2)
      })
    }
    let lineVariance = Math.round(
      sumRGB.reduce((a, b) => a + b, 0) / width / per
    )
    // console.log(i, lineVariance)
    if (lineVariance > 100) {
      targletLine = i
      break
    }
  }
  return targletLine
}

function thresold(num, thresold = 15) {
  return Math.abs(num) > thresold ? num : 0
}

function findHead5(arr) {
  if (arr.length < 5) throw new Exception('little array')
  return Math.round(arr.slice(0, 5).reduce((a, b) => a + b, 0) / 5)
}
