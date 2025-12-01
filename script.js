(function () {
  const btn = document.getElementById('theme-toggle');
  const body = document.body;
  const STORAGE_KEY = 'preferred-theme-dark';


  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'true') {
    body.classList.add('dark');
    btn.setAttribute('aria-pressed', 'true');
  } else {
    body.classList.remove('dark');
    btn.setAttribute('aria-pressed', 'false');
  }

  btn.addEventListener('click', function () {
    const enabled = body.classList.toggle('dark');
    btn.setAttribute('aria-pressed', String(enabled));

    localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
  });
})();
