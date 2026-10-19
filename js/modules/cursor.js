/* ==========================================================================
   Custom cursor: the orbit dot + a ring that trails it.
   Elements opt in to states with data attributes:
     data-cursor="link"   ring grows (buttons, links)
     data-cursor="view"   ring becomes a blue disc with a label (projects)
     data-cursor="hide"   cursor hides (e.g. over video)
     data-cursor-label="Open"  changes the label text
   Magnetic buttons (data-magnetic) lean toward the pointer, their
   data-magnetic-inner child leans further. Buttons get a click ripple.
   ========================================================================== */

export function initCursor(env) {
  const { gsap } = window;
  const el = document.querySelector('.cursor');
  if (!el || env.touch || env.reducedMotion) return;

  const dot = el.querySelector('.cursor__dot');
  const ring = el.querySelector('.cursor__ring');
  const label = el.querySelector('[data-cursor-label]');
  const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' });
  const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });
  const ringX = gsap.quickTo(ring, 'x', { duration: 0.55, ease: 'power3' });
  const ringY = gsap.quickTo(ring, 'y', { duration: 0.55, ease: 'power3' });
  gsap.set([dot, ring], { x: -100, y: -100 });

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    dotX(e.clientX); dotY(e.clientY);
    ringX(e.clientX); ringY(e.clientY);
  }, { passive: true });

  let current = null;
  document.addEventListener('pointerover', (e) => {
    const target = e.target.closest('[data-cursor]');
    if (target === current) return;
    current = target;
    el.classList.remove('is-link', 'is-view', 'is-hidden');
    if (!target) return;
    const type = target.dataset.cursor;
    el.classList.add(`is-${type}`);
    if (type === 'view') label.textContent = target.dataset.cursorLabel || 'View';
  });
  document.addEventListener('pointerdown', () => el.classList.add('is-down'));
  document.addEventListener('pointerup', () => el.classList.remove('is-down'));
  document.documentElement.addEventListener('pointerleave', () => el.classList.add('is-hidden'));
  document.documentElement.addEventListener('pointerenter', () => el.classList.remove('is-hidden'));
}

export function initMagnetic(env, scope = document) {
  const { gsap } = window;
  if (env.touch || env.reducedMotion) return;
  scope.querySelectorAll('[data-magnetic]:not([data-magnetic-ready])').forEach((btn) => {
    btn.dataset.magneticReady = '';
    const inner = btn.querySelector('[data-magnetic-inner]');
    const strength = parseFloat(btn.dataset.magnetic) || 0.35;
    const bx = gsap.quickTo(btn, 'x', { duration: 0.6, ease: 'power3' });
    const by = gsap.quickTo(btn, 'y', { duration: 0.6, ease: 'power3' });
    const ix = inner && gsap.quickTo(inner, 'x', { duration: 0.6, ease: 'power3' });
    const iy = inner && gsap.quickTo(inner, 'y', { duration: 0.6, ease: 'power3' });
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      bx(x * strength); by(y * strength);
      if (inner) { ix(x * strength * 0.6); iy(y * strength * 0.6); }
    });
    btn.addEventListener('pointerleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.35)' });
      if (inner) gsap.to(inner, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.35)' });
    });
  });
}

/** Click ripple on buttons and chips (delegated, works for buttons added later). */
export function initRipples(env) {
  const { gsap } = window;
  if (env.reducedMotion) return;
  document.addEventListener('pointerdown', (e) => {
    const btn = e.target.closest('.btn, .filter, .chip span');
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const size = Math.hypot(r.width, r.height) * 2;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    Object.assign(ripple.style, { left: `${e.clientX - r.left}px`, top: `${e.clientY - r.top}px`, width: `${size}px`, height: `${size}px` });
    if (getComputedStyle(btn).position === 'static') btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    gsap.fromTo(ripple, { scale: 0, opacity: 0.32 }, { scale: 1, opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: () => ripple.remove() });
  });
}
