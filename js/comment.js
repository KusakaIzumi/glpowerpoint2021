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


var fukidashi_count = 0;
var id = 0;
var login_number = 0;
var slide_number = 0;

$(function(){

  //ログイン
  $('#login').submit(function(){
    login_number = $('#login_number').val();
    console.log(login_number);
    if( login_number != "" ){
      socket.emit('room_conect', login_number);
      slide_number = $('#slide_input').val();
      const slide = document.getElementById("slide");
      slide.innerHTML = slide_number;
    }

    return false;
  });

  socket.on('room_conect_message',(room) =>{
    console.log(room);
  });
  ///////

  socket.on('message',function(msg){

    var timer = msg.count * 3000;

    console.log(msg.ipadress);

    if( document.getElementById(msg.syurui) != null ){
      if(document.getElementById(msg.syurui).style.display == "block" && msg.count > 0){
        // 表示されている場合の処理
        var element = document.getElementById(msg.syurui);
        element.style.left = msg.x + '%';
        element.style.top = msg.y + '%';

        $('#'+ msg.syurui).show('slow');
        id = setTimeout(close , timer, msg.syurui);
        element.value = id;
        document.getElementById(msg.syurui).innerHTML = "<p>"+ msg.msg +"</p>";
      }else if(msg.count > 0){
        // 非表示の場合の処理
        var element = document.getElementById(msg.syurui);
        element.style.left = msg.x + '%';
        element.style.top = msg.y + '%';

        $('#'+ msg.syurui).show('slow');
        id = setTimeout(close , timer, msg.syurui);
        element.value = id;
        document.getElementById(msg.syurui).innerHTML = "<p>"+ msg.msg +"</p>";
      }
    }else{
      if(msg.count > 0){
        var commnt_top = Math.random() * 100;
        var comment = document.getElementById('comment');
        comment.insertAdjacentHTML('afterbegin','<li class="comment_keyfram" style="top:' + Math.round(commnt_top) + '%;">'+ msg.msg +'</li>');
      }
    }
  });
});

function close(syurui){
  if (document.getElementById(syurui).style.display == "block") {
    $('#'+ syurui).hide(1500);
  }
}

myChart_1 = null;

function chartDraw(mychart){
  var options = {
      type: "bar",
      data: {
        labels: ["アンケート結果"],
        datasets: [
          { label: "A", data: bar_List[0], backgroundColor: "rgba(244, 143, 177, 0.6)" },
          { label: "B", data: bar_List[1], backgroundColor: "rgba(255, 235, 59, 0.6)" },
          { label: "C", data: bar_List[2], backgroundColor: "rgba(100, 181, 246, 0.6)" },
          { label: "D", data: bar_List[3], backgroundColor: "rgba(50, 81, 246, 0.6)" }
        ]
      },
  options: {
  animation : false,
  scales: {
  yAxes: [{
    ticks: {
      suggestedMax: 10,
      suggestedMin: 0,
      stepSize: 10,
           }
         }]
        }
  }}
  console.log(!myChart_1);

  if (!myChart_1) {
    console.log(mychart);
    myChart_1 = new Chart(document.getElementById(mychart), options)
  } else {
   //データのみ更新
   myChart_1.data.datasets = options.data.datasets;
   myChart_1.update();
  }

}
