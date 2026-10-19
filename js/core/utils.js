/* Small helpers shared across modules. */

export const qs = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

export const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const map = (v, a, b, c, d) => c + ((v - a) / (b - a)) * (d - c);

/** Escape text before putting it into HTML. */
export function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function debounce(fn, wait = 150) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

/** Resolves when an image has loaded (or failed — never rejects, so loading never stalls). */
export function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Format seconds as a video timecode HH:MM:SS:FF (24 fps). */
export function timecode(seconds, withFrames = true) {
  const s = Math.max(0, seconds);
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = Math.floor(s % 60);
  const ff = Math.floor((s % 1) * 24);
  const p = (n) => String(n).padStart(2, '0');
  return withFrames ? `${p(hh)}:${p(mm)}:${p(ss)}:${p(ff)}` : `${p(hh)}:${p(mm)}:${p(ss)}`;
}

/** Run a callback while an element is on screen; returns a disconnect function. */
export function whenVisible(el, onChange, rootMargin = '0px') {
  const io = new IntersectionObserver(([entry]) => onChange(entry.isIntersecting), { rootMargin });
  io.observe(el);
  return () => io.disconnect();
}
