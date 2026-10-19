/* ==========================================================================
   Preloader — the circle variant of the logo.
   The outer ring is the loading bar, a blue satellite rides its tip, the count
   climbs to 100. On exit the whole screen collapses into the logo's orbit dot,
   and the hero particles burst out of that exact point.
   ========================================================================== */
import { MARK } from '../gl/mark-geometry.js';

export class Preloader {
  constructor(el, env) {
    this.el = el;
    this.env = env;
    this.tasks = [];
    this.done = 0;
    this.total = 0;
    this.shown = 0;
    this.start = performance.now();
    this.minTime = env.reducedMotion ? 300 : 1900; // never flash, never drag
    this.count = el.querySelector('[data-preloader-count]');
    this.ring = el.querySelector('.pl-ring');
    this.sat = el.querySelector('.pl-sat');
    this.dot = el.querySelector('.mk-dot');
    this.letters = el.querySelector('.mk-da');
    this.arc = el.querySelector('.mk-arc');
    this.update = this.update.bind(this);
    this.enter();
  }

  enter() {
    const { gsap } = window;
    gsap.set(this.ring, { drawSVG: '0% 0%' });
    if (this.env.reducedMotion) return;
    gsap.from(this.letters, { opacity: 0, scale: 0.94, transformOrigin: '50% 50%', duration: 1.2, ease: 'expo.out' });
    gsap.from(this.arc, { drawSVG: '50% 50%', duration: 1.4, ease: 'expo.inOut', delay: 0.15 });
    gsap.from(this.dot, { scale: 0, transformOrigin: '50% 50%', duration: 0.8, ease: 'back.out(3)', delay: 0.7 });
  }

  /** Add something the page should wait for. Failures still count as done. */
  track(promise, weight = 1) {
    this.total += weight;
    Promise.resolve(promise).catch(() => {}).finally(() => { this.done += weight; });
    return promise;
  }

  /** Resolves once everything is loaded and the counter has reached 100. */
  complete() {
    const { gsap } = window;
    return new Promise((resolve) => {
      this.resolve = resolve;
      gsap.ticker.add(this.update);
    });
  }

  update() {
    const elapsed = performance.now() - this.start;
    const real = this.total ? this.done / this.total : 1;
    const timeCap = Math.min(1, elapsed / this.minTime);
    const target = Math.min(real, timeCap);
    this.shown += (target - this.shown) * (target >= 1 ? 0.14 : 0.07);
    if (target >= 1 && this.shown > 0.996) this.shown = 1;

    const pct = Math.round(this.shown * 100);
    this.count.textContent = String(pct).padStart(3, '0');
    window.gsap.set(this.ring, { drawSVG: `0% ${this.shown * 100}%` });
    const { cx, cy, r } = MARK.ring;
    const a = -Math.PI / 2 + this.shown * Math.PI * 2;
    this.sat.setAttribute('cx', cx + Math.cos(a) * r);
    this.sat.setAttribute('cy', cy + Math.sin(a) * r);

    if (this.shown === 1) {
      window.gsap.ticker.remove(this.update);
      this.resolve?.();
    }
  }

  /** Exit: collapse into the orbit dot. onCollapse(point) fires as the hero should start. */
  exit({ onCollapse } = {}) {
    const { gsap } = window;
    const root = document.documentElement;
    const finish = () => {
      root.classList.remove('is-loading');
      root.classList.add('is-ready');
      this.el.remove();
    };

    const d = this.dot.getBoundingClientRect();
    const point = { x: d.left + d.width / 2, y: d.top + d.height / 2 };

    if (this.env.reducedMotion) {
      onCollapse?.(point);
      return new Promise((resolve) => gsap.to(this.el, { opacity: 0, duration: 0.3, onComplete: () => { finish(); resolve(); } }));
    }

    return new Promise((resolve) => {
      const tl = gsap.timeline({ onComplete: () => { finish(); resolve(); } });
      tl.to([this.count, this.el.querySelector('.preloader__tag')], { yPercent: 40, opacity: 0, duration: 0.5, ease: 'power3.in' })
        .to(this.sat, { opacity: 0, duration: 0.3 }, 0)
        .to(this.ring, { drawSVG: '100% 100%', duration: 0.7, ease: 'expo.inOut' }, 0.05)
        .to(this.letters, { opacity: 0, scale: 0.9, transformOrigin: '50% 50%', duration: 0.6, ease: 'expo.in' }, 0.1)
        .to(this.arc, { drawSVG: '50% 50%', duration: 0.6, ease: 'expo.in' }, 0.1)
        .to(this.dot, { scale: 1.6, transformOrigin: '50% 50%', duration: 0.5, ease: 'power2.inOut' }, 0.3)
        .fromTo(this.el,
          { clipPath: `circle(150% at ${point.x}px ${point.y}px)` },
          { clipPath: `circle(0% at ${point.x}px ${point.y}px)`, duration: 1.15, ease: 'expo.inOut' }, 0.55)
        .add(() => onCollapse?.(point), 0.95);
    });
  }
}
