(() => {
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
  };

  /* Language */
  const EN = window.I18N_EN || {};
  const nodes = {
    text: [...document.querySelectorAll('[data-i18n]')],
    html: [...document.querySelectorAll('[data-i18n-html]')],
    alt: [...document.querySelectorAll('[data-i18n-alt]')],
  };
  const metaDesc = document.querySelector('meta[name="description"]');
  const ES = {
    _title: document.title,
    _description: metaDesc ? metaDesc.content : '',
  };
  nodes.text.forEach((el) => { ES[el.dataset.i18n] = el.textContent; });
  nodes.html.forEach((el) => { ES[el.dataset.i18nHtml] = el.innerHTML; });
  nodes.alt.forEach((el) => { ES[el.dataset.i18nAlt] = el.alt; });

  const toggle = document.getElementById('langToggle');

  function applyLang(lang) {
    const dict = lang === 'en' ? EN : ES;
    const pick = (key) => (dict[key] !== undefined ? dict[key] : ES[key]);
    nodes.text.forEach((el) => { el.textContent = pick(el.dataset.i18n); });
    nodes.html.forEach((el) => { el.innerHTML = pick(el.dataset.i18nHtml); });
    nodes.alt.forEach((el) => { el.alt = pick(el.dataset.i18nAlt); });
    document.documentElement.lang = lang;
    document.title = pick('_title');
    if (metaDesc) metaDesc.content = pick('_description');
    toggle.textContent = lang === 'en' ? 'ES' : 'EN';
    toggle.setAttribute('aria-label', lang === 'en' ? 'Cambiar a español' : 'Switch to English');
    document.documentElement.dataset.lang = lang;
  }

  const browserLang = (navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en';
  let lang = store.get('lang') || browserLang;
  if (lang !== 'es' && lang !== 'en') lang = 'es';
  if (lang === 'en') applyLang('en');
  else document.documentElement.dataset.lang = 'es';

  toggle.addEventListener('click', () => {
    lang = lang === 'en' ? 'es' : 'en';
    applyLang(lang);
    store.set('lang', lang);
  });

  /* Mobile menu */
  const menuBtn = document.getElementById('menuToggle');
  const links = document.getElementById('navLinks');
  const setMenu = (open) => {
    menuBtn.setAttribute('aria-expanded', String(open));
    links.classList.toggle('is-open', open);
    document.getElementById('nav').classList.toggle('menu-open', open);
  };
  menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  links.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* Nav: background after the hero and contrast with the section underneath */
  const nav = document.getElementById('nav');
  const tones = [...document.querySelectorAll('main > section')];
  let ticking = false;
  function updateNav() {
    ticking = false;
    nav.classList.toggle('is-scrolled', window.scrollY > 24);
    const probe = nav.offsetHeight / 2;
    const under = tones.find((s) => {
      const r = s.getBoundingClientRect();
      return r.top <= probe && r.bottom > probe;
    });
    const light = under && (under.classList.contains('tone-moon') || under.classList.contains('tone-paper'));
    nav.dataset.tone = light ? 'light' : 'dark';
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(updateNav); }
  }, { passive: true });
  updateNav();

  /* Current section in nav */
  const navAnchors = [...links.querySelectorAll('a')];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navAnchors.forEach((a) => {
        a.toggleAttribute('aria-current', a.getAttribute('href') === '#' + entry.target.id);
        if (a.hasAttribute('aria-current')) a.setAttribute('aria-current', 'true');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['edooly', 'proyectos', 'trayectoria', 'contacto'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) io.observe(el);
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
