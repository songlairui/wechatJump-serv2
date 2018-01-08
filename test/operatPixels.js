const cv = require('opencv4nodejs')

let a = cv.imread('./third.jpg')

// let array = a.getDataAsArray()
// console.log('array lines:', array.length)
// console.log('array width:', array[0].length)
let buffer = a.getData()
console.log('buffer length:', buffer.length)
console.log('data per pixel:', buffer.length / 360 / 300)

let { rows: height, cols: width } = a

function thresold(num, thresold = 30) {
  return Math.abs(num) > thresold ? num : 0
}
let targletLine = undefined
// 计算差异值，每一行都计算
// 约定差异计算方法，每个颜色通道都计算，然后相加，相当于三遍方差
// 方差计算，不计算总体平均值，只使用第一个值
// TODO 使用前10个像素平均值，当前10个像素基本一致时

// 每行，每个值都取
// TODO， 隔x行，x列加速取值
for (let i = 0; i < height; i += 3) {
  let start = i * width * 3
  let end = start + width * 3
  let line = buffer.slice(start, end)
  let sumRGB = [0, 0, 0] // [sumR, sumG, sumB]

  // [avgR, avgG, avgB]
  let avgRGB = [0, 1, 2].map(_ => {
    let sum = 0
    for (let l = 0; l < 10; l++) {
      sum += line[l * 3 + _]
    }
    return Math.round(sum / 10)
  })
  for (let j = 0; j < width; j += 3) {
    ;[0, 1, 2].forEach(_ => {
      sumRGB[_] += Math.pow(thresold(line[j * 3 + _] - avgRGB[_]), 2)
    })
    // sumR += Math.pow(thresold(line[j * 3] - line[0]), 2)
    // sumG += Math.pow(thresold(line[j * 3 + 1] - line[0 + 1]), 2)
    // sumB += Math.pow(thresold(line[j * 3 + 2] - line[0 + 2]), 2)
  }
  let lineVariance = Math.round(sumRGB.reduce((a, b) => a + b, 0) / width / 3)
  // console.log(i, lineVariance)
  if (lineVariance > 100) {
    targletLine = i
    break
  }
}

// 找到对应像素点

let line = buffer.slice(width * 3 * (targletLine - 1), width * 3 * targletLine)

console.info(line)

/* 操作1行buffer
let line = buffer.slice(0, width * 3)
let [sumR, sumG, sumB] = [0, 0, 0]
for (let k = 0; k < width; k++) {
  sumR += Math.pow(line[k * 3] - line[0], 2)
  sumG += Math.pow(line[k * 3 + 1] - line[0 + 1], 2)
  sumB += Math.pow(line[k * 3 + 2] - line[0 + 2], 2)
}
console.log({ sumR, sumG, sumB })

*/
