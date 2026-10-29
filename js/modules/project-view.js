/* ==========================================================================
   Full-screen project detail view.
   Opens with the shader wipe from wherever you clicked, supports deep links
   (#/work/<slug>), the browser back button, Esc, focus trapping and
   "next project". Videos: .mp4 files, YouTube, Vimeo and Facebook links.
   ========================================================================== */
import { esc } from '../core/utils.js';
import { stopScroll, startScroll } from '../core/scroll.js';
import { initMagnetic } from './cursor.js';

export function videoEmbed(url) {
  if (!url) return null;
  const u = String(url).trim();
  let m;
  if ((m = u.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{6,})/))) {
    return { type: 'iframe', src: `https://www.youtube-nocookie.com/embed/${m[1]}?rel=0&modestbranding=1` };
  }
  if ((m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/))) return { type: 'iframe', src: `https://player.vimeo.com/video/${m[1]}?dnt=1` };
  if (/(facebook\.com|fb\.watch)/i.test(u)) {
    return { type: 'iframe', src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(u)}&show_text=false` };
  }
  if (/\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(u)) return { type: 'video', src: u };
  return null;
}

export function initProjectView({ env, projects, wipe }) {
  const { gsap, SplitText } = window;
  const pv = document.querySelector('[data-pv]');
  const content = pv.querySelector('[data-pv-content]');
  const countEl = pv.querySelector('[data-pv-count]');
  const closeBtn = pv.querySelector('[data-pv-close]');
  const root = document.documentElement;
  let current = -1;
  let busy = false;
  let lastFocus = null;
  let io = null;

  const center = () => ({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const slugFromHash = () => (location.hash.match(/^#\/work\/([\w-]+)/) || [])[1];

  function html(p, i) {
    const next = projects[(i + 1) % projects.length];
    const paras = (Array.isArray(p.description) ? p.description : [p.description]).filter(Boolean);
    const video = videoEmbed(p.video);
    let media;
    if (video?.type === 'iframe') {
      media = `<div class="pv__embed"><iframe src="${esc(video.src)}" title="${esc(p.title)} video" loading="lazy"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`;
    } else if (video?.type === 'video') {
      media = `<video src="${esc(video.src)}" poster="${esc(p.thumbnail)}" controls playsinline preload="metadata" data-cursor="hide"></video>`;
    } else {
      media = `<img src="${esc(p.thumbnail)}" alt="${esc(p.title)}" width="1400" height="875">`;
    }
    const meta = [
      ['Category', p.category], ['Year', p.year], ['Client', p.client], ['Role', p.role],
    ].filter(([, v]) => v).map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('');

    return `
      <header class="pv__head">
        ${p.sample ? '<p class="pv__sample">Sample project: replace it in <code>data/projects.js</code></p>' : ''}
        <h2 class="pv__title" id="pv-title">${esc(p.title)}</h2>
        ${p.demo ? '<aside class="pv__disclaimer" aria-label="Portfolio demo disclaimer"><strong>Independent portfolio demo</strong><p>This website is an independent demo created by DA Web &amp; Media to showcase our design and development skills. It is not the business’s official website and is not affiliated with or endorsed by the business.</p></aside>' : ''}
        <dl class="pv__meta">
          ${meta}
          ${p.link ? `<div class="pv__actions"><a class="btn btn--solid" href="${esc(p.link)}" target="_blank" rel="noopener" data-magnetic data-cursor="link"><span data-magnetic-inner>Visit live project</span></a></div>` : ''}
        </dl>
      </header>
      <div class="pv__media">${media}</div>
      ${paras.length ? `<section class="pv__desc"><h2>About the project</h2><div class="pv__desc-body">${paras.map((t) => `<p>${esc(t)}</p>`).join('')}</div></section>` : '<div style="height:10vh"></div>'}
      ${p.images.length ? `<div class="pv__gallery">${p.images.map((src, k) => `<figure><img src="${esc(src)}" alt="${esc(p.title)}, image ${k + 2}" loading="lazy" decoding="async"></figure>`).join('')}</div>` : ''}
      ${projects.length > 1 ? `<a class="pv__next" href="#/work/${esc(next.slug)}" data-pv-next="${esc(next.slug)}" data-cursor="link"><small>Next project</small><strong>${esc(next.title)}</strong></a>` : ''}
    `;
  }

  function fill(i) {
    current = i;
    content.innerHTML = html(projects[i], i);
    countEl.textContent = `${String(i + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}`;
    pv.scrollTop = 0;
    initMagnetic(env, content);
  }

  function animateIn() {
    io?.disconnect();
    if (env.reducedMotion) return;
    const title = content.querySelector('.pv__title');
    const split = SplitText.create(title, { type: 'lines,chars', mask: 'lines' });
    gsap.from(split.chars, { yPercent: 120, rotate: 6, duration: 1.2, ease: 'expo.out', stagger: 0.025 });
    gsap.from(content.querySelectorAll('.pv__meta > div, .pv__sample'), { y: 24, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.06, delay: 0.25 });
    gsap.fromTo(content.querySelector('.pv__media'), { clipPath: 'inset(12% 8% 0% 8% round 18px)' }, { clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: 1.6, ease: 'expo.out', delay: 0.2 });
    // gallery images reveal as you scroll inside the view
    io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        gsap.fromTo(e.target, { clipPath: 'inset(10% 10% 10% 10% round 14px)', opacity: 0.4 }, { clipPath: 'inset(0% 0% 0% 0% round 14px)', opacity: 1, duration: 1.4, ease: 'expo.out' });
      });
    }, { root: pv, threshold: 0.12 });
    content.querySelectorAll('.pv__gallery figure, .pv__desc').forEach((el) => io.observe(el));
  }

  async function open(slug, origin = center(), { push = true } = {}) {
    const i = projects.findIndex((p) => p.slug === slug);
    if (i < 0 || busy) return;
    busy = true;
    const wasOpen = !pv.hidden;
    if (!wasOpen) lastFocus = document.activeElement;
    await wipe.cover(origin);
    fill(i);
    if (!wasOpen) {
      pv.hidden = false;
      root.classList.add('pv-open');
      stopScroll();
    }
    if (push && !wasOpen) history.pushState({ pv: slug }, '', `#/work/${slug}`);
    else history.replaceState(history.state?.pv ? { pv: slug } : null, '', `#/work/${slug}`);
    document.title = `${projects[i].title} | DA Web & Media`;
    await wipe.reveal(center());
    animateIn();
    closeBtn.focus({ preventScroll: true });
    busy = false;
  }

  async function close(origin = center(), { fromHistory = false } = {}) {
    if (pv.hidden || busy) return;
    if (!fromHistory && history.state?.pv) { history.back(); return; } // popstate will call us again
    busy = true;
    await wipe.cover(origin);
    pv.hidden = true;
    content.innerHTML = '';
    root.classList.remove('pv-open');
    startScroll();
    if (!fromHistory) history.replaceState(null, '', location.pathname + location.search);
    document.title = 'DA Web & Media | Website Design, Video Editing & Digital Creative';
    window.ScrollTrigger?.refresh();
    await wipe.reveal(origin);
    lastFocus?.focus?.({ preventScroll: true });
    busy = false;
  }

  closeBtn.addEventListener('click', (e) => close(e.clientX ? { x: e.clientX, y: e.clientY } : center()));
  content.addEventListener('click', (e) => {
    const next = e.target.closest('[data-pv-next]');
    if (!next) return;
    e.preventDefault();
    open(next.dataset.pvNext, { x: e.clientX || window.innerWidth / 2, y: e.clientY || window.innerHeight / 2 }, { push: false });
  });

  window.addEventListener('popstate', () => {
    const slug = slugFromHash();
    if (slug) open(slug, center(), { push: false });
    else if (!pv.hidden) close(center(), { fromHistory: true });
  });

  // keyboard: Esc closes, Tab stays inside the dialog
  pv.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    const focusables = [...pv.querySelectorAll('a[href], button, iframe, video[controls], [tabindex]:not([tabindex="-1"])')].filter((el) => el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /** Open the project in the URL, if any (called after the preloader). */
  function route() {
    const slug = slugFromHash();
    if (slug) open(slug, center(), { push: false });
  }

  return { open, close, route };
}
