let socket;
if (typeof(io) != 'undefined') {
  socket = io.connect(location.origin);
} else {
  // ioオブジェクトが存在しない時にエラーにならない設定
  socket = {
    emit: () => {
    },
    on: () => {
    }
  };
}

var ipadress = 0;


//自分自身の情報を入れる
const IAM = {
  token: null,  // トークン
};

// トークンを発行されたら
socket.on("token", (data)=>{
  IAM.token = data.token;
  console.log(IAM.token);
});

var x = 90;
var y = 10;

window.addEventListener('load', function(){
			document.getElementById("target").addEventListener('touchend', logPosition);
      document.getElementById("target").addEventListener( "click", clickPosition);
});

//スマートフォンの場合のポイント位置
function logPosition(event) {
	if( event.changedTouches[0] ) {
    var touchObject = event.changedTouches[0];
  	var touchX = touchObject.pageX;
  	var touchY = touchObject.pageY;

  	// 要素の位置を取得
  	var clientRect = this.getBoundingClientRect();
  	var positionX = clientRect.left + window.pageXOffset;
  	var positionY = clientRect.top + window.pageYOffset;

    var width = document.getElementById("target").clientWidth;
    var height = document.getElementById("target").clientHeight;

  	// 要素内におけるタッチ位置を計算
  	x = (touchX - positionX)/width * 100;
  	y = (touchY - positionY)/height * 100;

    x = Math.round(x);
    y = Math.round(y);

    if(x > 90){
      x = 90;
    }else if(x < 10){
      x = 10;
    }
    if(y > 80){
      y = 80;
    }if(y < 10){
      y = 10;
    }

    document.getElementById("target_xy").innerHTML = "X=" + x + "　Y=" + y;

    var element = document.getElementById("circle");
    element.style.left = x + '%';
    element.style.top = y + '%';
	}
}

//PCの場合のポイント位置
function clickPosition(event) {
  var clickX = event.pageX ;
  var clickY = event.pageY ;

  // 要素の位置を取得
  var clientRect = this.getBoundingClientRect() ;
  var positionX = clientRect.left + window.pageXOffset ;
  var positionY = clientRect.top + window.pageYOffset ;

  // 要素内におけるクリック位置を計算
  x = clickX - positionX ;
  y = clickY - positionY ;

  var width = document.getElementById("target").clientWidth;
  var height = document.getElementById("target").clientHeight;

  x = (clickX - positionX)/width * 100;
  y = (clickY - positionY)/height * 100;

  x = Math.round(x);
  y = Math.round(y);

  if(x > 90){
    x = 90;
  }else if(x < 10){
    x = 10;
  }
  if(y > 80){
    y = 80;
  }if(y < 10){
    y = 10;
  }

  document.getElementById("target_xy").innerHTML = "X=" + x + "　Y=" + y;

  var element = document.getElementById("circle");
  element.style.left = x + '%';
  element.style.top = y + '%';

  console.log(x);
}

function ShowLength( str ) {
   document.getElementById("mozi_count").innerHTML = str.length;
   var mozi_count = str.length;
}

var login_number = 0;

$(function(){

    //ログイン
    $('#login').submit(function(){
      login_number = $('#login_number').val();
      socket.emit('room_conect', login_number);
      console.log(login_number);
      return false;
    });

    socket.on('room_conect_message',(room) =>{
      console.log(room);
    });
    ///////

    $('#message_form').submit(function(){
      var element = document.getElementById( "message_form" ) ;
      var radioNodeList = element.hyouka;
      var radioValue = radioNodeList.value;
      var input = document.getElementById("input_msg")
      var mozi_count = input.value.length

      console.log(x);

      socket.emit('message', {room:login_number ,ip_adress:ipadress ,msg:$('#input_msg').val(), syurui:radioValue, count:mozi_count, x:x, y:y});

      $('#input_msg').val('');
      return false;

    });

    //いいねアクション
    var action_count = 0;
    $('#good_action').submit(function(){
      action_count++;
      console.log(action_count);
      socket.emit('dataName1', {room:login_number ,ac_count:action_count, id:IAM.token});
      return false;
    });

    socket.on('action_reset',(reset) =>{
      action_count = 0;
    });

    socket.on('from_main',(up_image) =>{
      document.getElementById("img1").src = up_image.up_image;
    });

});

function like (type) {
  socket.emit('Chart', {room:login_number ,chart_value:type});
  window.location.href = './index_4.html'; // 通常の遷移
  return false;
}
