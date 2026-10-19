/* Device & preference detection, decided once at startup. */

const mq = (q) => window.matchMedia(q).matches;

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch (e) {
    return false;
  }
}

export const env = {
  reducedMotion: mq('(prefers-reduced-motion: reduce)'),
  touch: mq('(hover: none), (pointer: coarse)'),
  webgl: hasWebGL(),
  // "small" = phones and small tablets: lighter 3D, no pinned sections
  get small() { return window.innerWidth < 900; },
  // weaker devices get fewer particles and a lower pixel ratio
  lowPower: (navigator.hardwareConcurrency || 8) <= 4 || mq('(max-width: 899px)'),
  get dpr() { return Math.min(window.devicePixelRatio || 1, this.lowPower ? 1.5 : 2); },
};

const root = document.documentElement;
root.classList.toggle('is-touch', env.touch);
root.classList.toggle('has-cursor', !env.touch && !env.reducedMotion);
root.classList.toggle('no-webgl', !env.webgl);
root.classList.toggle('reduced-motion', env.reducedMotion);
