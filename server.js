// httpモジュールの読み込み
const http = require('http');
// fsモジュールの読み込み
const fs = require('fs');
// pathモジュールの読み込み
const path = require('path');
// httpサーバーを立てる
const server = http.createServer(requestListener);
//cryptoモジュール
const crypto = require('crypto');
// httpサーバーを起動する。
server.listen((process.env.PORT || 8080), function () {
  console.log((process.env.PORT || 8080) + 'でサーバーが起動しました');
});


/**
 * サーバーにリクエストがあった際に実行される関数
 */
function requestListener(request, response) {
  // リクエストがあったファイル
  const requestURL = request.url;
  // リクエストのあったファイルの拡張子を取得
  const extensionName = path.extname(requestURL);
  // ファイルの拡張子に応じてルーティング処理
  switch (extensionName) {
    case '.html':
      readFileHandler(requestURL, 'text/html', false, response);
      break;
    case '.css':
      readFileHandler(requestURL, 'text/css', false, response);
      break;
    case '.js':
    case '.mp4':
      readFileHandler(requestURL, 'text/mp4', true, response);
      break;
    case '.mov':
      readFileHandler(requestURL, 'text/mov', true, response);
      break;
    case '.ts':
      readFileHandler(requestURL, 'text/javascript', false, response);
      break;
    case '.png':
      readFileHandler(requestURL, 'image/png', true, response);
      break;
    case '.jpg':
      readFileHandler(requestURL, 'image/jpeg', true, response);
      break;
    case '.gltf':
      readFileHandler(requestURL, 'text/glb', true, response);
      break;
    case '.glb':
      readFileHandler(requestURL, 'text/glb', true, response);
      break;
    default:
      // どこにも該当しない場合は、index.htmlを読み込む
      readFileHandler('/index.html', 'text/html', false, response);
      break;
  }
}

/**
 * ファイルの読み込み
 */
function readFileHandler(fileName, contentType, isBinary, response) {
  // エンコードの設定
  const encoding = !isBinary ? 'utf8' : 'binary';
  const filePath = __dirname + fileName;

  fs.exists(filePath, function (exits) {
    if (exits) {
      fs.readFile(filePath, {encoding: encoding}, function (error, data) {
        if (error) {
          response.statusCode = 500;
          response.end('Internal Server Error');
        } else {
          response.statusCode = 200;
          response.setHeader('Content-Type', contentType);
          if (!isBinary) {
            response.end(data);
          }
          else {
            response.end(data, 'binary');
          }
        }
      });
    }
    else {
      // ファイルが存在しない場合は400エラーを返す。
      response.statusCode = 400;
      response.end('400 Error');
    }
  });
}

// socket.ioの読み込み
const socketIO = require('socket.io');
// サーバーでSocket.IOを使える状態にする
const io = socketIO.listen(server);

//選択肢
var a = 0;
var b = 0;
var c = 0;
var d = 0;

// サーバーへのアクセスを監視。アクセスがあったらコールバックが実行
io.sockets.on('connection', function (socket) {
  const remoteAddress = socket.request.connection.remoteAddress;
  const splittedAddress = remoteAddress.split(':');
  const address = splittedAddress[splittedAddress.length - 1];


  console.log("ユーザーが接続しました");

  const token = makeToken(socket.id);
  //クライアントへidの付与
  io.to(socket.id).emit("token", {token:token});

  //room番号
  socket.on('room_conect',(room) =>{
    socket.join(room);
    io.to(room).emit('room_conect_message', room);
  });

  //接続元のクライアント以外にデータ送信
  //socket.broadcast.emit('dataName1', dataToClient);
  socket.on('message',(msg) =>{
    msg.ipadress = address;
    console.log('message: ' + msg);
    io.to(msg.room).emit('message', msg);
  });

  //高評価のデータ送受信
  socket.on('dataName1',(dataFromClient) =>{
    //接続元のクライアントだけにデータ送信。
    console.log(dataFromClient);
    io.to(dataFromClient.room).emit('dataName1', dataFromClient);
  });

  //
  socket.on('from_main',(up_image) =>{
    io.to(up_image.room).emit('from_main', up_image);
  });

  //
  socket.on('action_reset',(reset) =>{
    io.to(reset.room).emit('action_reset', reset);
  });

  //グラフのデータ受送信
  socket.on('Chart',(chart_value) =>{
    if(chart_value.chart_value == 'a'){
      a++;
    }
    if(chart_value.chart_value == 'b'){
      b++;
    }
    if(chart_value.chart_value == 'c'){
      c++;
    }
    if(chart_value.chart_value == 'd'){
      d++;
    }
    if(chart_value.chart_value == 'reset'){
      a = 0;
      b = 0;
      c = 0;
      d = 0;
      console.log(a);
    }
    var chart_cnt = [[a],[b],[c],[d]]
    io.to(chart_value.room).emit('Chart', chart_cnt);
  });
});

// トークンの作成///////////////////////////////////////////////////
function makeToken(id){
  const str = "aqwsedrftgyhujiko" + id;
  return( crypto.createHash("sha1").update(str).digest('hex') );
}
/////////////////////////////////////////////////////////////////
