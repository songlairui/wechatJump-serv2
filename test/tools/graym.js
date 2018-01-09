const cv = require('opencv4nodejs')
const path = require('path')
const fs = require('fs')

module.exports = function graym() {
  let ballMat = cv.imread(path.resolve(__dirname, 'ball.jpg'), 0)
  let colorMat = cv.imread('./white7.jpg')
  // let colorMat0 = cv.imread('./green1.jpg')

  let buf = colorMat.getData()

  // 第10行前10个元素灰度值
  let bg = buf.slice(3600, 3630).reduce((a, b) => a + b, 0) / 30

  for (let i = 0; i < colorMat.rows; i++) {
    for (let j = 0; j < colorMat.cols; j++) {
      let idx = colorMat.cols * i + j
      let [r, g, b] = [0, 1, 2].map(_ => idx * 3 + _).map(_i => buf[_i])
      let delta = [r, g, b].map(_ => Math.abs(_ - bg))
      let t = [r, g, b][delta.indexOf(Math.max.apply(null, delta))]
      // console.log([r, g, b, t, delta])
      colorMat.set(i, j, [t, t, t])
    }
  }

  let grayMat = colorMat.bgrToGray()
  return grayMat
  // cv.imshow('result', colorMat)
  // cv.imshow('result1', colorMat0)
  // cv.waitKey(00)
  // grayMat.gaussianBlur(new cv.Size(5, 5), 0)
}
