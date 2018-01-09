const cv = require('opencv4nodejs')
const path = require('path')
const fs = require('fs')

gray2()

// 彩色图，灰度化。
module.exports = gray2

function gray2() {
  let colorMat = cv.imread('./white4.jpg')
  let buf = colorMat.getData()

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

      let t = 10
      if (r + g + b < 235 * 3) {
        let dArr = [r, g, b].map((_c, _i) => Math.abs(_c - bg[_i]))

        let delta = Math.round(dArr.reduce((a, b) => a + b * b, 0) / 3)
        t = (r + g + b) / 3 - delta / 10
        if (t < 0) t = 0
        if (t > 255) t = 255
      }
      // console.log(bg, r, g, b, t, dArr, delta)
      // console.log([r, g, b, t, delta])
      colorMat.set(i, j, [t, t, t])
    }
  }

  let grayMat = colorMat.bgrToGray()
  // let gaussic = grayMat.gaussianBlur(new cv.Size(7, 7), 0)
  // let bin = gaussic.threshold(0, 255, cv.THRESH_OTSU)
  // cv.imshow('gaussic', gaussic)
  cv.imshow('grayMat', grayMat)
  // cv.imshow('bin', bin)
  cv.waitKey(00)
  return grayMat
}
