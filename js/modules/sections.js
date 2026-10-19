/* About parallax + service "monitors" (3D tilt, rim light, entrance). */

export function initAbout(env) {
  const { gsap } = window;
  if (env.reducedMotion) return;
  const about = document.querySelector('.about');
  const mark = about.querySelector('[data-about-mark]');
  // the watermark mark drifts slower than the page and turns slightly: a parallax layer
  gsap.fromTo(mark, { yPercent: 18, rotate: -6 }, {
    yPercent: -22, rotate: 4, ease: 'none',
    scrollTrigger: { trigger: about, start: 'top bottom', end: 'bottom top', scrub: true },
  });
}

export function initServices(env) {
  const { gsap } = window;
  const cards = [...document.querySelectorAll('[data-service]')];

  // mini scenes only animate while on screen
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => e.target.classList.toggle('is-inview', e.isIntersecting));
  });
  cards.forEach((c) => io.observe(c));
  if (env.reducedMotion) return;

  gsap.from(cards, {
    y: 120,
    rotateX: -14,
    opacity: 0,
    transformOrigin: '50% 100%',
    duration: 1.4,
    ease: 'expo.out',
    stagger: 0.12,
    scrollTrigger: { trigger: '.services__grid', start: 'top 85%', once: true },
  });

  if (env.touch) return;
  cards.forEach((card) => {
    const tilt = (rotateX, rotateY) => gsap.to(card, { rotateX, rotateY, duration: 0.8, ease: 'power3', overwrite: 'auto' });
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
      tilt(-(y - 0.5) * 7, (x - 0.5) * 9);
    });
    card.addEventListener('pointerleave', () => tilt(0, 0));
  });
}
