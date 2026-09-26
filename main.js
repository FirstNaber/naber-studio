(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // reveal on scroll
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('[data-rv]').forEach((el) => io.observe(el));

  // hero: the storefront tilts with the pointer, sales notifications arrive in turn
  const win = document.querySelector('.window');
  const site = document.querySelector('.site');
  if (win && site && !reduce) {
    win.addEventListener('pointermove', (e) => {
      const r = win.getBoundingClientRect();
      site.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 8}deg`);
      site.style.setProperty('--rx', `${-((e.clientY - r.top) / r.height - 0.5) * 6}deg`);
    });
    win.addEventListener('pointerleave', () => { site.style.setProperty('--ry', '0deg'); site.style.setProperty('--rx', '0deg'); });
  }
  const toasts = [...document.querySelectorAll('.toast')];
  if (toasts.length) {
    if (reduce) toasts.forEach((t) => t.classList.add('on'));
    else {
      let i = 0;
      const step = () => {
        if (i < toasts.length) { toasts[i++].classList.add('on'); setTimeout(step, 1400); }
        else setTimeout(() => { toasts.forEach((t) => t.classList.remove('on')); i = 0; setTimeout(step, 900); }, 4200);
      };
      setTimeout(step, 700);
    }
  }

  // footer year
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
