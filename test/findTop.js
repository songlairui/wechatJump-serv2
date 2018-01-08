const cv = require('opencv4nodejs')
const path = require('path')

module.exports = function findTop(regionMat) {
  let grayMat = regionMat.bgrToGray()
  let targletLine = chooseTopLine(grayMat)
  let per = 1

  // 找到对应像素点

  let { rows: height, cols: width } = grayMat
  let line = grayMat
    .getData()
    .slice(width * per * (targletLine - 1), width * per * targletLine)

  // console.info({ y: targletLine })

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
  // console.log({ x: left })

  let seed = new cv.Point(left, targletLine + 5)
  var whiteMat = new cv.Mat(grayMat.rows + 2, grayMat.cols + 2, cv.CV_8UC1, 0)

  let gaussic = grayMat.gaussianBlur(new cv.Size(3, 3), 0)
  let rect = gaussic.floodFill(seed, 0, whiteMat, 3, 3, 4)

  // console.log(rect.rect)

  let targetRect = gaussic.getRegion(rect.rect)

  // cv.imshow('region', gaussic)
  // cv.waitKey(1000)

  let centerPoint = {
    x: rect.rect.x + Math.round(rect.rect.width / 2),
    y: rect.rect.y + Math.round(rect.rect.height / 2)
  }

  // console.log(centerPoint, rect)
  return centerPoint
}

function chooseTopLine(grayMat) {
  let bg =
    grayMat
      .getData()
      .slice(18000, 18010)
      .reduce((a, b) => a + b, 0) / 10
  // console.log({ bg })
  let padding = 6
  let cropRect = new cv.Rect(
    padding,
    padding,
    grayMat.cols - padding * 2,
    grayMat.rows - padding * 2
  )
  let gaussic = grayMat.gaussianBlur(new cv.Size(3, 3), 0)
  let binary_inv = gaussic
    .threshold(Math.round(bg * 1.05), 255, cv.THRESH_BINARY_INV)
    .getRegion(cropRect)
  let binary_pos = gaussic.threshold(0, 255, cv.THRESH_OTSU).getRegion(cropRect)
  // cv.imshow('bin1', binary_inv)
  // cv.imshow('bino', binary_pos)
  // cv.waitKey(500)
  // 在有值的里面，取最高的点，即最小值
  let targletLine = Math.min.apply(
    null,
    [binary_inv, binary_pos]
      .map(mat => getTopLine(mat) + padding)
      .filter(_ => _)
  )
  return targletLine
}

function getTopLine(mat) {
  let buffer = mat.getData()
  let per = 1
  let { rows: height, cols: width } = mat

  let targletLine = undefined

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
    }
    let lineVariance = Math.round(
      sumRGB.reduce((a, b) => a + b, 0) / width / per
    )
    // console.log(i, lineVariance)
    if (lineVariance > 300) {
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
