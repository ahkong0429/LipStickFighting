/****/
// 以下代码用于维持进程，当子进程退出时，5秒后自动重新开启进程。
if (process.argv.length > 1) {
  // 这个if肯定会成立，其作用是为了把内部的变量的作用范围和外部分离开来，避免冲突
  var newArgv = [];
  var ifChild = false;
  process.argv.forEach(function (val, index, array) {
    if (val == '-run_in_child') {
      ifChild = true;
    }
    else if (index > 0) newArgv.push(val);//第0个元素是命令/程序路径
  });
  if (!ifChild) {
    newArgv.push('-run_in_child');//子进程需要一个命令标志：run_in_child
    start();
    function start() {
      console.log('master process is running.');
      var cp = require('child_process').spawn(process.argv[0], newArgv);
      cp.stdout.pipe(process.stdout);
      cp.stderr.pipe(process.stderr);
      cp.on('exit', function (code) {
        if (code == 0) {
          //正常退出进程
          process.exit(0);
          return;
        }
        //可以在此添加进程意外退出的处理逻辑
        delete (cp);
        console.log('child process exited with code ' + code);
        setTimeout(start, 5000);
      });
    }
    return;
  }
}

//my code
var express = require('express')
  , cors = require('cors')
  , app = express()
  , bodyParser = require('body-parser')
  , server = require('http').Server(app)
  , port = process.env.PORT || 781

// const jwt = require('jsonwebtoken');
// const secret = 'AKMJ';

server.listen(port, function () {
  console.log('listening on *:', port);
});

/**
 * Web App Server Code
 */
//设置跨域访问
app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.use(express.static(__dirname + '/'));



var Main = require('./xxMain').mainInit();
Main.init(app);