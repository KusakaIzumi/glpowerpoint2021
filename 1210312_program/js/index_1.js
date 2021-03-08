window.addEventListener('DOMContentLoaded', timer_back);

//タイマー開始
function timer_back() {
  timer_index_1 = setInterval(init_back, 15000);
}

var model_count = 0;
var n = 1; //雲の判定
var m = 1; //雪の結晶判定

function init_back() {
  console.log("back");
  model_count++;
  // サイズを指定
  const width_back = window.innerWidth;
  const height_back = 200;

  const renderer_back = new THREE.WebGLRenderer({
    canvas: document.querySelector('#canvas_back'),
    antialias: true,
    alpha:true
  });

  renderer_back.setSize(width_back, height_back);
  renderer_back.setClearColor(0x000000, 0);


  // シーンの作成、カメラの作成と追加、ライトの作成と追加
  const scene_back  = new THREE.Scene();
  const camera_back = new THREE.PerspectiveCamera(30, width_back / height_back, 1, 20);
  camera_back.position.set(0, -2, -10);
  if(model_count == 3*m){
    camera_back.position.set(0, -1, -4);
  }
  camera_back.rotation.order = "XYZ"
  camera_back.rotation.x = -Math.PI/12;
  camera_back.rotation.y = Math.PI;
  camera_back.rotation.z = 0;

  camera_back.lookAt(new THREE.Vector3(0, 0, 0));


  // メッシュの作成と追加
  const grid   = new THREE.GridHelper(10, 10);

  //glTFの読み込み

  var gltfLoader = new THREE.GLTFLoader();
  var model = './glb/box.glb';
  if(model_count == 2*n){
    model = './glb/cloud.glb';
    n++;
  }
  if(model_count == 3*m){
    model = './glb/keshou.glb';
    m++;
  }
  // if(model_count == 5*s){
  //   model = './glb/star.glb';
  //   s++;
  // }

  gltfLoader.load(model,function(data){
      const gltf_back = data;
      const obj_back = gltf_back.scene;
      const animations_back = gltf_back.animations;


      if(animations_back && animations_back.length) {

          //Animation Mixerインスタンスを生成
          mixer_back = new THREE.AnimationMixer(obj_back);

          //全てのAnimation Clipに対して
          for (let u = 0; u < animations_back.length; u++) {
              let animation_back = animations_back[u];

              //Animation Actionを生成
              let action_back = mixer_back.clipAction(animation_back) ;

              //ループ設定（1回のみ）
              action_back.setLoop(THREE.LoopOnce);

              //アニメーションの最後のフレームでアニメーションが終了
              action_back.clampWhenFinished = true;

              //アニメーションを再生
              action_back.play();
          }
      }
      scene_back.add(obj_back);
  });


  //読み込んだシーンが暗いので、明るくする
  renderer_back.gammaOutput = true;


  const clock  = new THREE.Clock();

  let mixer_back;


  // レンダリング
  const animation = () => {

    renderer_back.render(scene_back, camera_back);

    if (mixer_back) {
      mixer_back.update(clock.getDelta());
    }
    requestAnimationFrame(animation);

  };

  animation();

}
