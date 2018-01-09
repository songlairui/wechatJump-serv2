const cv = require('opencv4nodejs')
const path = require('path')
const fs = require('fs')
function grayExt(grayMat) {
  // let colorMat0 = cv.imread('./green1.jpg')
  let buf = grayMat.getData()
  let line0 = 10
  // 第10行前10个元素灰度值
  let bg =
    buf
      .slice(line0 * grayMat.cols, line0 * grayMat.cols + 10)
      .reduce((a, b) => a + b, 0) / 10
  let maxDelta = bg > 128 ? bg : 256 - bg
  for (let i = 0; i < grayMat.rows; i++) {
    for (let j = 0; j < grayMat.cols; j++) {
      let idx = grayMat.cols * i + j
      let target = 0
      if (buf[idx] < 242) {
        let delta = buf[idx] - bg
        if (Math.abs(delta) < 13) delta = 0
        target =
          bg - Math.round(maxDelta * Math.pow(Math.abs(delta) / maxDelta, 0.4))
      }
      // console.log([r, g, b, t, delta])
      grayMat.set(i, j, target)
    }
  }
  return grayMat
  // // return grayMat
  // cv.imshow('result', grayMat)
  // cv.imshow('bin', binary)
  // // cv.imshow('result1', colorMat0)

  // cv.waitKey(00)
  // grayMat.gaussianBlur(new cv.Size(5, 5), 0)
}

module.exports = grayExt
