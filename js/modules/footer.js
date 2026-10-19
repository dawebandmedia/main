/* ==========================================================================
   Footer finale: the DA mark assembles from particles (2D canvas, light on
   any device). Move the pointer through it and the particles scatter and
   spring back. The satellite dot, which only ever rode a short arc in the
   logo, finally completes its full orbit.
   ========================================================================== */
import { MARK } from '../gl/mark-geometry.js';
import { sampleLetters, sampleArc, sampleDot } from '../gl/sample-mark.js';
import { scrollTo } from '../core/scroll.js';
import { debounce, whenVisible } from '../core/utils.js';

export function initFooter(env) {
  document.querySelector('[data-to-top]')?.addEventListener('click', () => scrollTo(0, { duration: 2.2 }));

  const canvas = document.querySelector('[data-footer-canvas]');
  const stage = canvas.parentElement;
  const ctx = canvas.getContext('2d');
  const small = env.small;

  // sample the mark once, in mark units
  const pts = [];
  const L = sampleLetters(small ? 1100 : 2400, 0.6);
  for (let i = 0; i < L.length; i += 2) pts.push({ mx: L[i], my: L[i + 1], type: 0 });
  sampleArc(small ? 180 : 360, 3).forEach((p) => pts.push({ mx: p.x, my: p.y, type: 1, t: p.t }));
  sampleDot(small ? 40 : 80).forEach((p) => pts.push({ mx: p.x, my: p.y, type: 2 }));
  pts.forEach((p) => {
    p.x = 0; p.y = 0; p.vx = 0; p.vy = 0;
    p.s = p.type === 0 ? 1.2 + Math.random() * 1.3 : 1.1 + Math.random();
    p.k = 0.018 + Math.random() * 0.03; // spring stiffness: varies so the mark assembles in waves
  });

  let W = 0; let H = 0; let scale = 1; let ox = 0; let oy = 0;
  const pr = Math.min(window.devicePixelRatio || 1, 2);
  const mouse = { x: -9999, y: -9999 };
  let assembled = false;
  let running = false;
  let t = 0;

  function layout() {
    const r = stage.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = Math.round(W * pr);
    canvas.height = Math.round(H * pr);
    ctx.setTransform(pr, 0, 0, pr, 0, 0);
    scale = Math.min((W * 0.62) / MARK.width, (H * 0.62) / MARK.height);
    ox = (W - MARK.width * scale) / 2 + MARK.width * scale * 0.04;
    oy = (H - MARK.height * scale) / 2 - H * 0.04;
    pts.forEach((p) => { p.hx = ox + p.mx * scale; p.hy = oy + p.my * scale; });
    if (!assembled || env.reducedMotion) pts.forEach((p) => { p.x = p.hx; p.y = p.hy; });
    if (!running) draw();
  }

  function scatter() {
    pts.forEach((p) => {
      const a = Math.random() * Math.PI * 2;
      const d = Math.max(W, H) * (0.4 + Math.random() * 0.6);
      p.x = W / 2 + Math.cos(a) * d;
      p.y = H / 2 + Math.sin(a) * d;
      p.vx = p.vy = 0;
    });
  }

  function step() {
    const R = Math.max(70, scale * 140);
    for (const p of pts) {
      let ax = (p.hx - p.x) * p.k;
      let ay = (p.hy - p.y) * p.k;
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < R * R) {
        const d = Math.sqrt(d2) || 1;
        const f = (1 - d / R) ** 2 * 7;
        ax += (dx / d) * f;
        ay += (dy / d) * f;
      }
      p.vx = (p.vx + ax) * 0.86;
      p.vy = (p.vy + ay) * 0.86;
      p.x += p.vx;
      p.y += p.vy;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    // faint full orbit: the path the dot now completes
    const { cx, cy, r } = MARK.arc;
    const ocx = ox + cx * scale; const ocy = oy + cy * scale; const or = r * scale;
    ctx.strokeStyle = 'rgba(239,235,227,0.08)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 6]);
    ctx.beginPath(); ctx.arc(ocx, ocy, or, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);

    for (const p of pts) {
      ctx.fillStyle = p.type === 0 ? 'rgba(239,235,227,0.92)' : p.type === 1 ? 'rgba(169,198,255,0.85)' : 'rgba(239,235,227,0.95)';
      ctx.fillRect(p.x, p.y, p.s, p.s);
    }

    // the satellite, now orbiting all the way round
    const a = env.reducedMotion ? 0 : t * 0.5;
    const sx = ocx + Math.cos(a) * or;
    const sy = ocy + Math.sin(a) * or;
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 26);
    g.addColorStop(0, 'rgba(61,123,255,0.9)');
    g.addColorStop(1, 'rgba(61,123,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(sx, sy, 26, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#EFEBE3';
    ctx.beginPath(); ctx.arc(sx, sy, Math.max(3, MARK.dot.r * scale * 0.45), 0, Math.PI * 2); ctx.fill();
  }

  function frame(time, dt) {
    t += Math.min(dt, 50) / 1000;
    // physics runs at a steady 60 steps/s even if the screen refreshes slower
    const steps = Math.max(1, Math.min(3, Math.round(dt / 16.7)));
    for (let i = 0; i < steps; i++) step();
    draw();
  }

  const start = () => { if (!running) { running = true; window.gsap.ticker.add(frame); } };
  const stop = () => { if (running) { running = false; window.gsap.ticker.remove(frame); } };

  stage.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  stage.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
  window.addEventListener('resize', debounce(layout, 150));

  layout();
  if (env.reducedMotion) { draw(); return; }

  whenVisible(stage, (visible) => {
    if (visible && !assembled) { assembled = true; scatter(); }
    if (visible) start(); else stop();
  });
}
