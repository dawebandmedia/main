/* ==========================================================================
   Process: an edit timeline. On desktop the section pins, a playhead slides
   across four clips as you scroll, and the step for the active clip swaps in.
   On phones and with reduced motion it is a plain, readable list.
   ========================================================================== */
import { timecode } from '../core/utils.js';

export function initProcess(env) {
  const { gsap, ScrollTrigger, SplitText } = window;
  const section = document.querySelector('#process');
  const pin = section.querySelector('[data-process-pin]');
  const steps = [...section.querySelectorAll('.step')];
  const clips = [...section.querySelectorAll('[data-clip]')];
  const head = section.querySelector('[data-timeline-head]');
  const tc = section.querySelector('[data-timeline-tc]');
  const ruler = section.querySelector('[data-timeline-ruler]');
  const wave = section.querySelector('[data-timeline-wave]');
  const clipsBox = section.querySelector('.timeline__clips');

  // audio waveform: deterministic pseudo-random bars
  const BARS = 140;
  wave.innerHTML = Array.from({ length: BARS }, (_, i) => {
    const h = 18 + Math.abs(Math.sin(i * 0.37) * Math.cos(i * 0.113) + Math.sin(i * 0.07) * 0.4) * 70;
    return `<i style="height:${Math.min(100, h).toFixed(0)}%"></i>`;
  }).join('');
  const bars = [...wave.children];
  ruler.innerHTML = Array.from({ length: 10 }, (_, i) => `<span style="left:${i * 10}%">${timecode(i * 6, false)}</span>`).join('');

  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
    // split once so each step can animate in line by line
    const parts = steps.map((s) => ({
      num: s.querySelector('.step__num'),
      title: SplitText.create(s.querySelector('.step__title'), { type: 'chars', mask: 'chars' }).chars,
      body: SplitText.create(s.querySelector('p'), { type: 'lines', mask: 'lines' }).lines,
    }));
    gsap.set(steps, { autoAlpha: 0 });
    gsap.set(steps[0], { autoAlpha: 1 });
    clips[0].classList.add('is-active');
    let active = 0;

    const show = (i, dir) => {
      if (i === active) return;
      const out = parts[active];
      const inn = parts[i];
      const prevStep = steps[active];
      gsap.to([...out.title, ...out.body], { yPercent: -110 * dir, duration: 0.5, ease: 'power3.in', stagger: 0.01, overwrite: true });
      gsap.to(out.num, { yPercent: -30 * dir, opacity: 0, duration: 0.5, ease: 'power3.in', overwrite: true, onComplete: () => gsap.set(prevStep, { autoAlpha: 0 }) });
      gsap.set(steps[i], { autoAlpha: 1 });
      gsap.fromTo([...inn.title], { yPercent: 110 * dir }, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.02, delay: 0.3, overwrite: true });
      gsap.fromTo(inn.body, { yPercent: 110 * dir }, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06, delay: 0.38, overwrite: true });
      gsap.fromTo(inn.num, { yPercent: 30 * dir, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: 'expo.out', delay: 0.3, overwrite: true });
      active = i;
    };

    // clip boundaries as fractions of the track width
    const bounds = () => {
      const box = clipsBox.getBoundingClientRect();
      return clips.map((c) => {
        const r = c.getBoundingClientRect();
        return [(r.left - box.left) / box.width, (r.right - box.left) / box.width];
      });
    };
    let b = bounds();

    const trigger = ScrollTrigger.create({
      trigger: pin,
      pin: true,
      start: 'top top',
      end: () => `+=${window.innerHeight * 2.6}`,
      scrub: true,
      onRefresh: () => { b = bounds(); },
      onUpdate(self) {
        const p = self.progress;
        const w = clipsBox.clientWidth;
        head.style.transform = `translateX(${p * w}px)`;
        tc.textContent = timecode(p * 54, false);
        let i = b.findIndex(([s, e]) => p >= s && p <= e);
        if (i < 0) i = p < 0.5 ? 0 : clips.length - 1;
        clips.forEach((c, k) => {
          c.classList.toggle('is-active', k === i);
          c.classList.toggle('is-done', k < i);
        });
        const lit = Math.floor(p * BARS);
        bars.forEach((bar, k) => bar.classList.toggle('is-on', k < lit));
        show(i, self.direction || 1);
      },
    });
    return () => { trigger.kill(); gsap.set(steps, { clearProps: 'all' }); };
  });

  if (!env.reducedMotion) {
    gsap.matchMedia().add('(max-width: 899px)', () => {
      steps.forEach((s) => gsap.from(s, { x: -30, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: s, start: 'top 88%', once: true } }));
    });
  }
}
