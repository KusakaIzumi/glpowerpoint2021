var i = 0;
var cnt = 1;
var ac_count = 0;
var max_acount = 1;
var timer_index_2 = 0;

window.addEventListener('DOMContentLoaded', flower);

function flower() {
    function event() {
      cnt++;
      if(cnt == 2 && i > 0){
        i = 0;
        ac_count = 0;
        max_acount = 1;
        console.log('reset');
        socket.emit('action_reset', {room:login_number ,ac_count:0});

        $('#canvas_1').hide('fast');
        $('#canvas_2').hide('fast');
        $('#canvas_3').hide('fast');
        $('#canvas_4').hide('fast');
        $('#canvas_5').hide('fast');
        $('#canvas_6').hide('fast');
        $('#canvas_7').hide('fast');
        // del(); //オブジェクトの削除
      }
    }

    socket.on('dataName1',(dataFromClient) =>{
      console.log(dataFromClient);
      console.log(login_number);
      if(dataFromClient.ac_count > 1 && i < 1){
        ac_count = 1;
        console.log('reset');
        socket.emit('action_reset', {room:login_number ,ac_count:1});
      }

      ac_count++;

      if(cnt >= 1){
        console.log(max_acount);
        console.log(ac_count);
        if(ac_count == max_acount){
          i++;
          max_acount += 2;
          cnt = 1;
          console.log("i:" + i);
          $('#canvas_' + i).show('fast');
          // タイマー開始
          clearInterval(timer_index_2);
          timer_index_2 = setInterval(event, 20000);
          flower_init(); //オブジェクトの配置
        }
      }
    });
}

const renderer_flowers = [];

function flower_init() {
  // サイズを指定
  const width = 220;
  const height = 170;

  renderer_flowers[i] = new THREE.WebGLRenderer({
    canvas: document.querySelector('#canvas_' + i),
    antialias: true,
    alpha:true
  });

  var renderer_flower = renderer_flowers[i];

  renderer_flower.setSize(width, height);
  renderer_flower.setClearColor(0x000000, 0);


  // シーンの作成、カメラの作成と追加、ライトの作成と追加
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 1, 250);
  camera.position.set(0, 8, 11);
  camera.rotation.order = "XYZ"
  camera.rotation.x = -0.6;

  // メッシュの作成と追加
  const grid   = new THREE.GridHelper(10, 10);

  //glTFの読み込み

  var gltfLoader = new THREE.GLTFLoader();

  gltfLoader.load('./glb/flower.glb',function(data){
      const gltf = data;
      const obj = gltf.scene;
      const animations = gltf.animations;

      if(animations && animations.length) {

          //Animation Mixerインスタンスを生成
          mixer = new THREE.AnimationMixer(obj);

          //全てのAnimation Clipに対して
          for (let u = 0; u < animations.length; u++) {
              let animation = animations[u];

              //Animation Actionを生成
              let action = mixer.clipAction(animation) ;

              //ループ設定（1回のみ）
              action.setLoop(THREE.LoopOnce);

              //アニメーションの最後のフレームでアニメーションが終了
              action.clampWhenFinished = true;

              //アニメーションを再生
              action.play();
          }
      }
      scene.add(obj);
  });


  //読み込んだシーンが暗いので、明るくする
  renderer_flower.gammaOutput = true;


  const clock  = new THREE.Clock();

  let mixer;


  // レンダリング
  const animation = () => {
    renderer_flower.render(scene, camera);

    if (mixer) {
      mixer.update(clock.getDelta());
    }
    requestAnimationFrame(animation);

  };

  animation();
}

function del(){
  scene.remove(mesh);
  geometry.dispose();
  material.dispose();
  texture.dispose();
}
