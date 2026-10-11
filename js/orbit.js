import * as THREE from '../vendor/three/three.module.min.js';

const canvas = document.getElementById('orbit');
const hero = canvas && canvas.closest('.hero');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

if (canvas && hero) {
  if (!webglAvailable()) hero.classList.add('no-3d');
  else {
    try { init(); } catch (err) {
      hero.classList.add('no-3d');
      console.warn('Orbit scene disabled:', err);
    }
  }
}

function init() {
  const maxDpr = Math.min(window.devicePixelRatio || 1, 1.5);
  let dpr = maxDpr;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: maxDpr < 1.5,
    powerPreference: 'default',
  });
  renderer.debug.checkShaderErrors = false;
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  scene.environment = bakeEnvironment(renderer);

  const system = new THREE.Group();
  scene.add(system);

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(1, 96, 64),
    new THREE.MeshStandardMaterial({ color: 0xe4e7f7, metalness: 1, roughness: 0.24, envMapIntensity: 1.35 })
  );
  system.add(core);

  const ringMat = new THREE.LineBasicMaterial({ color: 0xc8cbff, transparent: true, opacity: 0.22 });
  const orbits = [
    { r: 1.75, tilt: [1.2, 0, 0.32], speed: 0.22, sat: 0.06, color: 0xfddc3f, glow: 1.2 },
    { r: 2.35, tilt: [1.38, 0, -0.42], speed: -0.13, sat: 0.11, color: 0xe9ebf7, glow: 0 },
    { r: 3.05, tilt: [1.05, 0, 0.12], speed: 0.08, sat: 0.06, color: 0x8b8fff, glow: 1.2 },
  ].map((o, i) => {
    const pivot = new THREE.Group();
    pivot.rotation.set(o.tilt[0], o.tilt[1], o.tilt[2]);
    const pts = new THREE.EllipseCurve(0, 0, o.r, o.r, 0, Math.PI * 2).getPoints(160);
    const line = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), ringMat);
    pivot.add(line);
    const sat = new THREE.Mesh(
      new THREE.SphereGeometry(o.sat, 32, 24),
      new THREE.MeshStandardMaterial({
        color: o.color, metalness: 0.35, roughness: 0.35,
        emissive: o.color, emissiveIntensity: o.glow ? 0.35 * o.glow : 0,
      })
    );
    pivot.add(sat);
    system.add(pivot);
    return { ...o, pivot, sat, phase: i * 2.1 };
  });

  const stars = makeStars(420);
  scene.add(stars);

  scene.add(new THREE.AmbientLight(0x8890ff, 0.4));
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(-3, 4, 5);
  scene.add(key);

  /* Layout */
  let layout = { x: 1.6, y: 0.35, s: 1.15 };
  function resize() {
    const w = canvas.clientWidth || hero.clientWidth;
    const h = canvas.clientHeight || hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const aspect = w / h;
    if (aspect > 1.15) layout = { x: Math.min(2.6, 1.05 * aspect), y: 0.5, s: 0.98 };
    else if (aspect > 0.8) layout = { x: 0.9, y: 0.9, s: 0.95 };
    else layout = { x: 0.35, y: 1.3, s: 0.68 };
    if (!running) renderFrame(0);
  }

  /* Input */
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('pointermove', (e) => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  let scrollProgress = 0;
  const readScroll = () => {
    scrollProgress = Math.min(1, Math.max(0, window.scrollY / (hero.offsetHeight || 1)));
  };
  window.addEventListener('scroll', readScroll, { passive: true });
  readScroll();

  /* Loop */
  let running = false;
  let visible = true;
  let last = performance.now();
  let elapsed = 0;
  let frameSamples = [];

  function renderFrame(dt) {
    elapsed += dt;
    pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 2.5);
    pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 2.5);

    const sp = scrollProgress;
    system.position.set(layout.x, layout.y + sp * 1.4, 0);
    system.scale.setScalar(layout.s * (1 - sp * 0.18));
    system.rotation.x = -0.18 + pointer.y * 0.18;
    system.rotation.y = elapsed * 0.05 + pointer.x * 0.28;
    core.rotation.y = elapsed * 0.12;

    orbits.forEach((o) => {
      const a = o.phase + elapsed * o.speed;
      o.sat.position.set(Math.cos(a) * o.r, Math.sin(a) * o.r, 0);
      o.pivot.rotation.z = o.tilt[2] + elapsed * o.speed * 0.15;
    });
    stars.rotation.y = elapsed * 0.006 + pointer.x * 0.03;
    stars.rotation.x = pointer.y * 0.02;

    renderer.render(scene, camera);
  }

  function tick(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    renderFrame(dt);
    adaptQuality(dt);
    requestAnimationFrame(tick);
  }

  function adaptQuality(dt) {
    if (frameSamples === null) return;
    frameSamples.push(dt);
    if (frameSamples.length < 90) return;
    const avg = frameSamples.slice(15).reduce((a, b) => a + b, 0) / (frameSamples.length - 15);
    frameSamples = null;
    if (avg > 0.024 && dpr > 0.75) {
      dpr = Math.max(0.75, dpr * 0.66);
      renderer.setPixelRatio(dpr);
      resize();
    }
  }

  function start() {
    if (running || reduceMotion || !visible || document.hidden) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(tick);
  }
  function stop() { running = false; }

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    visible ? start() : stop();
  }, { threshold: 0.01 }).observe(hero);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  new ResizeObserver(resize).observe(hero);

  resize();
  renderFrame(0);
  hero.classList.add('is-3d');
  start();
}

function bakeEnvironment(renderer) {
  const env = new THREE.Scene();
  const domeGeo = new THREE.SphereGeometry(20, 48, 24);
  const top = new THREE.Color(0x2a2f63);
  const mid = new THREE.Color(0x0d1030);
  const bottom = new THREE.Color(0x05060f);
  const colors = [];
  const p = domeGeo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const t = p.getY(i) / 20;
    const c = t > 0 ? mid.clone().lerp(top, t) : mid.clone().lerp(bottom, -t);
    colors.push(c.r, c.g, c.b);
  }
  domeGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  env.add(new THREE.Mesh(domeGeo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  const panel = (w, h, color, strength, pos, look) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(strength), side: THREE.DoubleSide })
    );
    m.position.set(...pos);
    m.lookAt(...look);
    env.add(m);
  };
  panel(16, 12, 0x3d5aff, 1.6, [-10, 1, 3], [0, 0, 0]);
  panel(14, 14, 0x9b4dff, 1.4, [10, -2, -2], [0, 0, 0]);
  panel(18, 4, 0xffffff, 1.9, [0, 11, 3], [0, 0, 0]);
  panel(10, 3, 0xc9d0ff, 0.9, [0, -1, 12], [0, 0, 0]);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(env, 0.04).texture;
  pmrem.dispose();
  env.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
  return tex;
}

function makeStars(count) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const u = Math.random() * 2 - 1;
    const t = Math.random() * Math.PI * 2;
    const r = 18 + Math.random() * 14;
    const s = Math.sqrt(1 - u * u);
    pos[i * 3] = r * s * Math.cos(t);
    pos[i * 3 + 1] = r * u;
    pos[i * 3 + 2] = r * s * Math.sin(t) - 8;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0xdfe2ff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.55, depthWrite: false,
  }));
}
