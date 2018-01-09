# opencv-serv 
使用 opencv 处理图像。 采用 koa-server + vue 的方式

## STEPS 1
参考vue提供的模板，布置前端脚手架。
参考 https://github.com/BUPT-HJM/vue-blog/ 更新脚手架

## 依赖

electron-serv 提供获取手机画面的socket

## 后端  
koa，监听1235，并启用websocket  
后端使用opencv库，存储ball模板为ball.jpg,使用matchTemplate方法找到小人所在位置。

## 前端   
vue-cli 中 webpack-simple 模板。  

默认页面按钮功能：  
1.connect - 页面连接koa server的websocket 
2.send - websocket 发送空包
2.1 capture websocket 发送‘capture’ ，后端koa发送信息给electron-serv socket api。
2.2 analyse 绘制圆点给跳一跳小人
    人头（x+5,y+5）
    底座（x+5,y+64）
    定位坐标（x+10,y+69）

## TODO 
1. 不需要找点，只需要横坐标
2. 可以根据横坐标，修正找到的中心点
3. 优化找点算法
