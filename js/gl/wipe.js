/* ==========================================================================
   Shader wipe for opening/closing projects (raw WebGL, no three.js needed)
   cover():  a noisy circle of blue-into-night bursts out from the click point
   reveal(): a hole opens from a point, uncovering the new view
   Falls back to a simple fade when WebGL or motion is unavailable.
   ========================================================================== */
import { wipeVertex, wipeFragment } from './shaders.js';

export class Wipe {
  constructor(canvas, env) {
    this.canvas = canvas;
    this.env = env;
    this.time = 0;
    this.ok = false;
    if (env.webgl && !env.reducedMotion) this.ok = this.setup();
    window.addEventListener('resize', () => this.resize());
  }

  setup() {
    const gl = this.canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return false;
    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, wipeVertex);
    const fs = compile(gl.FRAGMENT_SHADER, wipeFragment);
    if (!vs || !fs) return false;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    this.gl = gl;
    this.u = {};
    ['uRes', 'uOrigin', 'uProgress', 'uPhase', 'uTime'].forEach((n) => { this.u[n] = gl.getUniformLocation(prog, n); });
    this.resize();
    return true;
  }

  resize() {
    if (!this.gl) return;
    const pr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.canvas.width = Math.round(window.innerWidth * pr);
    this.canvas.height = Math.round(window.innerHeight * pr);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  draw(progress, phase, origin) {
    const { gl, u } = this;
    this.time += 0.016;
    gl.uniform2f(u.uRes, this.canvas.width, this.canvas.height);
    gl.uniform2f(u.uOrigin, origin.x / window.innerWidth, 1 - origin.y / window.innerHeight);
    gl.uniform1f(u.uProgress, progress);
    gl.uniform1f(u.uPhase, phase);
    gl.uniform1f(u.uTime, this.time);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  run(phase, origin, duration, ease) {
    const { gsap } = window;
    const o = origin || { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    if (!this.ok) return this.fallback(phase, duration);
    this.canvas.classList.add('is-active');
    const state = { p: 0 };
    return new Promise((resolve) => {
      gsap.to(state, {
        p: 1,
        duration,
        ease,
        onUpdate: () => this.draw(state.p, phase, o),
        onComplete: () => {
          if (phase === 1) {
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            this.canvas.classList.remove('is-active');
          }
          resolve();
        },
      });
    });
  }

  cover(origin) { return this.run(0, origin, this.env.small ? 0.7 : 0.85, 'power3.inOut'); }
  reveal(origin) { return this.run(1, origin, this.env.small ? 0.8 : 1.0, 'power3.inOut'); }

  /* calm fallback: a solid layer fades in / out */
  fallback(phase, duration) {
    const { gsap } = window;
    if (!this.layer) {
      this.layer = document.createElement('div');
      this.layer.className = 'wipe-fallback';
      this.layer.style.opacity = '0';
      this.layer.style.background = 'var(--night)';
      document.body.appendChild(this.layer);
    }
    const d = this.env.reducedMotion ? 0.2 : duration * 0.6;
    return new Promise((resolve) => {
      gsap.to(this.layer, { opacity: phase === 0 ? 1 : 0, duration: d, ease: 'power1.inOut', onComplete: resolve });
    });
  }
}
