/* ==========================================================================
   Kinetic typography (GSAP SplitText + ScrambleText)
   data-reveal-lines   lines slide up out of a mask when scrolled into view
   data-reveal-chars   characters rise and rotate in, one after another
   data-scrub-words    words light up as you scroll through them
   data-scramble-in    text decodes from random characters on first view
   All are skipped with prefers-reduced-motion (the text simply shows).
   ========================================================================== */

export function initKineticType(env, scope = document) {
  const { gsap, SplitText } = window;
  if (env.reducedMotion) return;

  // hero text is choreographed by hero.js after the preloader
  const skip = (el) => el.closest('.hero') || (el.closest('[data-pv]') && scope === document);

  scope.querySelectorAll('[data-reveal-lines]').forEach((el) => {
    if (skip(el)) return;
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'line',
      autoSplit: true,
      onSplit(self) {
        return gsap.from(self.lines, {
          yPercent: 110,
          duration: 1.2,
          ease: 'expo.out',
          stagger: 0.09,
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        });
      },
    });
  });

  scope.querySelectorAll('[data-reveal-chars]').forEach((el) => {
    SplitText.create(el, {
      type: 'words,chars',
      mask: 'words',
      autoSplit: true,
      onSplit(self) {
        return gsap.from(self.chars, {
          yPercent: 120,
          rotate: 8,
          duration: 1.1,
          ease: 'expo.out',
          stagger: 0.022,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      },
    });
  });

  scope.querySelectorAll('[data-scrub-words]').forEach((el) => {
    SplitText.create(el, {
      type: 'words',
      wordsClass: 'word',
      autoSplit: true,
      onSplit(self) {
        return gsap.fromTo(self.words,
          { opacity: 0.14 },
          {
            opacity: 1,
            ease: 'none',
            stagger: 0.12,
            scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 42%', scrub: true },
          });
      },
    });
  });

  scope.querySelectorAll('[data-scramble-in]').forEach((el, i) => {
    if (skip(el)) return;
    const text = el.textContent;
    gsap.set(el, { opacity: 0 });
    gsap.to(el, {
      opacity: 1,
      duration: 1.2,
      delay: i * 0.12,
      scrambleText: { text, chars: '01/·•', speed: 0.6, revealDelay: 0.3 },
      scrollTrigger: { trigger: el, start: 'top 95%', once: true },
    });
  });
}
