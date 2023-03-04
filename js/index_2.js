var i = 0;
var cnt = 1;
var ac_count = 0;
var max_acount = 1;
var timer_index_2 = 0;
var url = null;
var addFlowerIndex = 0;
var allPushCount = 0;

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
      // if(dataFromClient.ac_count > 1 && i < 1){
      //   ac_count = 1;
      //   console.log('reset');
      //   socket.emit('action_reset', {room:login_number ,ac_count:1});
      // }

      ac_count++;
      allPushCount++;

      if(cnt >= 1){
        console.log(max_acount);
        console.log(ac_count);
        if(ac_count == max_acount && i < 8){
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
        if(allPushCount % 10 == 0 && addFlowerIndex != 20){
          ++allPushCount;
          console.log("ac_count:" + ac_count);
          if(addFlowerIndex == 0){
            ++i;
            var addCanvas = document.createElement('canvas');
            addCanvas.class = "eventFlower";
            addCanvas.id = "canvas_addFlower";
            addCanvas.style.bottom =  0 + '%';
            addCanvas.style.left = 0 + '%';
            document.getElementById('addFlower').appendChild(addCanvas);
            max_acount += 2;
            cnt = 1;
            flowers_init(); //オブジェクトの配置
          }else{
            flowers_init();
          }
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


let renderer_addflowers = null;
var flowerScene = null;
var flowerCamera = null;
var flowerObj = null;
var flowerGroup = null;

function flowers_init() {
  // サイズを指定
  const width = window.innerWidth;
  const height = window.innerHeight;

  if(renderer_addflowers == null){
    renderer_addflowers = new THREE.WebGLRenderer({
      canvas: document.querySelector('#canvas_addFlower'),
      antialias: true,
      alpha:true
    });
    renderer_addflowers.setSize(width, height);
    renderer_addflowers.setClearColor(0x000000, 0);
  }

  // シーンの作成、カメラの作成と追加、ライトの作成と追加
  if(flowerScene == null){
    flowerScene  = new THREE.Scene();
    flowerCamera = new THREE.PerspectiveCamera(70, width / height, 1, 2500);
    flowerCamera.position.set(0, 4, 10);
    flowerCamera.rotation.order = "XYZ"
    flowerCamera.rotation.x = -0.3;
    // 半球光源を作成
    // new THREE.HemisphereLight(空の色, 地の色, 光の強さ)
    const light = new THREE.HemisphereLight(0x888888, 0x0000F, 2.0);
    flowerScene.add(light);  // メッシュの作成と追加
    const grid   = new THREE.GridHelper(10, 5);
  }

  //glTFの読み込み

  var gltfLoader = new THREE.GLTFLoader();

  let mixer;
  if ( flowerGroup == null ) {
    flowerGroup = new THREE.Object3D();
    flowerScene .add( flowerGroup );
  }

  gltfLoader.load('./glb/hana_update.glb',function(data){
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

      var x = 0;
      if(Math.floor( Math.random() * (1 + 1 - 0)) == 0){
        x = Math.floor( Math.random() * (2 + 1 - 0) * 0.5 + 9);
      }else{
        x = Math.floor( Math.random() * (2 + 1 - 0) * 0.5 + -9);
      }
      var y = Math.floor( Math.random() * (7 + 1 - 0)) * 2 - 7;
      var z = Math.floor( Math.random() * (6 + 1 - 2)) * 0.5;
      obj.position.set(x, y, z);
      //obj.position.set(x, y, -20);
      //obj.position.set(9, 0, 1);
      console.log("x:" +  x + "y:" + y + "z:" + z );
      obj.scale.set(0.5,0.5,0.5);
      obj.rotation.set(Math.PI/2,-Math.PI, 0);
      flowerGroup.add(obj);
      flowerObj = obj;
      ++addFlowerIndex;
  });


  //読み込んだシーンが暗いので、明るくする
  renderer_addflowers.gammaOutput = true;

  const clock  = new THREE.Clock();

  // レンダリング
  const animation = () => {
    renderer_addflowers.render(flowerScene, flowerCamera);

    if (mixer) {
      mixer.update(clock.getDelta());
    }
    requestAnimationFrame(animation);

  };

  animation();
}
