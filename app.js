//引入程序包
var express = require('express')
  , path = require('path')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);
var clients=[];
//设置日志级别
io.set('log level', 1); 

//WebSocket连接监听
io.on('connection', function (socket) {
  clients.push(socket.id);
  socket.emit('open');//通知客户端已连接
  // 打印握手信息
  console.log(socket.handshake);
  console.log(clients);
  // 构造客户端对象
  var client = {
    socket:socket,
    name:false,
    color:getColor()
  }
  //
  socket.on('anything',function(data){console.log(data)});
  // 对message事件的监听
  socket.on('message', function (msg) {
    var obj = { time: getTime(), color: client.color };
    // 判断是不是第一次连接，以第一条消息作为用户名
    if (!client.name) {
      client.name = msg;
      obj['text'] = client.name;
      obj['author'] = 'System';
      obj['type'] = 'welcome';
      obj['myid']=client.socket.id;
      console.log(client.name + ' ' + client.socket.id + ' login');

      //返回欢迎语
      //广播新用户已登陆
      socket.emit('system', obj);
      socket.broadcast.emit('system', obj);
    } else {
      //如果不是第一次的连接，正常的聊天消息
      obj['text'] = msg;
      obj['author'] = client.name;
      obj['type'] = 'message';
      obj['myid']=client.socket.id;
      console.log(client.name +  ' ' + client.socket.id + ' say: ' + msg);

      // 返回消息（可以省略）
      // 广播向其他用户发消息
      socket.emit('message', obj);
      socket.broadcast.emit('message', obj);
    }
  });

  //监听出退事件
  socket.on('disconnect', function () {
    var obj = {
      time: getTime(),
      color: client.color,
      author: 'System',
      text: client.name,
      type: 'disconnect',
      myid: client.socket.id
    };
    // 广播用户已退出
    socket.broadcast.emit('system', obj);
    console.log(client.name + ' ' + client.socket.id + ' Disconnect');
  });
});

//express基本配置
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// 指定webscoket的客户端的html文件
app.get('/', function(req, res){
  res.sendfile('views/chat.html');
});

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


var getTime=function(){
  var date = new Date();
  return date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
}

var getColor = function () {
    // var colors = ['aliceblue','antiquewhite','aqua','aquamarine','pink','red','green',
    //               'orange','blue','blueviolet','brown','burlywood','cadetblue'];
    var colors = ['aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'pink', 'red'];

    return colors[Math.round(Math.random() * 10000 % colors.length)];
}