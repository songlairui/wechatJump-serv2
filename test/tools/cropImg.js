const cv = require('opencv4nodejs')
const path = require('path')
const fs = require('fs')
;['pill', 'white11', 'whiteC', 'green2'].forEach(filename => {
  console.log(filename)
  let targetMat = cv.imread(path.resolve(__dirname, filename + '.jpg'))
  let region = targetMat.getRegion(new cv.Rect(0, 160, 360, 300))
  cv.imwrite(path.resolve(__dirname, filename + '_.jpg'), region)
})
