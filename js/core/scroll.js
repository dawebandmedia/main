/* Smooth scrolling (Lenis) wired into GSAP's ticker and ScrollTrigger. */
import Lenis from '../../vendor/lenis/lenis.mjs';
import { env } from './env.js';

let lenis = null;

export function initScroll() {
  const { gsap, ScrollTrigger } = window;

  if (!env.reducedMotion) {
    lenis = new Lenis({
      lerp: 0.085,           // lower = smoother/heavier
      wheelMultiplier: 1,
      smoothWheel: true,
      syncTouch: false,      // native momentum on phones feels best
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop(); // paused until the preloader finishes
  }

  // In-page links (#work, #contact…) scroll smoothly and update focus for keyboard users
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id.length < 2 || id.startsWith('#/')) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    scrollTo(target);
    history.replaceState(null, '', id === '#top' ? location.pathname + location.search : id);
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

  return lenis;
}

export function scrollTo(target, opts = {}) {
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4), ...opts });
  } else if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: env.reducedMotion ? 'auto' : 'smooth' });
  } else {
    target.scrollIntoView({ behavior: env.reducedMotion ? 'auto' : 'smooth' });
  }
}

export const stopScroll = () => {
  lenis?.stop();
  document.documentElement.style.overflow = 'hidden';
};
export const startScroll = () => {
  document.documentElement.style.overflow = '';
  lenis?.start();
};
export const getLenis = () => lenis;
