/* Testimonials from data/testimonials.js.
   Empty list -> an honest "be the first" invitation (or hidden, see site.js).
   One or more -> a quote slider with kinetic word reveals and autoplay. */
import { esc } from '../core/utils.js';

export function initTestimonials({ env, site, testimonials }) {
  const { gsap, SplitText } = window;
  const section = document.querySelector('[data-testimonials]');
  const stage = section.querySelector('[data-testimonials-stage]');
  const list = (Array.isArray(testimonials) ? testimonials : []).filter((t) => t && t.quote && t.name);

  if (!list.length) {
    if (site.hideTestimonialsWhenEmpty) { section.hidden = true; return; }
    section.querySelector('.section-title').textContent = 'Client words';
    stage.innerHTML = `
      <div class="t-empty">
        <div>
          <p class="t-empty__text" data-reveal-lines>Every studio has a first review. <span>Yours could be it.</span></p>
          <div class="t-empty__actions">
            <a class="btn btn--solid" href="#contact" data-magnetic data-cursor="link"><span data-magnetic-inner>Start your project</span></a>
          </div>
        </div>
        <div class="t-orbit" aria-hidden="true"><i></i><b>01</b></div>
      </div>`;
    return;
  }

  stage.innerHTML = `
    <div class="t-slider" aria-roledescription="carousel" aria-label="Client testimonials">
      <blockquote class="t-quote" data-t-quote aria-live="polite"></blockquote>
      <div class="t-person"><div><strong data-t-name></strong><span data-t-role></span></div></div>
      ${list.length > 1 ? `
      <div class="t-controls">
        <button class="btn btn--line" type="button" data-t-prev aria-label="Previous testimonial" data-cursor="link"><span>&larr;</span></button>
        <button class="btn btn--line" type="button" data-t-next aria-label="Next testimonial" data-cursor="link"><span>&rarr;</span></button>
        <span class="t-count" data-t-count></span>
      </div>` : ''}
    </div>`;

  const quote = stage.querySelector('[data-t-quote]');
  const name = stage.querySelector('[data-t-name]');
  const role = stage.querySelector('[data-t-role]');
  const countEl = stage.querySelector('[data-t-count]');
  let i = 0;
  let timer;

  const render = (dir = 1) => {
    const t = list[i];
    quote.innerHTML = `&ldquo;${esc(t.quote)}&rdquo;`;
    name.textContent = t.name;
    role.textContent = t.role || '';
    if (countEl) countEl.textContent = `${String(i + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}`;
    if (env.reducedMotion) return;
    const split = SplitText.create(quote, { type: 'words', mask: 'words' });
    gsap.from(split.words, { yPercent: 110 * dir, duration: 1, ease: 'expo.out', stagger: 0.025 });
    gsap.from([name, role], { opacity: 0, y: 12, duration: 0.8, delay: 0.3, stagger: 0.08 });
  };
  const go = (d) => { i = (i + d + list.length) % list.length; render(d); restart(); };
  const restart = () => {
    clearInterval(timer);
    if (list.length > 1 && !env.reducedMotion) timer = setInterval(() => go(1), 8000);
  };
  stage.querySelector('[data-t-prev]')?.addEventListener('click', () => go(-1));
  stage.querySelector('[data-t-next]')?.addEventListener('click', () => go(1));
  render();
  restart();
}
