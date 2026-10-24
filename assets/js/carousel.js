/* Diputados Bonaerenses · Maqueta Hito 1 · carruseles, rotador de publicidad y lazy-load.
   Se carga después del evento load para no competir con la imagen principal. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* Carga diferida real: las imágenes con data-src se cargan recién al acercarse a la pantalla */
  const lazy = $$('img[data-src]:not(.adr__slide img)');
  const fill = im => { if (im.dataset.srcset) im.srcset = im.dataset.srcset; im.src = im.dataset.src; delete im.dataset.src; delete im.dataset.srcset; };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); fill(e.target); } }), { rootMargin: '200px 100px' });
    lazy.forEach(im => io.observe(im));
  } else lazy.forEach(fill);

  /* Carrusel horizontal de noticias */
  $$('.rail').forEach(r => {
    const tr = $('.rail__track', r), step = () => (tr.firstElementChild?.getBoundingClientRect().width || 300) + 14;
    $('.js-rprev', r)?.addEventListener('click', () => tr.scrollBy({ left: -step(), behavior: 'smooth' }));
    $('.js-rnext', r)?.addEventListener('click', () => tr.scrollBy({ left: step(), behavior: 'smooth' }));
  });

  /* Rotador de publicidad: un solo slot, grupos de N, pausa al tocar */
  $$('.adr').forEach(r => {
    const slides = $$('.adr__slide', r), n = slides.length, g = +r.dataset.group || n;
    const ms = +r.dataset.interval || 5000, dots = $('.adr__dots', r), meta = $('.adr__meta', r);
    let i = 0, timer, hold = 0, seen = false;
    const load = k => { if (!seen) return; const im = $('img', slides[k % n]); if (im && im.dataset.src) { im.src = im.dataset.src; delete im.dataset.src; } };
    const go = k => {
      slides[i].classList.remove('is-active'); slides[i].setAttribute('aria-hidden', 'true');
      i = (k + n) % n; if (r.offsetParent) { load(i); load(i + 1); }
      slides[i].classList.add('is-active'); slides[i].removeAttribute('aria-hidden');
      if (dots) {
        const gi = Math.floor(i / g), pos = i % g, size = Math.min(g, n - gi * g);
        dots.innerHTML = '';
        for (let d = 0; d < size; d++) {
          const b = document.createElement('button'); b.type = 'button'; b.className = 'adr__dot';
          b.setAttribute('aria-label', `Banner ${d + 1} de ${size}`); if (d === pos) b.setAttribute('aria-current', 'true');
          b.addEventListener('click', () => { hold = Date.now() + 10000; go(gi * g + d); });
          dots.appendChild(b);
        }
        if (meta) meta.textContent = `Grupo ${gi + 1} de ${Math.ceil(n / g)}`;
      }
    };
    slides.forEach((s, k) => k && s.setAttribute('aria-hidden', 'true'));
    go(0);
    new IntersectionObserver((e, io) => { if (e[0].isIntersecting) { seen = true; load(i); load(i + 1); io.disconnect(); } }, { rootMargin: '300px' }).observe(r);
    if (!r.offsetParent) addEventListener('resize', () => { if (r.offsetParent) load(i); }, { passive: true });
    const tickFn = () => { if (!r.offsetParent || Date.now() < hold || document.hidden) return; if (!seen) return; if ($('img[data-src]', slides[i])) { load(i); return; } go(i + 1); };
    if (!reduce && n > 1) timer = setInterval(tickFn, ms);
    const pause = () => { hold = Date.now() + 12000; };
    r.addEventListener('pointerdown', pause); r.addEventListener('mouseenter', pause);
    r.addEventListener('mousemove', pause); r.addEventListener('focusin', pause);
  });

})();
