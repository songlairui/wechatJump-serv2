const cv = require('opencv4nodejs')
const path = require('path')
const fs = require('fs')
const findTopXY = require('./findTopXY')
const grayExt = require('./grayExt')
const grayExt2 = require('./grayExt2')

let ballMat = cv.imread(path.resolve(__dirname, 'ball.jpg'), 0)

function dealMat(filename) {
  let colorMat = cv.imread('./' + filename + '.jpg')

  let { maxLoc: ballPoint } = colorMat
    .bgrToGray()
    .matchTemplate(ballMat, 3)
    .minMaxLoc()
  let bg = colorMat.atRaw(ballPoint.y, 5)

  colorMat.drawRectangle(
    new cv.Point(ballPoint.x - 8, ballPoint.y - 8),
    new cv.Point(ballPoint.x + ballMat.cols + 8, ballPoint.y + 80),
    new cv.Vec(bg[0], bg[1], bg[2]),
    cv.LINE_8,
    -1
  )

  // 方式1
  // let gaussic1 = grayMat.gaussianBlur(new cv.Size(7, 7), 0)
  // gaussic1.drawRectangle(
  //   new cv.Point(0, 0),
  //   new cv.Point(gaussic1.cols, gaussic1.rows),
  //   new cv.Vec(255, 255, 255),
  //   cv.LINE_8,
  //   8
  // )
  // let bin1 = gaussic1.threshold(0, 255, cv.THRESH_OTSU)

  // 操作 grayMat
  let grayMat = grayExt2(colorMat)

  // cv.imshow('grayMat', grayMat)
  // cv.waitKey(1000)
  let seed = new cv.Point(100, 0 + 5)
  var blackMat = new cv.Mat(grayMat.rows + 2, grayMat.cols + 2, cv.CV_8UC1, 0)

  // let rect = grayMat.floodFill(seed, 0, whiteMat, 4, 4, 8)
  // cv.imshow('rect', grayMat)

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
  let point2 = findTopXY(bin2)

  // console.log(point1, point2)
  // let point = point1.y < point2.y ? point1 : point2
  let point = point2

  colorMat.drawRectangle(
    new cv.Point(point.x - 5, point.y - 5),
    new cv.Point(point.x + 5, point.y + 5),
    new cv.Vec(0, 0, 0)
  )

  grayMat.drawRectangle(
    new cv.Point(point.x - 5, point.y - 5),
    new cv.Point(point.x + 5, point.y + 5),
    new cv.Vec(0, 0, 0)
  )
  console.log(point)
  return { gaussic, bin2, grayMat, colorMat }
  // return { bin1, bin2, grayMat }
  // cv.imshow('grayMat', grayMat)
  // cv.waitKey(0)
}

// , matG, matR, gray
;['pill_', 'whiteC_', 'white11_', 'green2_'].forEach((filename, i) => {
  let { gaussic, bin2, grayMat, colorMat } = dealMat(filename)
  cv.imshow('grayMat ' + i, grayMat)
  cv.imshow('colorMat ' + i, colorMat)
  cv.imshow('gaussic ' + i, gaussic)
  cv.imshow('bin2 ' + i, bin2)
})

cv.waitKey(0)
