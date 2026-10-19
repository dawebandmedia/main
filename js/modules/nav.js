/* Navigation: hides on scroll down, returns on scroll up, marks the current
   section, scrambles link text on hover, and runs the mobile menu. */
import { scrollTo, stopScroll, startScroll } from '../core/scroll.js';

export function initNav(env) {
  const { gsap, ScrollTrigger } = window;
  const nav = document.querySelector('[data-nav]');
  const links = [...document.querySelectorAll('.nav__links a')];

  // hide on the way down, show on the way up
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate(self) {
      const down = self.direction === 1 && self.scroll() > window.innerHeight * 0.5;
      nav.classList.toggle('is-hidden', down && !document.documentElement.classList.contains('menu-open'));
    },
  });

  // current section
  links.forEach((a) => {
    const section = document.querySelector(a.getAttribute('href'));
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => a.classList.toggle('is-current', self.isActive),
    });
  });

  // scramble on hover
  if (!env.reducedMotion) {
    document.querySelectorAll('[data-scramble-hover]').forEach((el) => {
      const text = el.textContent;
      el.addEventListener('mouseenter', () => {
        gsap.to(el, { duration: 0.6, scrambleText: { text, chars: 'lowerCase', speed: 0.9, revealDelay: 0.1 }, overwrite: true });
      });
    });
  }

  // mobile menu
  const btn = document.querySelector('[data-menu-btn]');
  const menu = document.querySelector('[data-menu]');
  const label = btn.querySelector('.nav__menu-label');
  let open = false;
  const setOpen = (v) => {
    open = v;
    btn.setAttribute('aria-expanded', String(v));
    label.textContent = v ? 'Close' : 'Menu';
    document.documentElement.classList.toggle('menu-open', v);
    if (v) {
      menu.hidden = false;
      stopScroll();
      if (!env.reducedMotion) {
        gsap.fromTo(menu, { clipPath: 'circle(0% at 92% 4%)' }, { clipPath: 'circle(150% at 92% 4%)', duration: 0.9, ease: 'expo.inOut' });
        gsap.fromTo(menu.querySelectorAll('nav a'), { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.06, duration: 0.9, ease: 'expo.out', delay: 0.25 });
      }
      menu.querySelector('a')?.focus({ preventScroll: true });
    } else {
      startScroll();
      if (env.reducedMotion) { menu.hidden = true; return; }
      gsap.to(menu, { clipPath: 'circle(0% at 92% 4%)', duration: 0.7, ease: 'expo.inOut', onComplete: () => { menu.hidden = true; } });
    }
  };
  btn.addEventListener('click', () => setOpen(!open));
  menu.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
    const target = document.querySelector(a.getAttribute('href'));
    if (target) setTimeout(() => scrollTo(target), 300);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) { setOpen(false); btn.focus(); } });
}
