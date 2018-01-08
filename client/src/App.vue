<template lang="pug">
  div
    div.header
      h1 opencv-serv with vue koa
      p {{ msg }}
    div.sider(:style='sider + ":0"')
      section
        h3 status
        pre 
          | websocket: {{ src ? 'on':'off'}}  
          |  sMsg: {{ sMsg }}
    div.col
      section
        h3 pre-action
        button(@click='getWebsocket') 1.connect
        button(@click='wsSend(``)') 2.send
        button(@click='wsSend(`capture`)') 2.1 capture
        button(@click='wsSend(`analyse`)') 2.2 analyse
      section
        h2 webpage get image from websocket
        p koa get image from socket
        div.stage
          canvas#s1
          i.point(:style='`top:${mark.point.y + 5}px;left:${mark.point.x +5}px`')
          i.point(v-for='(point,idx) in mark.points' :key='idx' :style='`top:${point.y}px;left:${point.x}px`')
      section
        h2 webpage get data from websocket
        p koa send data via protobuf 
</template>
<script>
export default {
  name: 'app',
  data() {
    return {
      msg: 'hello',
      src: null,
      sider: 'right',
      sMsg: '',
      mark: {
        point: { x: 0, y: 0 },
        points: []
      }
    }
  },
  created() {
    window.vm = this
  },
  methods: {
    wsSend(str) {
      if (!this.src) return console.error('no socket')
      this.src.send(str ? str.toString() : '')
    },
    getWebsocket() {
      if (this.src) return this.src
      let socket = new WebSocket('ws://' + window.location.hostname + ':1235/test/abc');
      var vm = this
      vm.src = socket
      // Connection opened
      socket.addEventListener('open', function(event) {
        socket.send('Hello Server!');
      });
      var errFn = e => {
        console.warn('err', e)
        vm.src = socket = null
        console.info(vm.src)
        // vm.src = null
      }
      socket.addEventListener('close', errFn)
      socket.addEventListener('error', errFn)
      // Listen for messages
      socket.addEventListener('message', function(event) {
        console.info('receiving:', event.data)
        if (typeof event.data === 'string') {
          try {
            let meta = JSON.parse(event.data)
            console.info(meta)
            if (meta.width && meta.height) {
            }
            switch (meta.type) {
              case 'point':
                vm.mark.point = meta
                break
              case 'points':
                vm.mark.points = meta.points
                break
              default:

            }
          } catch (e) {
            console.warn('not JSON data:', event.data)
          }
        } else if (event.data instanceof Blob) {
          var arrayBuffer;
          var fileReader = new FileReader();
          fileReader.onload = function(...x) {
            // console.info(x, this)
            arrayBuffer = this.result;
            var el = document.querySelector('#s1')
            let BLANK_IMG = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
            var g = el.getContext('2d')
            let isStr = false
            try {
              var enc = new TextDecoder()
              let result = enc.decode(arrayBuffer)
              if (result.length < 100) {
                isStr = true
                vm.sMsg = result.toString()
              }
            } catch (e) {
              // this.sMsg = ''

            }
            if (isStr) return
            var blob = new Blob([arrayBuffer], { type: 'image/jpeg' })
            var URL = window.URL || window.webkitURL
            var img = new Image()
            img.onload = () => {
              el.width = img.width
              el.height = img.height
              g.drawImage(img, 0, 0)
              // firstImgLoad = true
              img.onload = null
              img.src = BLANK_IMG
              img = null
              u = null
              blob = null
            }
            var u = URL.createObjectURL(blob)
            img.src = u
          };
          fileReader.readAsArrayBuffer(event.data);
          console.info('reading')
        } else {
          window._tmp = event
          console.log('Message from server', event.data);
          console.info('type', typeof event.data)
        }
      });
    }
  }
}
</script>
<style lang="stylus">
section 
  padding .5em .5em 1em
  border-bottom thin solid #333

.header
  background cyan

.sider
  position fixed
  background #ffffff
  border thin solid red
  height 70%
  overflow auto
  top 0

.stage
  position relative
  min-height 600px

i.point
  position absolute
  width 10px
  height 10px
  background red 
  border-radius 50%
  z-index 99

canvas#s1
  background lighten(blue,20)
  position absolute
  top 0 
  left 0


</style>

