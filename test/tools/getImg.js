const net = require('net')
const jpeg = require('jpeg-js')
const cv = require('opencv4nodejs')
const path = require('path')

// 写死的端口号参数
let client = net.connect({ port: 1338 }, _ => {
  console.log('connected to electron-serv')
  client.write('capture')
})
client.on('readable', function() {
  let dataFrame = client.read()

  if (dataFrame && dataFrame.length > 1000) {
    var rawImageData = jpeg.decode(dataFrame)
    let { width, height, data } = rawImageData
    let mat = new cv.Mat(data, height, width, cv.CV_8UC4).cvtColor(
      cv.COLOR_BGR2RGB
    )
    // console.log({ rawImageData, mat })
    // cv.imshowWait('test', mat)
    // 取得小人所在区域 ， 去除比分和底部
    let region = mat.getRegion(new cv.Rect(0, 160, 360, 300))
    // cv.imshowWait('test', region)
    cv.imwrite(path.resolve(__dirname, 'white.jpg'), region)
    client.end()
  } else {
    console.log('dataFrame is too small ', dataFrame && dataFrame.length)
  }
})
function closeFn() {
  console.log('deviceSocket closed')
}
client.on('error', closeFn)
client.on('exit', closeFn)
client.on('close', closeFn)
