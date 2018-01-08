const serve = require('koa-static')
const Koa = require('koa')
const KoaRouter = require('koa-router')
const route = require('koa-route')
const logger = require('koa-logger')
const cv = require('opencv4nodejs')
const fs = require('fs')
const os = require('os')
const net = require('net')
const path = require('path')
const extname = path.extname
const jpeg = require('jpeg-js')
const findStartPoint = require('./utils/findstart.js')
const findTargetPoint = require('./utils/findtarget.js')
const websockify = require('koa-websocket')

var router = KoaRouter()
const app = websockify(new Koa())
app.use(logger())

app.use(serve('.'))

router.get('/screenshot', screenshot).get('/act/touch/:x/:y', touch)
// .get('*', info)
app.use(router.routes())
let cachedPromise = []
app.ws.use(
  route.all('/test/:id', function(ctx) {
    // `ctx` is the regular koa context created from the `ws` onConnection `socket.upgradeReq` object.
    // the websocket is added to the context on `ctx.websocket`.
    ctx.websocket.send('Hello World')
    ctx.websocket.on('message', function(message) {
      console.log(message)
      switch (message.toString()) {
        case 'capture':
          attachDeviceSocket(ctx)
          ctx.deviceSocket && ctx.deviceSocket.write('capture')
          // ctx.websocket.send(Buffer.from('textString'))
          return new Promise(r => {
            cachedPromise.push(r)
          }).then(function() {
            analyse(ctx)
          })
          break
        case 'analyse':
          analyse(ctx)
          break
        default:
          ctx.websocket.send('hello')
      }
    })
  })
)

app.listen(1235, _ => console.log('listening'))

function analyse(ctx) {
  console.info('analyse')
  // 分析上一帧图像
  if (!ctx.lastFrame || ctx.lastFrame.length < 100) {
    ctx.websocket.send('no frame')
  } else {
    // 读取颜色
    try {
      var rawImageData = jpeg.decode(ctx.lastFrame)
      let { width, height, data } = rawImageData
      let mat = new cv.Mat(data, height, width, cv.CV_8UC4).cvtColor(
        cv.COLOR_BGR2RGB
      )
      // console.log({ rawImageData, mat })
      // cv.imshowWait('test', mat)
      // 取得小人所在区域 ， 去除比分和底部
      let region = mat.getRegion(new cv.Rect(0, 160, 360, 300))
      // cv.imshowWait('test', region)
      // cv.imwrite(path.resolve(__dirname, 'forth.jpg'), region)
      // console.info({ target })
      let startPoint = findStartPoint(region)
      let targetPoint = findTargetPoint(region)

      console.info({ startPoint, targetPoint })
      ctx.websocket.send(
        JSON.stringify({
          points: [
            { x: startPoint.x + 5, y: startPoint.y + 160 + 62 },
            { x: targetPoint.x, y: targetPoint.y + 160 }
          ],
          type: 'points'
        })
      )
    } catch (e) {
      console.error(e)
    }
  }
}
function attachDeviceSocket(ctx) {
  if (ctx.deviceSocket) return
  // 写死的端口号参数
  let client = net.connect({ port: 1338 }, _ => {
    console.log('connected to electron-serv')
    ctx.deviceSocket = client
  })
  client.on('readable', function() {
    let dataFrame = client.read()
    ctx.lastFrame = dataFrame
    if (cachedPromise.length) {
      cachedPromise.forEach(r => r())
      cachedPromise.splice(0, cachedPromise.length)
    }
    ctx.websocket.send(dataFrame)
  })
  function closeFn() {
    console.log('deviceSocket closed')
    ctx.deviceSocket = null
  }
  client.on('error', err => {
    ctx.websocket.send('err:' + err.errno)
  })
  client.on('exit', closeFn)
  client.on('close', closeFn)
}

async function screenshot(ctx) {
  ctx.response.body = 'screenshot'
}
async function touch(ctx) {
  ctx.response.body = 'touch'
}
