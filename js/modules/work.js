/* ==========================================================================
   Work: builds the gallery from data/projects.js, the filters, the pinned
   horizontal "reel" (desktop) and the WebGL thumbnails.
   ========================================================================== */
import { esc, clamp, timecode, whenVisible, debounce } from '../core/utils.js';
import { scrollTo } from '../core/scroll.js';

/** Keep only usable entries; never crash on a typo in projects.js. */
export function cleanProjects(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  return list.filter((p, i) => {
    const ok = p && p.title && p.thumbnail;
    if (!ok) { console.warn(`[projects.js] entry #${i + 1} needs at least a title and a thumbnail; skipped.`); return false; }
    p.slug = String(p.slug || p.title).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (seen.has(p.slug)) p.slug = `${p.slug}-${i}`;
    seen.add(p.slug);
    p.category = p.category || 'Other';
    p.images = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
    return true;
  });
}

export function initWork({ env, site, projects, onOpen }) {
  const { gsap, ScrollTrigger, Flip } = window;
  const section = document.querySelector('#work');
  const pin = section.querySelector('[data-work-pin]');
  const viewport = section.querySelector('[data-work-viewport]');
  const track = section.querySelector('[data-work-track]');
  const ruler = section.querySelector('[data-work-ruler]');
  const filtersEl = section.querySelector('[data-filters]');
  const bar = section.querySelector('[data-work-bar]');
  const idxEl = section.querySelector('[data-work-index]');
  const totalEl = section.querySelector('[data-work-total]');
  const canvas = section.querySelector('[data-work-canvas]');
  let active = 'All';
  let st = null;
  let gl = null;

  /* ---------- filters ---------- */
  const present = [...new Set(projects.map((p) => p.category))];
  const ordered = [...(site.categories || []).filter((c) => present.includes(c)), ...present.filter((c) => !(site.categories || []).includes(c))];
  const count = (c) => projects.filter((p) => c === 'All' || p.category === c).length;
  filtersEl.innerHTML = ['All', ...ordered].map((c) => `
    <button class="filter${c === 'All' ? ' is-active' : ''}" type="button" data-filter="${esc(c)}" aria-pressed="${c === 'All'}" data-cursor="link">
      ${esc(c)}<sup>${count(c)}</sup>
    </button>`).join('');
  if (ordered.length < 2) filtersEl.hidden = true;

  /* ---------- cards ---------- */
  track.innerHTML = projects.map((p, i) => `
    <li class="card" data-category="${esc(p.category)}" data-slug="${esc(p.slug)}">
      <a class="card__link" href="#/work/${esc(p.slug)}" data-cursor="view" data-cursor-label="View"
         aria-label="${esc(p.title)}, ${esc(p.category)}${p.year ? `, ${esc(p.year)}` : ''}">
        <div class="card__media">
          <img src="${esc(p.thumbnail)}" alt="${esc(p.title)}" width="1400" height="875" decoding="async" ${i > 2 ? 'loading="lazy"' : ''}>
          ${p.sample ? '<span class="card__badge">Sample</span>' : ''}
        </div>
        <div class="card__meta">
          <h3 class="card__title">${esc(p.title)}</h3>
          <span class="card__info">${esc(p.category)}${p.year ? ` <span aria-hidden="true">/</span> ${esc(p.year)}` : ''}</span>
        </div>
      </a>
    </li>`).join('') + `
    <li class="card card--cta" data-category="*">
      <div class="card__media">
        <p class="card__cta-title">Your project could be next.</p>
        <a class="btn btn--solid" href="#contact" style="--btn-fill: var(--night)" data-magnetic data-cursor="link"><span data-magnetic-inner>Start your project</span></a>
      </div>
    </li>`;
  if (!projects.length) {
    track.insertAdjacentHTML('beforebegin', '<p class="work__empty">No projects yet. Add your first one in data/projects.js.</p>');
  }

  const cards = () => [...track.querySelectorAll('.card:not(.card--cta)')];
  const visibleCards = () => cards().filter((c) => c.style.display !== 'none');
  const setTotals = () => {
    totalEl.textContent = String(visibleCards().length).padStart(2, '0');
  };
  setTotals();

  track.addEventListener('click', (e) => {
    const link = e.target.closest('.card__link');
    if (!link) return;
    e.preventDefault();
    const r = link.querySelector('.card__media').getBoundingClientRect();
    const origin = e.clientX ? { x: e.clientX, y: e.clientY } : { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    onOpen(link.closest('.card').dataset.slug, origin);
  });

  filtersEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (!btn || btn.dataset.filter === active) return;
    active = btn.dataset.filter;
    filtersEl.querySelectorAll('.filter').forEach((b) => {
      const on = b === btn;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    applyFilter();
  });

  function applyFilter() {
    const all = [...track.querySelectorAll('.card')];
    const state = env.reducedMotion ? null : Flip.getState(all);
    cards().forEach((c) => { c.style.display = active === 'All' || c.dataset.category === active ? '' : 'none'; });
    setTotals();
    const done = () => {
      ScrollTrigger.refresh();
      if (st && window.scrollY > st.start + 2) scrollTo(st.start, { duration: 1.2 });
    };
    if (!state) return done();
    Flip.from(state, {
      duration: 0.9,
      ease: 'expo.inOut',
      absolute: true,
      scale: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.8, ease: 'expo.out', delay: 0.15 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.8, duration: 0.5, ease: 'power2.in' }),
      onComplete: done,
    });
  }

  /* ---------- ruler with timecodes (the gallery reads like an edit timeline) ---------- */
  function buildRuler() {
    const width = track.scrollWidth;
    ruler.style.width = `${width}px`;
    const step = 200; // px per label
    let html = '';
    for (let x = 0, i = 0; x < width; x += step, i++) html += `<span style="left:${x}px">${timecode(i * 2, false)}</span>`;
    ruler.innerHTML = html;
  }

  /* ---------- desktop: pinned horizontal scroll ---------- */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
    const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
    buildRuler();
    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: pin,
        pin: true,
        start: 'top top',
        end: () => `+=${distance()}`,
        scrub: true,
        invalidateOnRefresh: true,
        onRefresh: buildRuler,
        onUpdate(self) {
          const x = gsap.getProperty(track, 'x');
          ruler.style.transform = `translateX(${x}px)`;
          bar.style.transform = `scaleX(${self.progress})`;
          gl?.setVelocity(clamp(self.getVelocity() / 3500, -1, 1));
          // which project sits closest to the middle of the screen
          const mid = window.innerWidth / 2;
          let best = 0; let bestD = Infinity;
          visibleCards().forEach((c, i) => {
            const r = c.getBoundingClientRect();
            const d = Math.abs(r.left + r.width / 2 - mid);
            if (d < bestD) { bestD = d; best = i; }
          });
          idxEl.textContent = String(best + 1).padStart(2, '0');
        },
      },
    });
    st = tween.scrollTrigger;
    return () => { st = null; gsap.set(track, { x: 0 }); ruler.style.transform = ''; };
  });

  // card entrance for the mobile / reduced-motion grid
  if (!env.reducedMotion) {
    gsap.matchMedia().add('(max-width: 899px)', () => {
      cards().forEach((c) => gsap.from(c, { y: 60, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: c, start: 'top 92%', once: true } }));
    });
  }

  /* ---------- WebGL thumbnails (desktop only, loaded when the section is near) ---------- */
  const wantsGL = env.webgl && !env.reducedMotion && !env.touch;
  if (wantsGL && projects.length) {
    let started = false;
    const stopWatching = whenVisible(section, async (visible) => {
      if (!visible || started || env.small) return;
      started = true;
      stopWatching();
      try {
        const { GalleryGL } = await import('../gl/gallery-gl.js');
        gl = new GalleryGL(canvas, viewport, env).init();
        await gl.setCards(cards());
        document.documentElement.classList.add('has-gallery-gl');
        whenVisible(section, (v) => (v && !env.small ? gl.start() : gl.stop()));
        window.addEventListener('resize', debounce(() => gl.resize(), 150));
      } catch (err) {
        console.warn('[work] WebGL gallery unavailable, using plain images.', err);
      }
    }, '60% 0px');
  }

  return { get count() { return projects.length; } };
}
