/* ==========================================================================
   Work: builds the portfolio grid from data/projects.js.
   - A featured first card, then an even grid, so every project is visible at once
   - Filters with counts (animated with Flip)
   - Live project counter in the header
   - Hover preview: each card flips through that project's own screenshots
   - "Live site" shortcut on every card that has a link
   ========================================================================== */
import { esc } from '../core/utils.js';

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

const firstSentence = (d) => {
  const t = Array.isArray(d) ? d[0] : d;
  if (!t) return '';
  const m = String(t).match(/^.*?[.!?](\s|$)/);
  return (m ? m[0] : String(t)).trim();
};
const host = (url) => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; } };
const pad = (n) => String(n).padStart(2, '0');

export function initWork({ env, site, projects, onOpen }) {
  const { gsap, ScrollTrigger, Flip } = window;
  const section = document.querySelector('#work');
  const grid = section.querySelector('[data-work-grid]');
  const filtersEl = section.querySelector('[data-filters]');
  const statsEl = section.querySelector('[data-work-stats]');
  const showingEl = section.querySelector('[data-work-showing]');
  let active = 'All';

  // Real work first; placeholder samples always sink to the end.
  const list = [...projects.filter((p) => !p.sample), ...projects.filter((p) => p.sample)];
  const real = list.filter((p) => !p.sample);
  const counted = real.length ? real : list;

  /* ---------- header stats ---------- */
  const present = [...new Set(list.map((p) => p.category))];
  const ordered = [...(site.categories || []).filter((c) => present.includes(c)), ...present.filter((c) => !(site.categories || []).includes(c))];
  const live = counted.filter((p) => p.link).length;
  // services offered = the crafts listed in data/site.js (or the ones in use)
  const crafts = Math.max((site.categories || []).length, new Set(counted.map((p) => p.category)).size);
  const stats = [
    { n: counted.length, label: counted.length === 1 ? 'Project' : 'Projects' },
    { n: live, label: live === 1 ? 'Live site' : 'Live sites' },
    { n: crafts, label: crafts === 1 ? 'Service' : 'Services' },
  ].filter((s) => s.n > 0);
  statsEl.innerHTML = stats.map((s) => `
    <div class="work__stat"><dt>${esc(s.label)}</dt><dd data-count="${s.n}">${pad(s.n)}</dd></div>`).join('');

  /* ---------- filters ---------- */
  const count = (c) => list.filter((p) => c === 'All' || p.category === c).length;
  filtersEl.innerHTML = ['All', ...ordered].map((c) => `
    <button class="filter${c === 'All' ? ' is-active' : ''}" type="button" data-filter="${esc(c)}" aria-pressed="${c === 'All'}" data-cursor="link">
      ${esc(c)}<sup>${count(c)}</sup>
    </button>`).join('');
  if (ordered.length < 2) filtersEl.hidden = true;

  /* ---------- cards ---------- */
  const card = (p, i) => {
    const frames = [p.thumbnail, ...p.images].slice(0, 6);
    const isVideo = !!p.video;
    return `
    <li class="wcard${i === 0 ? ' wcard--feature' : ''}${p.sample ? ' wcard--sample' : ''}" data-category="${esc(p.category)}" data-slug="${esc(p.slug)}">
      <a class="wcard__link" href="#/work/${esc(p.slug)}" data-cursor="view" data-cursor-label="View"
         aria-label="${esc(p.title)}, ${esc(p.category)}${p.year ? `, ${esc(p.year)}` : ''}">
        <div class="wcard__media" data-frames='${esc(JSON.stringify(frames))}'>
          <img class="wcard__img is-on" src="${esc(p.thumbnail)}" alt="" width="1600" height="1000" decoding="async" ${i > 3 ? 'loading="lazy"' : ''}>
          <span class="wcard__num" aria-hidden="true">${pad(i + 1)}</span>
          ${p.sample ? '<span class="wcard__badge">Sample</span>' : ''}
          ${isVideo ? '<span class="wcard__play" aria-hidden="true"></span>' : ''}
          ${frames.length > 1 ? `<span class="wcard__dots" aria-hidden="true">${frames.map((_, k) => `<i${k === 0 ? ' class="is-on"' : ''}></i>`).join('')}</span>` : ''}
        </div>
        <div class="wcard__meta">
          <h3 class="wcard__title">${esc(p.title)}</h3>
          <span class="wcard__info">${esc(p.category)}${p.year ? ` <span aria-hidden="true">·</span> ${esc(p.year)}` : ''}</span>
        </div>
        ${i === 0 && firstSentence(p.description) ? `<p class="wcard__blurb">${esc(firstSentence(p.description))}</p>` : ''}
      </a>
      ${p.link ? `<a class="wcard__live" href="${esc(p.link)}" target="_blank" rel="noopener" data-cursor="link" aria-label="Open ${esc(p.title)} live${host(p.link) ? ` on ${esc(host(p.link))}` : ''} (new tab)"><i aria-hidden="true"></i>${isVideo ? 'Watch' : 'Live site'}<span aria-hidden="true">↗</span></a>` : ''}
    </li>`;
  };
  grid.innerHTML = list.map(card).join('') + `
    <li class="wcard wcard--cta" data-category="*">
      <div class="wcard__media">
        <p class="wcard__cta-title">Your project could be next.</p>
        <a class="btn btn--solid" href="#contact" style="--btn-fill: var(--night)" data-magnetic data-cursor="link"><span data-magnetic-inner>Start your project</span></a>
      </div>
    </li>`;
  if (!list.length) grid.insertAdjacentHTML('beforebegin', '<p class="work__empty">No projects yet. Add your first one in data/projects.js.</p>');

  const cards = () => [...grid.querySelectorAll('.wcard:not(.wcard--cta)')];
  const visible = () => cards().filter((c) => !c.hidden);
  const setShowing = () => {
    const n = visible().length;
    showingEl.textContent = active === 'All' ? `Showing all ${n}` : `${n} ${active.toLowerCase()} project${n === 1 ? '' : 's'}`;
  };
  setShowing();

  grid.addEventListener('click', (e) => {
    const link = e.target.closest('.wcard__link');
    if (!link) return;
    e.preventDefault();
    const r = link.querySelector('.wcard__media').getBoundingClientRect();
    const origin = e.clientX ? { x: e.clientX, y: e.clientY } : { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    onOpen(link.closest('.wcard').dataset.slug, origin);
  });

  /* ---------- filtering ---------- */
  filtersEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (!btn || btn.dataset.filter === active) return;
    active = btn.dataset.filter;
    filtersEl.querySelectorAll('.filter').forEach((b) => {
      const on = b === btn;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    const all = [...grid.querySelectorAll('.wcard')];
    const state = env.reducedMotion ? null : Flip.getState(all);
    cards().forEach((c) => { c.hidden = !(active === 'All' || c.dataset.category === active); });
    // the first visible card is always the big one
    cards().forEach((c) => c.classList.remove('wcard--feature'));
    visible()[0]?.classList.add('wcard--feature');
    setShowing();
    if (!state) return ScrollTrigger.refresh();
    Flip.from(state, {
      duration: 0.8,
      ease: 'expo.inOut',
      absolute: true,
      scale: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.7, ease: 'expo.out', delay: 0.12 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.9, duration: 0.4, ease: 'power2.in' }),
      onComplete: () => ScrollTrigger.refresh(),
    });
  });

  /* ---------- hover preview: flip through the project's screenshots ---------- */
  if (!env.touch && !env.reducedMotion) {
    grid.querySelectorAll('.wcard__media[data-frames]').forEach((media) => {
      let frames;
      try { frames = JSON.parse(media.dataset.frames); } catch { return; }
      if (frames.length < 2) return;
      const dots = [...media.querySelectorAll('.wcard__dots i')];
      let imgs = null; let k = 0; let timer = null;
      const build = () => {
        const first = media.querySelector('.wcard__img');
        const anchor = media.querySelector('.wcard__num');
        imgs = [first, ...frames.slice(1).map((src) => {
          const im = new Image();
          im.className = 'wcard__img'; im.alt = ''; im.decoding = 'async'; im.src = src;
          media.insertBefore(im, anchor);
          return im;
        })];
      };
      const show = (n) => {
        imgs.forEach((im, j) => im.classList.toggle('is-on', j === n));
        dots.forEach((d, j) => d.classList.toggle('is-on', j === n));
      };
      const link = media.closest('.wcard');
      link.addEventListener('pointerenter', () => {
        if (!imgs) build();
        clearInterval(timer);
        timer = setInterval(() => { k = (k + 1) % imgs.length; show(k); }, 1100);
      });
      link.addEventListener('pointerleave', () => { clearInterval(timer); k = 0; if (imgs) show(0); });
    });
  }

  /* ---------- entrances ---------- */
  if (!env.reducedMotion) {
    // count-up numbers
    statsEl.querySelectorAll('[data-count]').forEach((dd) => {
      const n = Number(dd.dataset.count); const o = { v: 0 };
      gsap.to(o, { v: n, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: statsEl, start: 'top 88%', once: true },
        onUpdate: () => { dd.textContent = pad(Math.round(o.v)); } });
    });
    // cards rise in, row by row
    const all = [...grid.querySelectorAll('.wcard')];
    gsap.set(all, { y: 60, opacity: 0 });
    ScrollTrigger.batch(all, {
      start: 'top 92%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: 0.08, overwrite: true }),
    });
  }

  return { get count() { return list.length; } };
}
