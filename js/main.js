/* ==========================================================================
   DA Web & Media — portfolio entry point
   Loads your content from /data, builds the page, runs the preloader,
   then hands over to the hero. Each feature lives in its own module.
   ========================================================================== */
import site from '../data/site.js';
import rawProjects from '../data/projects.js';
import testimonials from '../data/testimonials.js';

import { env } from './core/env.js';
import { initScroll, startScroll } from './core/scroll.js';
import { loadImage, timecode } from './core/utils.js';
import { Wipe } from './gl/wipe.js';
import { Preloader } from './modules/preloader.js';
import { initCursor, initMagnetic, initRipples } from './modules/cursor.js';
import { initNav } from './modules/nav.js';
import { initKineticType } from './modules/kinetic-type.js';
import { initHero } from './modules/hero.js';
import { initAbout, initServices } from './modules/sections.js';
import { initWork, cleanProjects } from './modules/work.js';
import { initProjectView } from './modules/project-view.js';
import { initProcess } from './modules/process.js';
import { initTestimonials } from './modules/testimonials.js';
import { applySiteSettings, initContact } from './modules/contact.js';
import { initFooter } from './modules/footer.js';

async function boot() {
  clearTimeout(window.__daFailsafe);
  const { gsap, ScrollTrigger, SplitText, ScrambleTextPlugin, CustomEase, Flip, DrawSVGPlugin } = window;
  gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, CustomEase, Flip, DrawSVGPlugin);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const projects = cleanProjects(rawProjects);
  const preloader = new Preloader(document.querySelector('[data-preloader]'), env);
  initScroll();

  // content from /data
  applySiteSettings(site);
  const wipe = new Wipe(document.querySelector('[data-wipe]'), env);
  const view = initProjectView({ env, projects, wipe });
  initWork({ env, site, projects, onOpen: (slug, origin) => view.open(slug, origin) });
  initTestimonials({ env, site, testimonials });

  // things worth waiting for: fonts, the first thumbnails, the 3D scene
  preloader.track(document.fonts?.ready, 1);
  projects.slice(0, 3).forEach((p) => preloader.track(loadImage(p.thumbnail), 0.5));
  const hero = initHero(env);
  preloader.track(hero.ready, 2);

  // interaction layers
  initCursor(env);
  initMagnetic(env);
  initRipples(env);
  initNav(env);
  initAbout(env);
  initServices(env);
  initProcess(env);
  initContact({ env, site });
  initFooter(env);
  initKineticType(env);
  initReel(env);

  await preloader.complete();
  await hero.ready;
  await preloader.exit({ onCollapse: (point) => hero.intro(point) });

  startScroll();
  ScrollTrigger.refresh();
  view.route(); // open a project straight from a shared link (#/work/slug)
}

/* The fixed timecode in the corner: the whole page plays like a reel. */
function initReel(env) {
  const tc = document.querySelector('[data-reel-tc]');
  const bar = document.querySelector('[data-reel-bar]');
  const reel = document.querySelector('.reel');
  if (!tc) return;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    tc.textContent = timecode(window.scrollY / 260);
    bar.style.transform = `scaleX(${p})`;
    bar.style.setProperty('--inv', p > 0 ? 1 / p : 1);
    reel.classList.toggle('is-end', max - window.scrollY < 140);
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

// GSAP loads with "defer", so it is ready by the time this module runs
if (window.gsap) {
  boot().catch((err) => {
    console.error('[DA] Something failed while starting the page:', err);
    document.documentElement.classList.remove('is-loading');
    document.documentElement.classList.add('is-ready');
    document.documentElement.style.overflow = '';
    startScroll();
  });
} else {
  console.error('[DA] GSAP did not load. Check that the /vendor folder was uploaded.');
}
