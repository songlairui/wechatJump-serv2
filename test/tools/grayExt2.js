const cv = require('opencv4nodejs')
const path = require('path')
const fs = require('fs')

// 彩色图，灰度化。
module.exports = grayExt2

function grayExt2(colorMat) {
  let buf = colorMat.getData()
  let emptyMat = new cv.Mat(colorMat.rows, colorMat.cols, cv.CV_8UC1)

  // 第10行前10个元素灰度值
  let bg = [0, 1, 2].map(_i => {
    let sum = 0
    for (let _j = 0; _j < 10; _j++) {
      let idx = 10 * 360 + _j * 3 + _i
      sum += buf[idx]
    }
    return sum / 10
  })

  for (let i = 0; i < colorMat.rows; i++) {
    for (let j = 0; j < colorMat.cols; j++) {
      let idx = colorMat.cols * i + j
      let [r, g, b] = [0, 1, 2].map(_ => idx * 3 + _).map(_i => buf[_i])

      let t = 80
      if (r + g + b < 235 * 3) {
        let dArr = [r, g, b].map((_c, _i) => Math.abs(_c - bg[_i]))
        let delta = Math.round(dArr.reduce((a, b) => a + b * b, 0) / 3)
        t = (r + g + b) / 3 - delta / 10
        if (t < 80) t = 80
        if (t > 255) t = 255
      }
      emptyMat.set(i, j, t)
    }
  }

  return emptyMat
}
