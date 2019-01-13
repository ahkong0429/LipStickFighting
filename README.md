
# demo

http://lvv.fun

# 开发环境

cocos creator v2.0.6

nodejs v8.8.1

npm 6.5.0

pm2 2.4.2

# 服务端
  ## 安装
  
cd server

npm install

## 启动

pm2 start lsfServer.js --name Game

## 重启

pm2 restart Game

## 查看日志

pm2 log Game
