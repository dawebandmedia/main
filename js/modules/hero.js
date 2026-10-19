/* ==========================================================================
   Hero: choreographs the 3D scene, the headline and the scroll morph.
   ========================================================================== */
import { clamp, debounce } from '../core/utils.js';

export function initHero(env) {
  const { gsap, ScrollTrigger, SplitText } = window;
  const section = document.querySelector('.hero');
  const canvas = section.querySelector('[data-hero-canvas]');
  const title = section.querySelector('[data-hero-title]');
  const lede = section.querySelector('.hero__lede');
  const actions = section.querySelector('.hero__actions');
  const crafts = [...section.querySelectorAll('.hero__crafts li')];
  const cue = section.querySelector('.hero__cue');
  const content = section.querySelector('.hero__content');
  const about = document.querySelector('.about');
  let scene = null;
  let chars = [];

  // hide headline parts until the intro plays (only when motion is allowed)
  if (!env.reducedMotion) gsap.set([actions, ...cue.children, ...crafts], { opacity: 0 });

  /* ---------- 3D scene (three.js is only downloaded if WebGL works) ---------- */
  const ready = (async () => {
    if (!env.webgl) return null;
    try {
      const { HeroScene } = await import('../gl/hero-scene.js');
      scene = new HeroScene(canvas, env).init();
      return scene;
    } catch (err) {
      console.warn('[hero] 3D scene unavailable, showing the flat logo instead.', err);
      document.documentElement.classList.add('no-webgl');
      return null;
    }
  })();

  ready.then((s) => {
    if (!s) return;
    // pointer: mouse anywhere over the hero; on touch, while a finger is down
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch' && e.buttons === 0) return;
      s.setPointer(e.clientX, e.clientY, true);
    }, { passive: true });
    window.addEventListener('pointerup', (e) => { if (e.pointerType === 'touch') s.leavePointer(); });
    document.documentElement.addEventListener('pointerleave', () => s.leavePointer());
    window.addEventListener('resize', debounce(() => s.resize(), 120));

    // run the render loop only while the hero can be seen
    const guard = () => {
      const top = about.getBoundingClientRect().top;
      s.setLineScreenY(Math.min(top, window.innerHeight * 0.88));
      const visible = top > 0 && !document.hidden && !document.documentElement.classList.contains('pv-open');
      if (env.reducedMotion) return;
      if (visible) s.start(); else s.stop();
    };
    gsap.ticker.add(guard);
    if (env.reducedMotion) s.render();
  });

  /* ---------- scroll: orbit -> timeline, headline drifts away ---------- */
  if (!env.reducedMotion) {
    const morphDistance = () => window.innerHeight * (env.small ? 0.5 : 0.6);
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => `+=${morphDistance()}`,
      onUpdate: (self) => scene?.setMorph(self.progress),
    });
    gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top top', end: () => `+=${window.innerHeight * 0.5}`, scrub: true },
    })
      .to(content, { y: -window.innerHeight * 0.12, opacity: 0, ease: 'none' }, 0)
      .to('.hero__crafts, .hero__cue', { opacity: 0, ease: 'none' }, 0);
  }

  /* ---------- variable-weight headline: letters swell near the cursor ---------- */
  function enableWeightHover() {
    if (env.touch || env.reducedMotion || !chars.length) return;
    const setters = chars.map((c) => gsap.quickTo(c, '--wght', { duration: 0.5, ease: 'power3' }));
    title.addEventListener('pointermove', (e) => {
      chars.forEach((c, i) => {
        const r = c.getBoundingClientRect();
        const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
        setters[i](450 + (1 - clamp(d / 260)) * 420);
      });
    });
    title.addEventListener('pointerleave', () => setters.forEach((s) => s(450)));
  }

  /* ---------- intro, called as the preloader collapses into its dot ---------- */
  function intro(point) {
    if (scene) scene.intro(point, gsap);
    if (env.reducedMotion) return;

    const split = SplitText.create(title, { type: 'lines,words,chars', mask: 'lines', charsClass: 'char' });
    chars = split.chars;
    gsap.set(chars, { '--wght': 450 });
    gsap.from(chars, { yPercent: 125, rotate: 7, duration: 1.4, ease: 'expo.out', stagger: 0.026, delay: 0.45, onComplete: enableWeightHover });

    SplitText.create(lede, {
      type: 'lines', mask: 'lines', autoSplit: true,
      onSplit: (self) => gsap.from(self.lines, { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.08, delay: 0.9 }),
    });
    gsap.fromTo(actions, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', delay: 1.1 });
    crafts.forEach((li, i) => {
      gsap.to(li, { opacity: 1, duration: 1.2, delay: 1.2 + i * 0.12, scrambleText: { text: li.textContent, chars: '01/·•', speed: 0.6, revealDelay: 0.3 } });
    });
    gsap.to(cue.children, { opacity: 1, duration: 1, delay: 1.6, stagger: 0.1 });
  }

  return { ready, intro, get scene() { return scene; } };
}
