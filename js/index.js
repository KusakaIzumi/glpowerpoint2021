function init() {
    // サイズを指定
    const width = 500;
    const height = window.innerHeight;
    // レンダラーを作成
    const renderer_box = new THREE.WebGLRenderer({
        canvas: document.querySelector('#canvas_box'),
        antialias: true,
        alpha:true
    });
    renderer_box.setPixelRatio(1);
    renderer_box.setSize(width, height);
    renderer_box.setClearColor(0x000000, 0);

    // シーンを作成
    const scene_box = new THREE.Scene();

    // カメラを作成
    camera_box = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    camera_box.position.set(1000, -1000, 1000);

    const controls = new THREE.OrbitControls(camera_box, renderer_box.domElement);


    // Load GLTF or GLB
    const loader = new THREE.GLTFLoader();
    const url = 'glb/sakura.glb';

    let model = null;
    loader.load(
        url,
        function (gltf) {
            model = gltf.scene;
            // model.name = "model_with_cloth";
            model.scale.set(200.0, 200.0, 200.0);
            model.position.set(1000, -700, 500);
            model.rotation.y = Math.PI * 1 / 3;
            scene_box.add(gltf.scene);

            // model["test"] = 100;
        }
    );
    renderer_box.gammaOutput = true;
    renderer_box.gammaFactor = 2.2;


    // 初回実行
    tick();

    function tick() {
        controls.update();

        renderer_box.render(scene_box, camera_box);
        requestAnimationFrame(tick);
    }
}
