const cv = require('opencv4nodejs')
const path = require('path')

let ballMat = cv.imread(path.resolve(__dirname, '..', 'ball.jpg'))

module.exports = function findStartPoint(regionMat) {
  let { maxLoc: ballPoint } = regionMat.matchTemplate(ballMat, 3).minMaxLoc()
  return ballPoint
}
