// トップの海（WebGL）。three.js r149（assets/js/vendor/three-r149.min.js、MITライセンス）を使う。
// WebGLが使えないときは何もしない（写真がそのまま見える）。
// 動きを減らす設定（prefers-reduced-motion）の人には、止まった海を表示する。
(function () {
  const canvas = document.getElementById('sea');
  if (!canvas || !window.THREE) return;
  const frame = canvas.parentElement;
  const hero = canvas.closest('.hero');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrowScreen = matchMedia('(max-width: 760px)').matches;

  // 見た目の設定
  const CFG = {
    horizon: 0.60,      // 水平線の高さ（上から何割）PC
    horizonSp: 0.58,    // 同 スマホ縦
    camH: 1.6,          // カメラの高さ
    amp: 1.0,           // 波の大きさ
    speed: 1.0,         // 波の速さ
    sunX: -0.15,        // 日差しの左右（+で右）
    spec: 0.7,          // 照り返しの強さ
    parallax: 0.6,      // マウスで視点が動く量
    deep: [0.035, 0.15, 0.19], shallow: [0.11, 0.31, 0.36],
    sky: [0.78, 0.84, 0.85], fog: [0.92, 0.86, 0.80],
  };

  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: !narrowScreen, alpha: true }); }
  catch (e) { canvas.remove(); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, narrowScreen ? 1.5 : 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 2, 0.1, 400);
  const seg = narrowScreen ? 160 : 288;
  const geo = new THREE.PlaneGeometry(240, 240, seg, seg);
  geo.rotateX(-Math.PI / 2);
  const vec = (a) => new THREE.Vector3(a[0], a[1], a[2]);
  const U = {
    uTime: { value: 0 }, uAmp: { value: CFG.amp },
    uRipple: { value: new THREE.Vector2(0, -8) }, uRippleT: { value: -100 },
    uSun: { value: new THREE.Vector3(CFG.sunX, 0.22, -1).normalize() }, uSpec: { value: CFG.spec },
    uDeep: { value: vec(CFG.deep) }, uShallow: { value: vec(CFG.shallow) },
    uSky: { value: vec(CFG.sky) }, uFog: { value: vec(CFG.fog) },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms: U, transparent: true,
    vertexShader: `
      uniform float uTime; uniform float uAmp; uniform vec2 uRipple; uniform float uRippleT;
      varying vec3 vWorld; varying vec3 vN;
      float h(vec2 p){
        float y = 0.0;
        y += sin(dot(p, vec2(0.82, 0.57)) * 0.28 + uTime * 0.80) * 0.34;
        y += sin(dot(p, vec2(-0.48, 0.88)) * 0.52 + uTime * 1.15) * 0.17;
        y += sin(dot(p, vec2(0.21, -0.98)) * 1.00 + uTime * 1.60) * 0.075;
        y += sin(dot(p, vec2(0.93, -0.36)) * 1.85 + uTime * 2.20) * 0.036;
        y += sin(dot(p, vec2(-0.7, -0.7)) * 3.10 + uTime * 2.90) * 0.016;
        y *= uAmp;
        float t = uTime - uRippleT;
        if (t > 0.0 && t < 8.0) {
          float d = length(p - uRipple);
          y += sin(d * 2.4 - t * 7.0) * 0.28 * exp(-t * 0.55) * exp(-abs(d - t * 3.2) * 0.55);
        }
        return y;
      }
      void main(){
        vec3 p = position;
        float e = 0.08;
        float y = h(p.xz), yx = h(p.xz + vec2(e, 0.0)), yz = h(p.xz + vec2(0.0, e));
        p.y = y;
        vN = normalize(vec3(-(yx - y) / e, 1.0, -(yz - y) / e));
        vec4 w = modelMatrix * vec4(p, 1.0);
        vWorld = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: `
      uniform vec3 uSun; uniform float uSpec;
      uniform vec3 uDeep; uniform vec3 uShallow; uniform vec3 uSky; uniform vec3 uFog;
      varying vec3 vWorld; varying vec3 vN;
      void main(){
        vec3 n = normalize(vN);
        vec3 v = normalize(cameraPosition - vWorld);
        float fres = pow(1.0 - max(dot(n, v), 0.0), 4.0);
        vec3 water = mix(uDeep, uShallow, clamp(n.y * 0.5 + vWorld.y * 0.55, 0.0, 1.0) * 0.65);
        vec3 col = mix(water, uSky, clamp(fres * 0.85 + 0.06, 0.0, 1.0));
        vec3 r = reflect(-v, n);
        float s = max(dot(r, uSun), 0.0);
        col += vec3(1.0, 0.95, 0.88) * (pow(s, 160.0) * 1.4 + pow(s, 14.0) * 0.10) * uSpec;
        float dist = length(vWorld.xz - cameraPosition.xz);
        col = mix(col, uFog, smoothstep(14.0, 90.0, dist) * 0.78);
        gl_FragColor = vec4(col, 1.0 - smoothstep(62.0, 112.0, dist));
      }`,
  });
  scene.add(new THREE.Mesh(geo, mat));

  // 水平線が「上から horizon 割」の位置に来るよう、カメラの向きを決める
  let W = 1, H = 1;
  const look = new THREE.Vector3();
  function aim(px, py) {
    const narrow = W / H < 1;
    camera.fov = narrow ? 58 : (W / H > 2.2 ? 34 : 42);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    const f = narrow ? CFG.horizonSp : CFG.horizon;
    const tanPitch = (0.5 - f) * 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    camera.position.set(px, CFG.camH + py, 10);
    look.set(px * 0.3, camera.position.y - tanPitch * 40, -30);
    camera.lookAt(look);
  }

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', (e) => {
    const r = frame.getBoundingClientRect();
    mouse.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    mouse.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
  }, { passive: true });

  // 海面をクリック・タップすると波紋（文字・リンク・ボタンの上は除く）
  const ray = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const hit = new THREE.Vector3();
  hero.addEventListener('pointerdown', (e) => {
    if (e.target.closest('a, button, h1, p')) return;
    const r = frame.getBoundingClientRect();
    ray.setFromCamera({ x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -((e.clientY - r.top) / r.height) * 2 + 1 }, camera);
    if (ray.ray.intersectPlane(plane, hit)) {
      U.uRippleT.value = U.uTime.value; U.uRipple.value.set(hit.x, hit.z); kick();
    }
  });

  let t = 0, last = performance.now(), raf = 0, visible = true;
  const paused = reduce; // 動きを減らす設定の人には止まった海
  function draw(now) {
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    if (!paused) t += dt * CFG.speed;
    U.uTime.value = t;
    mouse.x += (mouse.tx - mouse.x) * 0.04; mouse.y += (mouse.ty - mouse.y) * 0.04;
    const p = reduce ? 0 : CFG.parallax;
    aim(mouse.x * 0.8 * p, -mouse.y * 0.25 * p + Math.sin(t * 0.6) * 0.04);
    renderer.render(scene, camera);
  }
  function loop(now) {
    draw(now);
    const rippling = U.uTime.value - U.uRippleT.value < 8;
    raf = visible && !document.hidden && (!paused || rippling) ? requestAnimationFrame(loop) : 0;
  }
  function kick() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } }
  function resize() {
    W = frame.clientWidth; H = frame.clientHeight;
    if (!W || !H) return;
    renderer.setSize(W, H, false);
    draw(performance.now());
  }
  new ResizeObserver(resize).observe(frame);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }).observe(frame);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });


  resize();
  document.documentElement.classList.add('sea-ready');
  kick();
})();
