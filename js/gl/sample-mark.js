/* Turn the vector logo into point clouds.
   Letters are rasterised with Path2D and sampled; the arc, dot and ring are generated
   from their geometry so they stay perfectly smooth. Coordinates are returned in
   "mark units" (SVG units of assets/brand/da-mark.svg). */
import { MARK } from './mark-geometry.js';

/** Random points inside the D and A letterforms. */
export function sampleLetters(count, resolution = 1) {
  const w = Math.ceil(MARK.width * resolution);
  const h = Math.ceil(MARK.height * resolution);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.scale(resolution, resolution);
  ctx.fillStyle = '#fff';
  ctx.fill(new Path2D(MARK.d), 'evenodd');
  ctx.fill(new Path2D(MARK.a), 'evenodd');
  const data = ctx.getImageData(0, 0, w, h).data;

  const pts = new Float32Array(count * 2);
  let n = 0;
  let guard = 0;
  while (n < count && guard < count * 60) {
    guard++;
    const x = Math.random() * w;
    const y = Math.random() * h;
    if (data[((y | 0) * w + (x | 0)) * 4 + 3] > 127) {
      pts[n * 2] = x / resolution;
      pts[n * 2 + 1] = y / resolution;
      n++;
    }
  }
  return pts.subarray(0, n * 2);
}

/** Points along the orbit arc; t (0..1) is the position along it. */
export function sampleArc(count, thickness = 3) {
  const { cx, cy, r, start, end } = MARK.arc;
  const a0 = (start * Math.PI) / 180;
  const a1 = (end * Math.PI) / 180;
  const pts = [];
  for (let i = 0; i < count; i++) {
    const t = Math.random();
    const a = a0 + (a1 - a0) * t;
    const rr = r + (Math.random() - 0.5) * thickness;
    pts.push({ x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr, t });
  }
  return pts;
}

/** Points filling the satellite dot (plus a few big soft "halo" points). */
export function sampleDot(count, halo = 0) {
  const { cx, cy, r } = MARK.dot;
  const pts = [];
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const rr = Math.sqrt(Math.random()) * r;
    pts.push({ x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr, halo: false });
  }
  for (let i = 0; i < halo; i++) {
    const a = Math.random() * Math.PI * 2;
    const rr = Math.random() * r * 1.6;
    pts.push({ x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr, halo: true });
  }
  return pts;
}
