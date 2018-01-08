const cv = require('opencv4nodejs')

let a = cv.imread('./third.jpg', 0)
let bg =
  a
    .getData()
    .slice(18000, 18010)
    .reduce((a, b) => a + b, 0) / 10
console.log({ bg })

// let binary = a.threshold(Math.round(bg * 1.05), 255, cv.THRESH_BINARY_INV)
let binary = a.threshold(0, 255, cv.THRESH_OTSU)

let gaussic = a.gaussianBlur(new cv.Size(3, 3), 0)

let bin2 = gaussic.threshold(Math.round(bg * 1.05), 255, cv.THRESH_BINARY_INV)
let bin3 = gaussic.threshold(0, 255, cv.THRESH_OTSU)

// let bin2_part = gaussic
//   .getRegion(new cv.Rect(0, 0, 360, 110))
//   .threshold(bg, 255, cv.THRESH_OTSU)

cv.imshow('a', a)
cv.imshow('binary', binary)
// cv.imshow('gaussic', gaussic)
cv.imshow('gaussic-binary2', bin2)
cv.imshow('gaussic-binary3', bin3)
// cv.imshow('gaussic-binary_part', bin2_part)

cv.waitKey(000)
