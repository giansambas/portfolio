// script.js — improved theme toggle with memory, safety, and smooth transition
(function () {
  const TOGGLE_ID = 'theme-toggle';
  const STORAGE_KEY = 'preferred-theme-dark';
  const TRANSITION_CLASS = 'theme-transition';
  const TRANSITION_MS = 420;

  const btn = document.getElementById(TOGGLE_ID);
  const body = document.body;

  if (!btn || !body) return; // safe guard

  // add decorative icon element inside the button (keeps visible label "Switch Theme")
  // If the button already has an .icon child, don't add a duplicate.
  if (!btn.querySelector('.icon')) {
    const icon = document.createElement('span');
    icon.className = 'icon';
    icon.setAttribute('aria-hidden', 'true');
    // keep label text unchanged; icon is purely visual
    btn.insertBefore(icon, btn.firstChild);
  }

  // set ARIA initial state helper
  function setAria(pressed) {
    btn.setAttribute('aria-pressed', String(pressed));
  }

  // apply theme based on boolean (true => dark)
  function applyTheme(isDark, skipSave = false) {
    // toggle class on body
    if (isDark) body.classList.add('dark');
    else body.classList.remove('dark');

    setAria(isDark);

    if (!skipSave) {
      try {
        localStorage.setItem(STORAGE_KEY, isDark ? 'true' : 'false');
      } catch (e) {
        // ignore storage errors (e.g. privacy mode)
      }
    }
  }

  // create a brief transition effect for a smoother color swap
  function withTransition(cb) {
    body.classList.add(TRANSITION_CLASS);
    window.clearTimeout(body._themeTimeout);
    body._themeTimeout = window.setTimeout(() => {
      body.classList.remove(TRANSITION_CLASS);
      body._themeTimeout = null;
    }, TRANSITION_MS);
    cb();
  }

  // read saved preference, otherwise respect system preference
  let saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    saved = null;
  }

  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialIsDark = saved === 'true' ? true : (saved === 'false' ? false : prefersDark);

  // apply initial theme (don't overwrite storage if none)
  applyTheme(initialIsDark, true);

  // click handler toggles theme, stores choice, and shows a beautiful transition
  btn.addEventListener('click', () => {
    const isDarkNow = body.classList.contains('dark');
    const toDark = !isDarkNow;

    withTransition(() => applyTheme(toDark));

    // tiny micro-animation for icon (visual feedback)
    const icon = btn.querySelector('.icon');
    if (icon) {
      icon.style.transform = 'scale(0.86) translateY(1px)';
      window.setTimeout(() => (icon.style.transform = ''), 160);
    }
  });

  // also respond to system preference changes (only if user hasn't explicitly saved a choice)
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener?.('change', (e) => {
      // only auto-switch if user hasn't saved a choice
      try {
        const hasSaved = localStorage.getItem(STORAGE_KEY) !== null;
        if (!hasSaved) {
          withTransition(() => applyTheme(e.matches, true));
        }
      } catch (err) {
        // ignore
      }
    });
  }
})();
