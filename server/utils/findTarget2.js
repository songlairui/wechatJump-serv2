const cv = require('opencv4nodejs')
const path = require('path')
const fs = require('fs')
const findTopXY = require('./findTopXY')
const grayExt2 = require('./grayExt2')

let ballMat = cv.imread(path.resolve(__dirname, '..', 'ball.jpg'), 0)

module.exports = dealMat

function dealMat(colorMat) {
  let { maxLoc: ballPoint } = colorMat
    .bgrToGray()
    .matchTemplate(ballMat, 3)
    .minMaxLoc()
  let bg = colorMat.atRaw(10, 10)
  // 讲小人去掉
  colorMat.drawRectangle(
    new cv.Point(ballPoint.x - 10, 0),
    new cv.Point(ballPoint.x + ballMat.cols + 10, ballPoint.y + 80),
    new cv.Vec(bg[0], bg[1], bg[2]),
    cv.LINE_8,
    -1
  )

  // 操作 grayMat
  let grayMat = grayExt2(colorMat)

  // cv.imshow('grayMat', grayMat)
  // cv.waitKey(1000)
  let seed = new cv.Point(100, 0 + 10)
  var blackMat = new cv.Mat(grayMat.rows + 2, grayMat.cols + 2, cv.CV_8UC1, 0)

  let gaussic = grayMat.gaussianBlur(new cv.Size(7, 7), 0)
  let rect = gaussic.floodFill(seed, 0, blackMat, 3, 3, 4)
  gaussic.drawRectangle(
    new cv.Point(0, 0),
    new cv.Point(gaussic.cols, gaussic.rows),
    new cv.Vec(0, 0, 0),
    cv.LINE_8,
    8
  )
  let bin2 = gaussic.threshold(40, 255, cv.THRESH_BINARY_INV)

  // cv.imshow('bin2', bin2)
  // cv.waitKey(1000)

  // let point1 = findTopXY(bin1)
  let targetPoint = findTopXY(bin2)

  return {
    ballPoint: {
      x: ballPoint.x + 10,
      y: ballPoint.y + 67
    },
    targetPoint
  }
}
