/* Diputados Bonaerenses · Maqueta · JS vanilla, sin dependencias */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;

  /* Toast (también para enlaces que no existen en la maqueta) */
  const tEl = $('.toast'); let tt;
  const toast = msg => { if (!tEl) return; tEl.textContent = msg; tEl.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(() => tEl.classList.remove('is-on'), 2600); };
  document.addEventListener('click', e => {
    const a = e.target.closest('a[data-stub]'); if (!a) return;
    e.preventDefault(); toast(a.dataset.stub || 'Esta página no está incluida en la maqueta.');
  });

  /* Header compacto + volver arriba + barra de compartir (se oculta al bajar, reaparece al subir) */
  const hdr = $('.hdr'), top = $('.totop'), bar = $('.sharebar');
  let lastY = scrollY, tick = false;
  const onScroll = () => {
    const y = scrollY;
    hdr?.classList.toggle('is-compact', y > 60);
    top?.classList.toggle('is-on', y > innerHeight * 1.5);
    if (bar) { if (y > lastY + 6 && y > 200) bar.classList.add('is-hidden'); else if (y < lastY - 6 || y < 200) bar.classList.remove('is-hidden'); }
    lastY = y; tick = false;
  };
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  top?.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  /* Menú: panel a pantalla completa en mobile/tablet */
  const nav = $('#nav'), burger = $('.burger'), search = $('.search');
  const setNav = open => {
    nav.classList.toggle('is-open', open); burger.setAttribute('aria-expanded', open);
    body.style.overflow = open ? 'hidden' : '';
    if (open) $('.nav ul a', nav)?.focus(); else burger.focus({ preventScroll: true });
  };
  if (nav && burger) {
    burger.addEventListener('click', () => setNav(true));
    $('.nav__close', nav)?.addEventListener('click', () => setNav(false));
    addEventListener('keydown', e => { if (e.key === 'Escape') { if (nav.classList.contains('is-open')) setNav(false); search?.classList.remove('is-open'); } });
    matchMedia('(min-width:1024px)').addEventListener('change', e => { if (e.matches) { nav.classList.remove('is-open'); body.style.overflow = ''; } });
  }

  /* Buscador */
  $('.js-search')?.addEventListener('click', e => {
    const o = search.classList.toggle('is-open'); e.currentTarget.setAttribute('aria-expanded', o);
    if (o) $('input', search).focus();
  });
  $$('form[role=search]').forEach(f => f.addEventListener('submit', e => { e.preventDefault(); toast('El buscador real se conecta en el Hito 2.'); }));

  /* Última hora (apagada por defecto): un titular por vez */
  const tl = $('.lasthour__list');
  if (tl) {
    const items = $$('.lasthour__item', tl); let i = 0;
    items[0]?.classList.add('is-active');
    if (!reduce) setInterval(() => { if (!body.classList.contains('show-lasthour')) return; items[i].classList.remove('is-active'); i = (i + 1) % items.length; items[i].classList.add('is-active'); }, 4500);
  }

  /* Copiar link */
  document.addEventListener('click', e => {
    const b = e.target.closest('.js-copy'); if (!b) return;
    const url = new URL(b.dataset.url || location.href, location.href).href;
    (navigator.clipboard?.writeText(url) || Promise.reject()).then(() => toast('Link copiado'), () => toast(url));
  });

  /* "Ver más": revela de a N elementos ocultos (simula carga incremental) */
  $$('.js-more').forEach(btn => {
    const grid = $(btn.dataset.target), step = +btn.dataset.step || 4;
    const left = () => $$('.is-extra:not(.is-shown)', grid);
    if (!left().length) btn.parentElement.hidden = true;
    btn.addEventListener('click', () => {
      left().slice(0, step).forEach(el => el.classList.add('is-shown'));
      if (!left().length) btn.parentElement.hidden = true;
    });
  });

  /* Biografía: "Leer más / Leer menos" */
  $$('.js-bio').forEach(btn => {
    const box = $('#' + btn.getAttribute('aria-controls'));
    if (box.scrollHeight <= box.clientHeight + 4) { btn.hidden = true; box.classList.add('is-open'); box.style.maxHeight = 'none'; return; }
    const closed = getComputedStyle(box).maxHeight;
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', open); btn.textContent = open ? 'Leer menos' : 'Leer más';
      box.classList.toggle('is-open', open); box.style.maxHeight = open ? box.scrollHeight + 'px' : closed;
    });
  });

  /* Modulitos: abiertos en tablet/desktop, acordeón cerrado en mobile */
  const mods = $$('details.mod'), mq = matchMedia('(min-width:768px)');
  const setMods = () => mods.forEach(d => { d.open = mq.matches; });
  setMods(); mq.addEventListener('change', setMods);

  /* Filtros de legisladores */
  const fb = $('#f-bloque'), fp = $('#f-partido'), grid = $('#legs');
  if (grid) {
    const cards = $$('.leg', grid), cnt = $('#f-count');
    const apply = () => {
      let v = 0;
      cards.forEach(c => { const ok = (!fb.value || c.dataset.bloque === fb.value) && (!fp.value || c.dataset.partido === fp.value); c.hidden = !ok; v += ok; });
      cnt.textContent = `${v} ${v === 1 ? 'legislador' : 'legisladores'}`;
    };
    fb.addEventListener('change', apply); fp.addEventListener('change', apply);
    $('#f-reset').addEventListener('click', () => { fb.value = fp.value = ''; apply(); });
    apply();
  }

  /* Panel de decisiones: ?demo=1 (queda activo durante la sesión para recorrer los flujos) */
  let demo = new URLSearchParams(location.search).get('demo') === '1';
  try { if (demo) sessionStorage.setItem('demo', '1'); else demo = sessionStorage.getItem('demo') === '1'; } catch (e) {}
  if (demo) {
    let st = {}; try { st = JSON.parse(sessionStorage.getItem('demoState') || '{}'); } catch (e) {}
    const save = () => { try { sessionStorage.setItem('demoState', JSON.stringify(st)); } catch (e) {} };
    const rows = [
      ['font', 'Fuente de titulares', [['a', 'Source Serif 4'], ['b', 'Merriweather']], v => body.dataset.font = v, 'a'],
      ['lh', 'Franja "Última hora"', [['0', 'Ocultar'], ['1', 'Mostrar']], v => body.classList.toggle('show-lasthour', v === '1'), '0'],
      ['tb', 'Banner superior', [['0', 'Apagado'], ['1', 'Encendido']], v => body.classList.toggle('show-topbanner', v === '1'), '0'],
      ['aside', 'Columna lateral de la nota', [['a', 'A · Anunciantes'], ['b', 'B · + Lo último']], v => body.dataset.aside = v, 'a'],
      ['lee', '"Leé también"', [['2', '2 columnas'], ['4', '4 columnas']], v => body.dataset.lee = v, '2'],
    ];
    const box = document.createElement('div'); box.className = 'demo';
    box.innerHTML = '<div class="demo__box" id="demo-box"><h2>Panel de decisiones</h2></div><button class="demo__btn" type="button" aria-expanded="false" aria-controls="demo-box">Decisiones</button>';
    const inner = $('.demo__box', box);
    rows.forEach(([k, label, opts, fn, def]) => {
      const row = document.createElement('div'); row.className = 'demo__row'; row.innerHTML = `<span>${label}</span><div class="demo__opts">${opts.map(([v, t]) => `<button type="button" data-v="${v}">${t}</button>`).join('')}</div>`;
      const apply = v => { st[k] = v; fn(v); $$('button', row).forEach(b => b.setAttribute('aria-pressed', b.dataset.v === v)); save(); };
      row.addEventListener('click', e => { const b = e.target.closest('button'); if (b) apply(b.dataset.v); });
      apply(st[k] ?? def); inner.appendChild(row);
    });
    $('.demo__btn', box).addEventListener('click', e => { const o = box.classList.toggle('is-open'); e.currentTarget.setAttribute('aria-expanded', o); });
    body.appendChild(box);
  }
})();
