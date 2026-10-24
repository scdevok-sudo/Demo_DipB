/* Diputados Bonaerenses · Maqueta Hito 1 · JS vanilla, sin dependencias */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header compacto al scrollear */
  const hdr = $('.hdr');
  if (hdr) {
    let t = false;
    addEventListener('scroll', () => {
      if (t) return; t = true;
      requestAnimationFrame(() => { hdr.classList.toggle('is-compact', scrollY > 60); t = false; });
    }, { passive: true });
  }

  /* Menú móvil (cajón) */
  const nav = $('#nav'), scrim = $('.scrim'), burger = $('.burger');
  const setNav = open => {
    nav.classList.toggle('is-open', open); scrim.classList.toggle('is-on', open);
    burger.setAttribute('aria-expanded', open); document.body.style.overflow = open ? 'hidden' : '';
    if (open) $('a', nav).focus();
  };
  if (burger) {
    burger.addEventListener('click', () => setNav(true));
    scrim.addEventListener('click', () => setNav(false));
    $('.nav__close', nav).addEventListener('click', () => { setNav(false); burger.focus(); });
    addEventListener('keydown', e => { if (e.key === 'Escape') { setNav(false); search?.classList.remove('is-open'); } });
  }

  /* Buscador */
  const search = $('.search');
  $('.js-search')?.addEventListener('click', e => {
    const o = search.classList.toggle('is-open'); e.currentTarget.setAttribute('aria-expanded', o);
    if (o) $('input', search).focus();
  });
  search?.addEventListener('submit', e => { e.preventDefault(); toast('El buscador real se conecta en el Hito 2.'); });

  /* Toast para enlaces que no existen en la maqueta */
  const tEl = $('.toast'); let tt;
  function toast(msg) { if (!tEl) return; tEl.textContent = msg; tEl.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(() => tEl.classList.remove('is-on'), 2600); }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[data-stub]'); if (!a) return;
    e.preventDefault(); toast(a.dataset.stub || 'Esta página no está incluida en la maqueta del Hito 1.');
  });

  /* Última hora: una titular por vez, sobrio */
  const tick = $('.tick__list');
  if (tick) {
    const items = $$('.tick__item', tick); let i = 0, timer;
    const show = n => { items[i].classList.remove('is-active'); i = (n + items.length) % items.length; items[i].classList.add('is-active'); };
    const play = () => { if (!reduce) timer = setInterval(() => show(i + 1), 4500); };
    items[0].classList.add('is-active'); play();
    $('.tick').addEventListener('mouseenter', () => clearInterval(timer));
    $('.tick').addEventListener('mouseleave', () => { clearInterval(timer); play(); });
    $('.js-tprev')?.addEventListener('click', () => show(i - 1));
    $('.js-tnext')?.addEventListener('click', () => show(i + 1));
  }

  /* Filtros de legisladores */
  const fb = $('#f-bloque'), fp = $('#f-partido'), grid = $('#legs');
  if (grid) {
    const cards = $$('.leg', grid), cnt = $('#f-count');
    const apply = () => {
      let v = 0;
      cards.forEach(c => {
        const ok = (!fb.value || c.dataset.bloque === fb.value) && (!fp.value || c.dataset.partido === fp.value);
        c.hidden = !ok; v += ok;
      });
      cnt.textContent = `${v} ${v === 1 ? 'legislador' : 'legisladores'}`;
    };
    fb.addEventListener('change', apply); fp.addEventListener('change', apply);
    $('#f-reset').addEventListener('click', () => { fb.value = fp.value = ''; apply(); });
    apply();
  }
})();
