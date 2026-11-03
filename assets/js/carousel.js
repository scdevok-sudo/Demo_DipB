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

  /* ---- Rotador de Anunciantes: un slot, grupos de N, pausa al tocar ---- */
  $$('.adr').forEach(r => {
    const slides = $$('.adr__slide', r), n = slides.length, g = +r.dataset.group || n;
    const ms = +r.dataset.interval || 5000, dots = $('.adr__dots', r);
    let i = 0, hold = 0, seen = false;
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
      }
    };
    slides.forEach((s, k) => k && s.setAttribute('aria-hidden', 'true'));
    go(0);
    new IntersectionObserver((e, io) => { if (e[0].isIntersecting) { seen = true; load(i); load(i + 1); io.disconnect(); } }, { rootMargin: '300px' }).observe(r);
    if (!r.offsetParent) addEventListener('resize', () => { if (r.offsetParent) load(i); }, { passive: true });
    if (!reduce && n > 1) setInterval(() => { if (!r.offsetParent || Date.now() < hold || document.hidden || !seen) return; if ($('img[data-src]', slides[i])) { load(i); return; } go(i + 1); }, ms);
    const pause = () => { hold = Date.now() + 12000; };
    ['pointerdown', 'mouseenter', 'focusin'].forEach(ev => r.addEventListener(ev, pause, { passive: true }));
  });
})();
