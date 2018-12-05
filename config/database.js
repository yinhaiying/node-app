

//判断是否是生产环境

if(process.env.Node_ENV === "production"){
  module.exports = {
    mongoURL:'mongodb://haiyinsitan:aaa123456@ds129831.mlab.com:29831/node-app-prod'
  }
}else{
  module.exports = {
    mongoURL:'mongodb://localhost/node-app'
  }
}
