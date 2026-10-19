/* ==========================================================================
   Hero 3D scene (three.js)
   Your DA + orbit mark rebuilt from ~14k particles, inside a tilted orbit ring.
   - pointer: particles part around the cursor, the whole mark tilts toward it
   - intro:   particles burst out of the preloader's dot and assemble
   - scroll:  the orbit flattens into a timeline that rides the top edge of the
              next section; the satellite dot becomes the playhead
   ========================================================================== */
import * as THREE from 'three';
import { MARK } from './mark-geometry.js';
import { sampleLetters, sampleArc, sampleDot } from './sample-mark.js';
import { heroVertex, heroFragment, bgVertex, bgFragment } from './shaders.js';

const MARK_WORLD_WIDTH = 3.4; // the mark is built 3.4 units wide, then scaled to the screen

export class HeroScene {
  constructor(canvas, env) {
    this.canvas = canvas;
    this.env = env;
    this.pointer = { x: 0, y: 0, tx: 0, ty: 0, strength: 0, target: 0 };
    this.morph = 0;
    this.lineScreenY = window.innerHeight * 0.9;
    this.running = false;
    this.time = 0;
    this.tick = this.tick.bind(this);
  }

  init() {
    const { env } = this;
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0x0a0c11, 1);
    this.renderer.autoClear = false;

    this.camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    this.camera.position.set(0, 0, 7.5);
    this.scene = new THREE.Scene();
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Background quad (own scene, drawn first)
    this.bgScene = new THREE.Scene();
    this.bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.bgMaterial = new THREE.ShaderMaterial({
      vertexShader: bgVertex,
      fragmentShader: bgFragment,
      uniforms: { uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uMouse: { value: new THREE.Vector2(0.7, 0.5) }, uMorph: { value: 0 } },
      depthWrite: false,
      depthTest: false,
    });
    this.bgScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.bgMaterial));

    this.buildParticles(env.lowPower ? 0.45 : 1);
    this.resize();
    return this;
  }

  buildParticles(q) {
    const s = MARK_WORLD_WIDTH / MARK.width;
    const cx = MARK.width / 2;
    const cy = MARK.height / 2;
    const toLocal = (x, y) => [(x - cx) * s, -(y - cy) * s];

    const letters = sampleLetters(Math.round(9000 * q), 1);
    const arc = sampleArc(Math.round(1400 * q), 4);
    const dot = sampleDot(Math.round(320 * q), 14);
    const ringCount = Math.round(2600 * q);
    const dustCount = Math.round(700 * q);
    const total = letters.length / 2 + arc.length + dot.length + ringCount + dustCount;

    const pos = new Float32Array(total * 3);
    const rnd = new Float32Array(total * 3);
    const type = new Float32Array(total);
    const scale = new Float32Array(total);
    const angle = new Float32Array(total);
    let i = 0;
    const put = (x, y, z, t, sc, an) => {
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      rnd[i * 3] = Math.random(); rnd[i * 3 + 1] = Math.random(); rnd[i * 3 + 2] = Math.random();
      type[i] = t; scale[i] = sc; angle[i] = an;
      i++;
    };

    for (let k = 0; k < letters.length; k += 2) {
      const [x, y] = toLocal(letters[k], letters[k + 1]);
      // two faces + a little volume, so the letters read as solid when tilted
      const z = (Math.random() < 0.5 ? -1 : 1) * 0.06 + (Math.random() - 0.5) * 0.05;
      put(x, y, z, 0, 0.7 + Math.random() * 0.7, 0);
    }
    for (const p of arc) {
      const [x, y] = toLocal(p.x, p.y);
      put(x, y, (Math.random() - 0.5) * 0.02, 1, 0.8 + Math.random() * 0.6, p.t);
    }
    for (const p of dot) {
      const [x, y] = toLocal(p.x, p.y);
      put(x, y, 0.05, 2, p.halo ? 10 + Math.random() * 10 : 1 + Math.random() * 0.8, 0);
    }
    const ringR = 2.35;
    for (let k = 0; k < ringCount; k++) {
      const r = ringR + (Math.random() - 0.5) * 0.08 + (Math.random() < 0.08 ? (Math.random() - 0.5) * 0.5 : 0);
      put(r, (Math.random() - 0.5) * 0.03, 0, 3, 0.5 + Math.random() * 0.9, Math.random() * Math.PI * 2);
    }
    for (let k = 0; k < dustCount; k++) {
      put((Math.random() - 0.5) * 9, (Math.random() - 0.5) * 5.5, -Math.random() * 3 + 0.8, 4, 0.5 + Math.random() * 1.2, 0);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aRandom', new THREE.BufferAttribute(rnd, 3));
    geo.setAttribute('aType', new THREE.BufferAttribute(type, 1));
    geo.setAttribute('aScale', new THREE.BufferAttribute(scale, 1));
    geo.setAttribute('aAngle', new THREE.BufferAttribute(angle, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50);

    const [ringX, ringY] = toLocal(MARK.arc.cx - MARK.arc.r * 0.35, MARK.arc.cy);
    this.material = new THREE.ShaderMaterial({
      vertexShader: heroVertex,
      fragmentShader: heroFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uIntro: { value: this.env.reducedMotion ? 1 : 0 },
        uMorph: { value: 0 },
        uMouse: { value: new THREE.Vector3(9, 9, 0) },
        uLineY: { value: -2 },
        uLineHalfW: { value: 4 },
        uPlayX: { value: 0 },
        uBurst: { value: new THREE.Vector3(0, 0, 0) },
        uRing: { value: new THREE.Vector2(ringX, ringY) },
        uSize: { value: 2.6 },
        uPR: { value: 1 },
        uCream: { value: new THREE.Color('#EFEBE3') },
        uIce: { value: new THREE.Color('#A9C6FF') },
        uBlue: { value: new THREE.Color('#3D7BFF') },
      },
    });
    this.points = new THREE.Points(geo, this.material);
    this.group.add(this.points);
  }

  /* --- layout: keep the mark on the right on desktop, above the title on phones --- */
  resize() {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    const pr = this.env.dpr;
    this.renderer.setPixelRatio(pr);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    const vh = 2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * this.camera.position.z;
    const vw = vh * this.camera.aspect;
    this.view = { w, h, vw, vh };
    const markH = MARK_WORLD_WIDTH * (MARK.height / MARK.width);

    if (w / h > 1.05) {
      this.scale = Math.min((vw * 0.43) / MARK_WORLD_WIDTH, (vh * 0.54) / markH);
      this.base = { x: vw * 0.215, y: vh * 0.07 };
    } else {
      this.scale = Math.min((vw * 0.74) / MARK_WORLD_WIDTH, (vh * 0.3) / markH);
      this.base = { x: vw * 0.02, y: vh * 0.2 };
    }
    this.group.scale.setScalar(this.scale);
    this.group.position.set(this.base.x, this.base.y, 0);

    const u = this.material.uniforms;
    u.uPR.value = pr;
    u.uSize.value = (w < 700 ? 2.2 : 2.6) * Math.max(0.8, Math.min(1.25, w / 1440));
    u.uLineHalfW.value = (vw * 0.5) / this.scale;
    this.bgMaterial.uniforms.uRes.value.set(w, h);
    if (!this.running) this.render();
  }

  /* screen px -> mark-local coordinates at z = 0 */
  screenToLocal(x, y) {
    const { vw, vh, w, h } = this.view;
    const wx = (x / w - 0.5) * vw;
    const wy = (0.5 - y / h) * vh;
    return [(wx - this.group.position.x) / this.scale, (wy - this.group.position.y) / this.scale];
  }

  setPointer(clientX, clientY, active = true) {
    this.pointer.tx = (clientX / this.view.w) * 2 - 1;
    this.pointer.ty = -((clientY / this.view.h) * 2 - 1);
    this.pointer.target = active ? 1 : 0;
    this.pointerPx = [clientX, clientY];
  }
  leavePointer() { this.pointer.target = 0; }

  setMorph(v) { this.morph = v; }
  setLineScreenY(y) { this.lineScreenY = y; }

  /** Particles burst out of a screen point (the preloader's dot) and assemble. */
  intro(origin, gsap) {
    const [lx, ly] = this.screenToLocal(origin?.x ?? this.view.w * 0.66, origin?.y ?? this.view.h * 0.45);
    this.material.uniforms.uBurst.value.set(lx, ly, 0);
    if (this.env.reducedMotion) { this.material.uniforms.uIntro.value = 1; this.render(); return; }
    gsap.fromTo(this.material.uniforms.uIntro, { value: 0 }, { value: 1, duration: 3.2, ease: 'power2.out' });
  }

  start() { if (!this.running) { this.running = true; window.gsap.ticker.add(this.tick); } }
  stop() { if (this.running) { this.running = false; window.gsap.ticker.remove(this.tick); } }

  tick(time, deltaMs) {
    const dt = Math.min(deltaMs / 1000, 0.05);
    this.time += dt;
    const u = this.material.uniforms;
    const p = this.pointer;
    const k = 1 - Math.pow(0.0015, dt); // frame-rate independent smoothing
    p.x += (p.tx - p.x) * k;
    p.y += (p.ty - p.y) * k;
    p.strength += (p.target - p.strength) * k;

    const m = this.morph;
    u.uTime.value = this.time;
    u.uMorph.value = m;

    // tilt toward the pointer + a slow idle sway; flattens as the orbit becomes a line
    const settle = 1 - m;
    this.group.rotation.y = (p.x * 0.32 + Math.sin(this.time * 0.25) * 0.06) * settle;
    this.group.rotation.x = (-p.y * 0.18 + Math.cos(this.time * 0.2) * 0.03) * settle;

    if (this.pointerPx) {
      const [lx, ly] = this.screenToLocal(this.pointerPx[0], this.pointerPx[1]);
      u.uMouse.value.set(lx, ly, p.strength * settle);
    }
    const [, lineY] = this.screenToLocal(0, this.lineScreenY);
    u.uLineY.value = lineY;
    const [playX] = this.screenToLocal(this.view.w * (0.08 + m * 0.84), 0);
    u.uPlayX.value = playX;

    const bg = this.bgMaterial.uniforms;
    bg.uTime.value = this.time;
    bg.uMorph.value = m;
    bg.uMouse.value.set((p.x + 1) / 2, (p.y + 1) / 2);
    this.render();
  }

  render() {
    this.renderer.clear();
    this.renderer.render(this.bgScene, this.bgCamera);
    this.renderer.render(this.scene, this.camera);
  }
}
