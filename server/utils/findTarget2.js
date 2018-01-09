const cv = require('opencv4nodejs')
const path = require('path')
const fs = require('fs')
const findTopXY = require('./findTopXY')
const grayExt = require('./grayExt')

let ballMat = cv.imread(path.resolve(__dirname, '..', 'ball.jpg'), 0)

module.exports = dealMat

function dealMat(colorMat) {
  let grayMat = colorMat.bgrToGray()
  let { maxLoc: ballPoint } = grayMat.matchTemplate(ballMat, 3).minMaxLoc()
  let bg = grayMat.getData()[0]
  // 讲小人去掉
  grayMat.drawRectangle(
    new cv.Point(ballPoint.x - 8, ballPoint.y - 8),
    new cv.Point(ballPoint.x + ballMat.cols + 8, ballPoint.y + 80),
    new cv.Vec(bg, bg, bg),
    cv.LINE_8,
    -1
  )

  // 操作 grayMat
  grayExt(grayMat)

  // cv.imshow('grayMat', grayMat)
  // cv.waitKey(1000)
  let seed = new cv.Point(100, 0 + 5)
  var blackMat = new cv.Mat(grayMat.rows + 2, grayMat.cols + 2, cv.CV_8UC1, 0)

  // let rect = grayMat.floodFill(seed, 0, whiteMat, 4, 4, 8)
  // cv.imshow('rect', grayMat)

  let gaussic = grayMat.gaussianBlur(new cv.Size(7, 7), 0)
  let rect = gaussic.floodFill(seed, 0, blackMat, 5, 5, 4)
  gaussic.drawRectangle(
    new cv.Point(0, 0),
    new cv.Point(gaussic.cols, gaussic.rows),
    new cv.Vec(0, 0, 0),
    cv.LINE_8,
    8
  )
  let bin2 = gaussic.threshold(255 - bg, 255, cv.THRESH_BINARY_INV)

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
