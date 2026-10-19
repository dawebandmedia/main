/* ==========================================================================
   Contact: email + socials from data/site.js, copy-to-clipboard, and the form.
   With site.formEndpoint set (e.g. Formspree) messages are sent in-page;
   otherwise the visitor's email app opens with everything filled in.
   ========================================================================== */
import { esc } from '../core/utils.js';

export function applySiteSettings(site) {
  document.querySelectorAll('[data-site-email]').forEach((a) => {
    a.href = `mailto:${site.email}`;
    if (a.textContent.includes('@')) a.textContent = site.email;
  });
  const socials = (site.socials || []).filter((s) => s && s.url);
  const socialsEl = document.querySelector('[data-socials]');
  if (socialsEl) {
    socialsEl.innerHTML = socials.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener" data-cursor="link">${esc(s.label)}</a></li>`).join('');
  }
  const footer = document.querySelector('[data-footer-links]');
  if (footer) {
    footer.innerHTML = `<li><a href="mailto:${esc(site.email)}" data-cursor="link">Email</a></li>` +
      socials.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener" data-cursor="link">${esc(s.label)}</a></li>`).join('');
  }
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
}

export function initContact({ env, site }) {
  const { gsap } = window;
  const form = document.querySelector('[data-contact-form]');
  const status = form.querySelector('[data-form-status]');
  const sendLabel = form.querySelector('[data-send-label]');
  const copyBtn = document.querySelector('[data-copy-email]');

  copyBtn?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      copyBtn.textContent = 'Copied';
    } catch {
      copyBtn.textContent = site.email;
    }
    setTimeout(() => { copyBtn.textContent = 'Copy email'; }, 2200);
  });

  const fields = {
    name: { el: form.elements.name, check: (v) => (v.trim().length > 1 ? '' : 'Add your name so we know who to reply to.') },
    email: { el: form.elements.email, check: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter an email like name@example.com.') },
    message: { el: form.elements.message, check: (v) => (v.trim().length > 9 ? '' : 'Write a sentence or two about the project.') },
  };
  const validate = (key) => {
    const f = fields[key];
    const msg = f.check(f.el.value);
    const wrap = f.el.closest('.field');
    wrap.classList.toggle('is-invalid', !!msg);
    wrap.querySelector('.field__error').textContent = msg;
    f.el.setAttribute('aria-invalid', String(!!msg));
    return !msg;
  };
  Object.keys(fields).forEach((k) => fields[k].el.addEventListener('blur', () => { if (fields[k].el.value) validate(k); }));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const ok = Object.keys(fields).map(validate).every(Boolean);
    if (!ok) {
      const firstBad = Object.values(fields).find((f) => f.el.getAttribute('aria-invalid') === 'true');
      firstBad?.el.focus();
      if (!env.reducedMotion) gsap.fromTo(form, { x: -8 }, { x: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
      return;
    }
    const data = {
      name: fields.name.el.value.trim(),
      email: fields.email.el.value.trim(),
      needs: [...form.querySelectorAll('input[name="needs"]:checked')].map((c) => c.value).join(', ') || 'Not specified',
      message: fields.message.el.value.trim(),
    };

    if (!site.formEndpoint) {
      const body = `Hi DA Web & Media,\n\n${data.message}\n\nWhat I need: ${data.needs}\n\n${data.name}\n${data.email}`;
      window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(`New project enquiry from ${data.name}`)}&body=${encodeURIComponent(body)}`;
      sent('Message ready', `Your email app should open with everything filled in. Just press send. If nothing opened, email ${site.email}.`);
      return;
    }

    sendLabel.textContent = 'Sending…';
    status.classList.remove('is-error');
    status.textContent = '';
    try {
      const res = await fetch(site.formEndpoint, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, _subject: `New project enquiry from ${data.name}` }),
      });
      if (!res.ok) throw new Error(String(res.status));
      sent('Message sent', 'Thanks! Your message is in, and the reply will come to your email.');
    } catch {
      sendLabel.textContent = 'Send message';
      status.classList.add('is-error');
      status.innerHTML = `The message didn't go through. Try again, or email <a href="mailto:${esc(site.email)}">${esc(site.email)}</a>.`;
    }
  });

  function sent(title, text) {
    const box = document.createElement('div');
    box.className = 'form-sent';
    box.setAttribute('role', 'status');
    box.innerHTML = `
      <svg class="form-sent__icon" viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="34"/><path d="M23 37l9 9 18-20"/></svg>
      <h3>${esc(title)}</h3>
      <p>${esc(text)}</p>
      <button class="btn btn--line btn--small" type="button" data-cursor="link"><span>Write another</span></button>`;
    form.hidden = true;
    form.after(box);
    if (!env.reducedMotion) {
      gsap.from(box.querySelector('circle'), { drawSVG: '0%', duration: 1, ease: 'expo.inOut' });
      gsap.from(box.querySelector('path'), { drawSVG: '0%', duration: 0.6, ease: 'power2.out', delay: 0.6 });
      gsap.from(box.children, { y: 16, opacity: 0, stagger: 0.08, duration: 0.8, ease: 'expo.out', delay: 0.2 });
    }
    box.querySelector('button').addEventListener('click', () => {
      box.remove();
      form.reset();
      form.hidden = false;
      sendLabel.textContent = 'Send message';
      fields.name.el.focus();
    });
  }
}
