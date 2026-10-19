/* ==========================================================================
   Work gallery in WebGL (three.js)
   One canvas draws every project thumbnail as a shader plane that tracks its
   DOM card. Effects: liquid ripple under the pointer, chromatic aberration and
   a page-bend driven by horizontal scroll speed, noise-dissolve reveal.
   The real <img> stays in the DOM (for SEO, accessibility and fallback).
   ========================================================================== */
import * as THREE from 'three';
import { galleryVertex, galleryFragment } from './shaders.js';

export class GalleryGL {
  constructor(canvas, host, env) {
    this.canvas = canvas;
    this.host = host;
    this.env = env;
    this.items = [];
    this.velocity = 0;
    this.targetVelocity = 0;
    this.time = 0;
    this.running = false;
    this.loader = new THREE.TextureLoader();
    this.tick = this.tick.bind(this);
  }

  init() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true, premultipliedAlpha: true });
    this.renderer.setClearColor(0x000000, 0);
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -100, 100);
    this.geometry = new THREE.PlaneGeometry(1, 1, 24, 16);
    this.resize();
    return this;
  }

  /** Register cards: each needs a .card__media element and an <img>. */
  async setCards(cards) {
    const loads = cards.map((card) => {
      const media = card.querySelector('.card__media');
      const img = media?.querySelector('img');
      if (!img) return null;
      const material = new THREE.ShaderMaterial({
        vertexShader: galleryVertex,
        fragmentShader: galleryFragment,
        transparent: true,
        uniforms: {
          uTex: { value: null },
          uPlane: { value: new THREE.Vector2(1, 1) },
          uImage: { value: new THREE.Vector2(16, 10) },
          uHover: { value: 0 },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uVelocity: { value: 0 },
          uTime: { value: 0 },
          uReveal: { value: 0 },
          uOpacity: { value: 1 },
          uRadius: { value: 16 },
        },
      });
      const mesh = new THREE.Mesh(this.geometry, material);
      mesh.visible = false;
      this.scene.add(mesh);
      const item = { card, media, mesh, material, hover: 0, hoverTarget: 0, revealed: false, ready: false };
      this.items.push(item);

      const link = card.querySelector('a');
      link?.addEventListener('pointerenter', () => { item.hoverTarget = 1; });
      link?.addEventListener('pointerleave', () => { item.hoverTarget = 0; });
      link?.addEventListener('focus', () => { item.hoverTarget = 1; });
      link?.addEventListener('blur', () => { item.hoverTarget = 0; });
      media.addEventListener('pointermove', (e) => {
        const r = media.getBoundingClientRect();
        material.uniforms.uMouse.value.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
      });

      return new Promise((resolve) => {
        this.loader.load(img.currentSrc || img.src, (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.minFilter = THREE.LinearFilter;
          tex.generateMipmaps = false;
          material.uniforms.uTex.value = tex;
          material.uniforms.uImage.value.set(tex.image.width, tex.image.height);
          item.ready = true;
          resolve();
        }, undefined, () => resolve());
      });
    });
    await Promise.all(loads);
  }

  setVelocity(v) { this.targetVelocity = v; }

  resize() {
    const r = this.host.getBoundingClientRect();
    this.size = { w: r.width, h: r.height };
    this.renderer.setPixelRatio(this.env.dpr);
    this.renderer.setSize(r.width, r.height, false);
    Object.assign(this.camera, { left: -r.width / 2, right: r.width / 2, top: r.height / 2, bottom: -r.height / 2 });
    this.camera.updateProjectionMatrix();
  }

  start() { if (!this.running) { this.running = true; window.gsap.ticker.add(this.tick); } }
  stop() { if (this.running) { this.running = false; window.gsap.ticker.remove(this.tick); } }

  tick(time, deltaMs) {
    const dt = Math.min(deltaMs / 1000, 0.05);
    this.time += dt;
    const k = 1 - Math.pow(0.002, dt);
    this.velocity += (this.targetVelocity - this.velocity) * k;
    this.targetVelocity *= 0.9;

    const host = this.host.getBoundingClientRect();
    const { w, h } = this.size;
    for (const it of this.items) {
      const r = it.media.getBoundingClientRect();
      const onScreen = r.width > 0 && r.right > host.left - 50 && r.left < host.right + 50;
      it.mesh.visible = it.ready && onScreen;
      if (!it.mesh.visible) continue;

      // reveal each plane the first time it scrolls into view
      if (!it.revealed && r.left < host.right - r.width * 0.15) {
        it.revealed = true;
        window.gsap.to(it.material.uniforms.uReveal, { value: 1, duration: 1.6, ease: 'power2.out' });
      }
      it.hover += (it.hoverTarget - it.hover) * (1 - Math.pow(0.004, dt));
      const u = it.material.uniforms;
      u.uHover.value = it.hover;
      u.uTime.value = this.time;
      u.uVelocity.value = this.velocity;
      u.uOpacity.value = parseFloat(getComputedStyle(it.card).opacity) || 0;
      u.uPlane.value.set(r.width, r.height);
      it.mesh.scale.set(r.width, r.height, 1);
      it.mesh.position.set(r.left - host.left + r.width / 2 - w / 2, h / 2 - (r.top - host.top + r.height / 2), 0);
    }
    this.renderer.render(this.scene, this.camera);
  }
}
