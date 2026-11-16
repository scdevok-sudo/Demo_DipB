/* Diputados Bonaerenses · Maqueta · carrusel de legisladores y rotador de Anunciantes.
   Se carga después del evento load para no competir con la imagen principal. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Carrusel de legisladores: swipe nativo (scroll-snap) + autoavance, pausa al hover/toque, flechas, loop ---- */
  $$('.lcar').forEach(c => {
    const track = $('.lcar__track', c), items = $$('.lcar__item', track), n = items.length, cnt = $('.lcar__count', c);
    items.forEach(it => { const cl = it.cloneNode(true); cl.setAttribute('aria-hidden', 'true'); cl.tabIndex = -1; track.appendChild(cl); });
    const gap = () => parseFloat(getComputedStyle(track).columnGap) || 16;
    const step = () => items[0].getBoundingClientRect().width + gap();
    const half = () => step() * n;
    let hold = 0, seen = true;
    const go = d => {
      if (d < 0 && track.scrollLeft < step() * -d) track.scrollLeft += half();
      else if (track.scrollLeft >= half()) track.scrollLeft -= half();
      track.scrollBy({ left: d * step(), behavior: reduce ? 'auto' : 'smooth' });
    };
    const pause = (ms = 7000) => { hold = Date.now() + ms; };
    let raf = 0;
    track.addEventListener('scroll', () => {
      if (raf) return; raf = requestAnimationFrame(() => {
        raf = 0; const i = Math.round(track.scrollLeft / step()) % n;
        if (cnt) cnt.textContent = `${i + 1} de ${n}`;
      });
    }, { passive: true });
    $('.lcar__btn--p', c)?.addEventListener('click', () => { pause(); go(-3); });
    $('.lcar__btn--n', c)?.addEventListener('click', () => { pause(); go(3); });
    ['pointerdown', 'touchstart', 'wheel', 'focusin'].forEach(ev => c.addEventListener(ev, () => pause(), { passive: true }));
    c.addEventListener('mouseenter', () => pause(3600000));
    c.addEventListener('mouseleave', () => pause(2500));
    new IntersectionObserver(e => { seen = e[0].isIntersecting; }, { threshold: .2 }).observe(c);
    if (!reduce) setInterval(() => { if (!seen || document.hidden || Date.now() < hold) return; go(1); }, 2600);
    if (cnt) cnt.textContent = `1 de ${n}`;
  });

  /* ---- Anunciantes: los slots de la zona rotan juntos (cada ~5 s), un solo juego de puntos, pausa al tocar/hover ---- */
  $$('.adz').forEach(z => {
    const slots = $$('.adr', z).map(r => ({ r, slides: $$('.adr__slide', r) }));
    const n = Math.max(...slots.map(s => s.slides.length)), g = +z.dataset.group || n;
    const ms = +z.dataset.interval || 5000, dots = $('.adz__dots', z);
    let i = 0, hold = 0, seen = false;
    const vis = () => slots.filter(s => s.r.offsetParent);
    const load = k => { if (!seen) return; vis().forEach(s => { const im = $('img', s.slides[k % s.slides.length]); if (im && im.dataset.src) { im.src = im.dataset.src; delete im.dataset.src; } }); };
    const go = k => {
      i = (k + n) % n;
      slots.forEach(s => s.slides.forEach((sl, q) => { const on = q === i % s.slides.length; sl.classList.toggle('is-active', on); sl.setAttribute('aria-hidden', !on); }));
      load(i); load(i + 1);
      if (dots) {
        const gi = Math.floor(i / g), pos = i % g, size = Math.min(g, n - gi * g);
        dots.innerHTML = '';
        const ar = (d, t, path) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'adr__arrow'; b.setAttribute('aria-label', t); b.innerHTML = `<svg viewBox="0 0 24 24"><path d="${path}"/></svg>`; b.addEventListener('click', () => { hold = Date.now() + 10000; go(i + d); }); return b; };
        dots.appendChild(ar(-1, 'Banner anterior', 'm15 5-7 7 7 7'));
        for (let d = 0; d < size; d++) {
          const b = document.createElement('button'); b.type = 'button'; b.className = 'adr__dot';
          b.setAttribute('aria-label', `Banner ${d + 1} de ${size}`); if (d === pos) b.setAttribute('aria-current', 'true');
          b.addEventListener('click', () => { hold = Date.now() + 10000; go(gi * g + d); });
          dots.appendChild(b);
        }
        dots.appendChild(ar(1, 'Banner siguiente', 'm9 5 7 7-7 7'));
      }
    };
    go(0);
    new IntersectionObserver((e, io) => { if (e[0].isIntersecting) { seen = true; load(i); load(i + 1); io.disconnect(); } }, { rootMargin: '300px' }).observe(z);
    addEventListener('resize', () => load(i), { passive: true });
    if (!reduce && n > 1) setInterval(() => { if (!z.offsetParent || Date.now() < hold || document.hidden || !seen) return; go(i + 1); }, ms);
    const pause = () => { hold = Date.now() + 12000; };
    /* deslizar con el dedo (mobile): un gesto horizontal pasa al banner siguiente o anterior */
    let x0 = null, y0 = 0;
    z.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    z.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null; if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) { hold = Date.now() + 12000; go(i + (dx < 0 ? 1 : -1)); } }, { passive: true });
    ['pointerdown', 'mouseenter', 'focusin'].forEach(ev => z.addEventListener(ev, pause, { passive: true }));
  });
})();
