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
    $$('.js-dock-menu').forEach(b => b.setAttribute('aria-expanded', open));
    body.style.overflow = open ? 'hidden' : '';
    const back = [burger, ...$$('.js-dock-menu')].find(b => b.offsetParent) || burger;
    if (open) $('.nav ul a', nav)?.focus(); else back.focus({ preventScroll: true });
  };
  if (nav && burger) {
    burger.addEventListener('click', () => setNav(true));
    $$('.js-dock-menu').forEach(b => b.addEventListener('click', () => setNav(!nav.classList.contains('is-open'))));
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

  /* Listado de legisladores: buscador por nombre (sin acentos ni mayúsculas) + filtro por bloque + contador */
  const fb = $('#f-bloque'), fn = $('#f-nombre'), grid = $('#legs');
  if (grid) {
    const cards = $$('.leg', grid), cnt = $('#f-count'), empty = $('#legs-empty');
    const norm = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    const apply = () => {
      const q = norm(fn.value); let v = 0;
      cards.forEach(c => { const ok = (!fb.value || c.dataset.bloque === fb.value) && (!q || c.dataset.nombre.includes(q)); c.hidden = !ok; v += ok; });
      cnt.textContent = `${v} ${v === 1 ? 'resultado' : 'resultados'}`; if (empty) empty.hidden = v > 0;
    };
    fb.addEventListener('change', apply); fn.addEventListener('input', apply);
    $('#f-reset').addEventListener('click', () => { fb.value = fn.value = ''; apply(); });
    apply();
  }

  /* Scroll infinito de la sección interna: IntersectionObserver + esqueleto con altura reservada + botón de respaldo */
  const sflow = $('#sflow'), tpl = $('#sec-tpl'), more = $('#sec-more');
  if (sflow && tpl && more) {
    const pending = [...tpl.content.children]; const chunk = +more.dataset.chunk || 10;
    let busy = false;
    /* esqueleto de UN BLOQUE COMPLETO (misma cantidad de filas, misma altura mínima): el footer se corre de una vez, fuera de pantalla, y al reemplazar casi no hay salto */
    const sk = () => { const d = document.createElement('div'); d.className = 'sflow-skel'; d.setAttribute('aria-hidden', 'true'); d.innerHTML = Array(chunk).fill('<div class="srow srow--skel"><div><span class="skel skel--t"></span><span class="skel skel--l"></span><span class="skel skel--l" style="width:60%"></span></div><span class="skel skel--i"></span></div>').join(''); return d; };
    const load = () => {
      if (busy || !pending.length) return; busy = true;
      const s1 = sk(); sflow.appendChild(s1);
      setTimeout(() => {
        let n = 0; const frag = document.createDocumentFragment();
        while (pending.length && n < chunk) { const el = pending.shift(); frag.appendChild(el); if (!el.classList.contains('srow-ad')) n++; }
        while (pending[0] && pending[0].classList.contains('srow-ad')) frag.appendChild(pending.shift());
        s1.replaceWith(frag); busy = false; if (window.initAdz) window.initAdz(sflow);
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
    const root = document.documentElement; root.setAttribute('data-demo', '1');
    const rows = [
      ['home', 'Inicio (desktop)', [['pdf', 'Diseño DB (PDF de Juan)'], ['anterior', 'Anterior']]],
      ['super', 'Superdestacada', [['off', 'Sin ella'], ['1', '1 · foto, 3 notas con flechas'], ['2', '2 · solo texto']]],
      ['texto3', 'Notas de texto en 3 columnas', [['off', 'No'], ['1', 'Sí']]],
      ['grilla4', 'Grilla de 4 columnas', [['off', 'No'], ['1', 'Sí']]],
      ['seccion', 'Etiqueta de sección', [['foto', 'Sobre la foto'], ['abajo', 'Debajo de la foto']]],
      ['etiqueta', 'Etiqueta de sección bajo el título', [['texto', 'Texto gris'], ['caja', 'Caja oscura']]],
      ['header', 'Barra superior y menú', [['prod', 'Oficial (celeste y azul)'], ['actual', 'Navy anterior']]],
      ['tapa2', 'Tapa mobile: notas 2 y 3', [['normal', 'Normales'], ['chica', 'Chicas con foto al costado']]],
      ['tapa', 'Tapa (desktop)', [['texto-izq', 'Texto a la izquierda'], ['foto-izq', 'Foto a la izquierda']]],
      ['vermas', 'Ver más de X', [['flecha', 'Texto con flecha'], ['boton', 'Botón con borde']]],
      ['bajada', 'Bajada (mobile: sin por defecto)', [['auto', 'Auto'], ['on', 'Con'], ['off', 'Sin']]],
      ['peso', 'Peso de los títulos', [['600', '600'], ['700', '700'], ['800', '800'], ['900', '900']]],
      ['tiempo', 'Hora en las tarjetas', [['off', 'No'], ['on', 'Sí']]],
      ['ad', 'Banner 1180×90', [['on', 'Sí'], ['off', 'No']]],
      ['fondos', 'Fondos alternados', [['on', 'Sí'], ['off', 'No']]],
      ['fotos', 'Fotos de legisladores', [['ejemplo', 'Ejemplo'], ['iniciales', 'Iniciales']]],
      ['font', 'Tipografía de títulos', [['actual', 'Actual (Source Serif 4)'], ['merriweather', 'Merriweather'], ['literata', 'Literata']]],
      ['ritmo', 'Ritmo del home (desktop)', [['actual', 'Actual'], ['b', 'B · una grande y dos chicas'], ['c', 'C · bloque de solo texto']]],
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
      row.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; root.setAttribute('data-' + k, b.dataset.v); store(); sync();
        /* el inicio de cada versión es un archivo distinto (index.html / index-anterior.html): al cambiar `home` se navega */
        if (k === 'home' && /(^|\/)(index(-anterior)?\.html)?$/.test(location.pathname)) { const u = new URL(location.href); u.pathname = u.pathname.replace(/[^/]*$/, b.dataset.v === 'anterior' ? 'index-anterior.html' : 'index.html'); u.searchParams.set('home', b.dataset.v); location.href = u.href; } });
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
  /* Encuesta de la franja superior (diseño a definir): el voto vive solo en memoria, no se guarda */
  $$('[data-poll]').forEach(poll => {
    const opts = $('.fr__opts', poll), res = $('.fr__res', poll);
    const show = vote => {
      const rows = $$('.fr__row', res).map(r => ({ r, v: +r.dataset.v + (r.dataset.id === vote ? 1 : 0) }));
      const tot = rows.reduce((a, x) => a + x.v, 0);
      rows.forEach(({ r, v }) => { const pct = Math.round(v * 100 / tot); $('.fr__bar i', r).style.width = pct + '%'; $('.fr__pct', r).textContent = pct + '%'; r.classList.toggle('is-mine', r.dataset.id === vote); });
      opts.hidden = true; res.hidden = false;
    };
    opts.addEventListener('click', e => { const b = e.target.closest('.fr__opt'); if (b) show(b.dataset.id); });
  });
  /* Carrusel de la superdestacada 1 (super=1): flechas, puntos y teclado; sin autoplay */
  $$('[data-scar]').forEach(sc => {
    const slides = $$('.scar__slide', sc); let cur = 0;
    const go = n => {
      cur = (n + slides.length) % slides.length;
      slides.forEach((s, i) => { s.classList.toggle('is-on', i === cur); s.setAttribute('aria-hidden', i === cur ? 'false' : 'true'); $('h2 a', s).tabIndex = i === cur ? 0 : -1; $$('.scar__dot', s).forEach((d, k) => { if (k === cur) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); }); });
    };
    sc.addEventListener('click', e => { const b = e.target.closest('.scar__btn,.scar__dot'); if (!b) return; if (b.dataset.d) go(cur + +b.dataset.d); else go(+b.dataset.i); });
    sc.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') go(cur - 1); else if (e.key === 'ArrowRight') go(cur + 1); });
  });
})();
