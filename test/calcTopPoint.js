const cv = require('opencv4nodejs')

let a = cv.imread('./forth.jpg', 0)

// let array = a.getDataAsArray()
// console.log('array lines:', array.length)
// console.log('array width:', array[0].length)
let buffer = a.getData()
let per = Math.round(buffer.length / 360 / 300)
console.log('buffer length:', buffer.length)
console.log('data per pixel:', per)

let { rows: height, cols: width } = a

function thresold(num, thresold = 15) {
  return Math.abs(num) > thresold ? num : 0
}

function findHead5(arr) {
  if (arr.length < 5) throw new Exception('little array')
  return Math.round(arr.slice(0, 5).reduce((a, b) => a + b, 0) / 5)
}

let targletLine = undefined
// 计算差异值，每一行都计算
// 约定差异计算方法，每个颜色通道都计算，然后相加，相当于三遍方差
// 方差计算，不计算总体平均值，只使用第一个值
// TODO 使用前10个像素平均值，当前10个像素基本一致时

// 每行，每个值都取
// TODO， 隔x行，x列加速取值
for (let i = 0; i < height; i += 3) {
  let start = i * width * per
  let end = start + width * per
  let line = buffer.slice(start, end)
  let sumRGB = [0] // [sumR, sumG, sumB]

  // [avgR, avgG, avgB]
  let avgRGB = [0].map(_ => {
    let sum = 0
    for (let l = 0; l < 10; l++) {
      sum += line[l * per + _]
    }
    return Math.round(sum / 10)
  })
  for (let j = 0; j < width; j += 3) {
    ;[0].forEach(_ => {
      sumRGB[_] += Math.pow(thresold(line[j * per + _] - avgRGB[_]), 2)
    })
    // sumR += Math.pow(thresold(line[j * 3] - line[0]), 2)
    // sumG += Math.pow(thresold(line[j * 3 + 1] - line[0 + 1]), 2)
    // sumB += Math.pow(thresold(line[j * 3 + 2] - line[0 + 2]), 2)
  }
  let lineVariance = Math.round(sumRGB.reduce((a, b) => a + b, 0) / width / per)
  // console.log(i, lineVariance)
  if (lineVariance > 40) {
    targletLine = i
    break
  }
}

// 找到对应像素点

let line = buffer.slice(
  width * per * (targletLine - 1),
  width * per * targletLine
)

console.info({ y: targletLine })

let bg = findHead5(line)

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
let left = Math.round(
  (largestClass[0].i + largestClass[largestClass.length - 1].i) / 2
)
console.log({ x: left })

let seed = new cv.Point(left, targletLine + 5)
var whiteMat = new cv.Mat(a.rows + 2, a.cols + 2, cv.CV_8UC1, 0)

let gaussic = a.gaussianBlur(new cv.Size(3, 3), 0)
let rect = gaussic.floodFill(seed, 0, whiteMat, 3, 3, 4)

console.log(rect.rect)

// let region = a.getRegion(rect.rect)

cv.imshow('region', gaussic)
cv.waitKey(1000)

let centerPoint = {
  x: rect.rect.x + Math.round(rect.rect.width / 2),
  y: rect.rect.y + Math.round(rect.rect.height / 2)
}

console.log(centerPoint)
