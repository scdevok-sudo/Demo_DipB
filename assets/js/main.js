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

  /* Fecha del día en la franja de la cabecera (se actualiza sola, en español) */
  $$('[data-hoy]').forEach(t => {
    const f = new Intl.DateTimeFormat('es-AR', { dateStyle: 'full' }).format(new Date()).replace(',', '');
    t.textContent = f.charAt(0).toUpperCase() + f.slice(1);
  });

  /* Buscador */
  $$('.js-search').forEach(b => b.addEventListener('click', () => {
    const o = search.classList.toggle('is-open'); $$('.js-search').forEach(x => x.setAttribute('aria-expanded', o));
    if (o) $('input', search).focus();
  }));
  $$('form[role=search]').forEach(f => f.addEventListener('submit', e => { e.preventDefault(); toast('El buscador real se conecta en el Hito 2.'); }));

  /* Última hora (apagada por defecto): un titular por vez */
  const tl = $('.lasthour__list');
  if (tl) {
    const items = $$('.lasthour__item', tl); let i = 0;
    items[0]?.classList.add('is-active');
    if (!reduce) setInterval(() => { if (document.documentElement.dataset.hora !== 'on') return; items[i].classList.remove('is-active'); i = (i + 1) % items.length; items[i].classList.add('is-active'); }, 4500);
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

  /* Scroll infinito de la sección interna: IntersectionObserver + esqueleto con altura reservada + botón de respaldo */
  const sflow = $('#sflow'), tpl = $('#sec-tpl'), more = $('#sec-more');
  if (sflow && tpl && more) {
    const pending = [...tpl.content.children]; const chunk = +more.dataset.chunk || 10;
    let busy = false;
    const sk = () => { const d = document.createElement('div'); d.className = 'srow srow--skel'; d.setAttribute('aria-hidden', 'true'); d.innerHTML = '<div><span class="skel skel--t"></span><span class="skel skel--l"></span><span class="skel skel--l" style="width:60%"></span></div><span class="skel skel--i"></span>'; return d; };
    const load = () => {
      if (busy || !pending.length) return; busy = true;
      const s1 = sk(); sflow.appendChild(s1);
      setTimeout(() => {
        let n = 0; const frag = document.createDocumentFragment();
        while (pending.length && n < chunk) { const el = pending.shift(); frag.appendChild(el); if (!el.classList.contains('srow-ad')) n++; }
        while (pending[0] && pending[0].classList.contains('srow-ad')) frag.appendChild(pending.shift());
        s1.replaceWith(frag); busy = false;
        if (!pending.length) { more.hidden = true; io.disconnect(); } else if (more.getBoundingClientRect().top < innerHeight + 600) load();
      }, reduce ? 0 : 450);
    };
    const io = new IntersectionObserver(e => { if (e[0].isIntersecting) load(); }, { rootMargin: '600px 0px' });
    io.observe(more);
    $('.js-infinite', more).addEventListener('click', load);
  }

  /* Panel de variantes: ?demo=1 (queda activo durante la sesión). Cada control cambia <html data-*> y se recuerda; "Copiar link" arma la URL con la variante. */
  let demo = new URLSearchParams(location.search).get('demo') === '1';
  try { if (demo) sessionStorage.setItem('demo', '1'); else demo = sessionStorage.getItem('demo') === '1'; } catch (e) {}
  if (demo) {
    const root = document.documentElement;
    const rows = [
      ['super', 'Superdestacada', [['off', 'Sin ella'], ['foto', 'A · foto'], ['texto', 'B · texto'], ['2', '2'], ['3', '3']]],
      ['tapa', 'Foto de la nota fuerte', [['izq', 'Izquierda'], ['der', 'Derecha']]],
      ['legis', 'Diputados y Senadores', [['a', 'A · tras la tapa'], ['b', 'B · en el medio']]],
      ['m1', 'Módulo 1', [['2x2', '2×2'], ['4x1', '4 en fila']]],
      ['m1bajada', 'Módulo 1: bajada', [['on', 'Con'], ['off', 'Sin']]],
      ['m2', 'Módulo 2', [['1', 'Posibilidad 1'], ['2', 'Posibilidad 2'], ['alt', 'Alternar']]],
      ['ad', 'Banner 1180×90', [['on', 'Sí'], ['off', 'No']]],
      ['fondos', 'Fondos alternados', [['on', 'Sí'], ['off', 'No']]],
      ['fotos', 'Fotos de legisladores', [['ejemplo', 'Ejemplo'], ['iniciales', 'Iniciales']]],
      ['font', 'Tipografía', [['a', 'Source Serif 4'], ['b', 'Merriweather']]],
      ['hora', '"Última hora"', [['off', 'No'], ['on', 'Sí']]],
      ['diario', 'Detalles de diario', [['on', 'Con'], ['off', 'Sin']]],
      ['credito', 'Crédito de foto', [['on', 'Sí'], ['off', 'No']]],
    ];
    const box = document.createElement('div'); box.className = 'demo';
    box.innerHTML = '<div class="demo__box" id="demo-box"><h2>Variantes</h2></div><button class="demo__btn" type="button" aria-expanded="false" aria-controls="demo-box">Variantes</button>';
    const inner = $('.demo__box', box);
    const sync = () => $$('.demo__row', inner).forEach(r => $$('button', r).forEach(b => b.setAttribute('aria-pressed', root.getAttribute('data-' + r.dataset.k) === b.dataset.v)));
    const store = () => { try { const S = {}; rows.forEach(([k]) => { S[k] = root.getAttribute('data-' + k); }); sessionStorage.setItem('dbv', JSON.stringify(S)); } catch (e) {} };
    rows.forEach(([k, label, opts]) => {
      const row = document.createElement('div'); row.className = 'demo__row'; row.dataset.k = k;
      row.innerHTML = '<span>' + label + '</span><div class="demo__opts">' + opts.map(([v, t]) => '<button type="button" data-v="' + v + '">' + t + '</button>').join('') + '</div>';
      row.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; root.setAttribute('data-' + k, b.dataset.v); store(); sync(); });
      inner.appendChild(row);
    });
    const acts = document.createElement('div'); acts.className = 'demo__acts';
    acts.innerHTML = '<button type="button" data-a="copy">Copiar link de esta variante</button><button type="button" data-a="reset">Restablecer</button>';
    acts.addEventListener('click', e => {
      const bt = e.target.closest('button'); const a = bt && bt.dataset.a; if (!a) return;
      if (a === 'reset') { try { sessionStorage.removeItem('dbv'); } catch (x) {} location.href = location.pathname + '?demo=1&reset=1'; return; }
      const u = new URL(location.href); u.search = ''; u.searchParams.set('demo', '1'); rows.forEach(([k]) => u.searchParams.set(k, root.getAttribute('data-' + k)));
      (navigator.clipboard ? navigator.clipboard.writeText(u.href) : Promise.reject()).then(() => toast('Link de la variante copiado'), () => toast(u.href));
    });
    inner.appendChild(acts);
    $('.demo__btn', box).addEventListener('click', e => { const o = box.classList.toggle('is-open'); e.currentTarget.setAttribute('aria-expanded', o); });
    body.appendChild(box); sync();
  }
})();
