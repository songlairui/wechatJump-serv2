const Koa = require('koa')
const KoaRouter = require('koa-router')
const route = require('koa-route')
const logger = require('koa-logger')
const fs = require('fs')
const net = require('net')
const path = require('path')
const extname = path.extname

const websockify = require('koa-websocket')
var router = KoaRouter()
const app = websockify(new Koa())
app.use(logger())

router
  .get('/screenshot', screenshot)
  .get('/act/touch/:x/:y', touch)
  .get('*', info)
app.use(router.routes())

app.ws.use(
  route.all('/test/:id', function(ctx) {
    // `ctx` is the regular koa context created from the `ws` onConnection `socket.upgradeReq` object.
    // the websocket is added to the context on `ctx.websocket`.
    ctx.websocket.send('Hello World')
    ctx.websocket.on('message', wsFn.bind(ctx.websocket))
  })
)

app.listen(1235, _ => console.log('listening'))

async function info(ctx) {
  const fpath = path.join(__dirname, '..', 'static', 'index.html')
  ctx.type = extname(fpath)
  ctx.body = fs.createReadStream(fpath)
}
async function screenshot(ctx) {
  ctx.response.body = 'screenshot'
}
async function touch(ctx) {
  ctx.response.body = 'touch'
}

/**
 * thunkify stat
 */

function stat(file) {
  return new Promise(function(resolve, reject) {
    fs.stat(file, function(err, stat) {
      if (err) {
        reject(err)
      } else {
        resolve(stat)
      }
    })
  })
}
