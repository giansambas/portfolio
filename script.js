// script.js — force inline styles on the toggle so other CSS can't override it
(function () {
  const TOGGLE_ID = 'theme-toggle';
  const STORAGE_KEY = 'preferred-theme-dark';
  const TRANSITION_CLASS = 'theme-transition';
  const TRANSITION_MS = 420;

  const btn = document.getElementById(TOGGLE_ID);
  const body = document.body;
  if (!btn || !body) return;

  // ensure decorative icon exists
  if (!btn.querySelector('.icon')) {
    const icon = document.createElement('span');
    icon.className = 'icon';
    icon.setAttribute('aria-hidden', 'true');
    btn.insertBefore(icon, btn.firstChild);
  }

  function setAria(pressed) {
    btn.setAttribute('aria-pressed', String(pressed));
  }

  // read a CSS variable from root, fallback to provided value
  function cssVar(name, fallback = '') {
    const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return val || fallback;
  }

  // apply the inline styles for the button according to current CSS variables
  function applyButtonInlineStyles() {
    // read the variables from computed style
    const bg = cssVar('--toggle-bg', '#000000');
    const text = cssVar('--toggle-text', '#ffffff');

    // set inline style (highest priority)
    btn.style.background = bg;
    btn.style.color = text;
    // ensure any background-image/gradient is removed
    btn.style.backgroundImage = 'none';
    // ensure icon matches
    const icon = btn.querySelector('.icon');
    if (icon) icon.style.background = text;
  }

  function applyTheme(isDark, skipSave = false) {
    if (isDark) body.classList.add('dark');
    else body.classList.remove('dark');

    setAria(isDark);
    // write inline styles so nothing in CSS overrides the look
    applyButtonInlineStyles();

    if (!skipSave) {
      try { localStorage.setItem(STORAGE_KEY, isDark ? 'true' : 'false'); } catch (e) {}
    }
  }

  function withTransition(cb) {
    body.classList.add(TRANSITION_CLASS);
    window.clearTimeout(body._themeTimeout);
    body._themeTimeout = window.setTimeout(() => {
      body.classList.remove(TRANSITION_CLASS);
      body._themeTimeout = null;
    }, TRANSITION_MS);
    cb();
  }

  // init
  let saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { saved = null; }
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialIsDark = saved === 'true' ? true : (saved === 'false' ? false : prefersDark);

  // apply initial theme and inline styles (don't overwrite storage)
  applyTheme(initialIsDark, true);

  // ensure button inline styles reflect computed variables on load (in case CSS loads late)
  window.addEventListener('load', applyButtonInlineStyles);
  // also refresh inline styles when resize (some environments recalc vars)
  window.addEventListener('resize', applyButtonInlineStyles);

  btn.addEventListener('click', () => {
    const isDarkNow = body.classList.contains('dark');
    const toDark = !isDarkNow;
    withTransition(() => applyTheme(toDark));
    // icon nudge
    const icon = btn.querySelector('.icon');
    if (icon) {
      icon.style.transform = 'scale(0.86) translateY(1px)';
      window.setTimeout(() => (icon.style.transform = ''), 160);
    }
  });

  // follow system preference when user hasn't saved a choice
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      try {
        const hasSaved = localStorage.getItem(STORAGE_KEY) !== null;
        if (!hasSaved) withTransition(() => applyTheme(e.matches, true));
      } catch (err) {}
    };
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else if (mq.addListener) mq.addListener(handler);
  }
})();
