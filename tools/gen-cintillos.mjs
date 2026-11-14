// Genera data/cintillos.json (id → cintillo de ejemplo). Se corre una vez; después el archivo se edita a mano.
// En producción el cintillo es un campo editable del editor de notas de WordPress (Hito 2).
import fs from 'node:fs';
const R = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const r = JSON.parse(fs.readFileSync(R + 'data/10_muestra_notas.json', 'utf8'));
const e = JSON.parse(fs.readFileSync(R + 'data/11_notas_extra.json', 'utf8'));
const m = new Map(); [...r.ultimas, ...Object.values(r.por_categoria).flatMap(c => c.notas), ...e].forEach(n => m.set(n.id, n));
const rules = [
  [/Senad/i, /sesi[oó]n|posterg/i, ['Sesión en el Senado', 'Senado bonaerense', 'Sesión postergada']],
  [/Diputad/i, /sesi[oó]n|despach|aprob/i, ['Sesión en Diputados', 'Cámara baja bonaerense', 'Tercera jornada']],
  [/presupuesto|endeud|fiscal/i, null, ['Presupuesto 2027', 'Cuentas provinciales', 'Debate por el Presupuesto']],
  [/paritari|aument|salari|estatal|docente|gremi/i, null, ['Paritarias estatales', 'Reclamo salarial', 'Reclamo']],
  [/salud|hospital|sanitari/i, null, ['Salud pública', 'Sistema de salud', 'Reclamo en salud']],
  [/seguridad|polic|delito|crimen/i, null, ['Seguridad', 'Inseguridad en el Conurbano', 'Agenda de seguridad']],
  [/Corte|Justicia|proces|judic|fiscal[ií]a/i, null, ['Causa judicial', 'Justicia bonaerense', 'Tras el fallo']],
  [/intendente|Concejo|municip/i, null, ['Municipios', 'Tensión en el distrito', 'Gestión local']],
  [/candidat|elecci|PASO|lista/i, null, ['Rumbo a 2027', 'Cierre de listas', 'Juego electoral']],
  [/PJ|peroni|Cámpora|Fuerza Patria/i, null, ['Interna peronista', 'Fuerza Patria', 'Tregua en el PJ']],
  [/Milei|Libertad Avanza|LLA|Bullrich/i, null, ['Gobierno nacional', 'La Libertad Avanza', 'Interna libertaria']],
  [/Kicillof/i, null, ['Gobierno bonaerense', 'Kicillof', 'Provincia en la discusión nacional']],
  [/PRO|Macri/i, null, ['PRO', 'Oposición']],
  [/proyecto|ley|impuls|iniciativa/i, null, ['Proyecto de ley', 'Nueva iniciativa', 'Agenda legislativa']],
];
const byCat = { 'Legislatura Bonaerense': ['La Plata', 'Agenda legislativa', 'En comisión', 'Debate abierto', 'Tercera jornada'], Congreso: ['Congreso', 'Sesión en Diputados', 'Debate en el recinto'], 'Nación': ['Gobierno nacional', 'Casa Rosada', 'Economía'], Provincia: ['Provincia', 'Gobierno bonaerense', 'Gestión provincial'], Municipios: ['Municipios', 'Gestión local', 'Costa atlántica'] };
const LARGOS = ['Tras el reclamo de los gremios estatales frente a la Gobernación', 'Una semana clave en la Legislatura bonaerense', 'Qué se discute en la Cámara antes del receso'];
const out = {}; let i = 0;
for (const n of [...m.values()].sort((a, b) => a.id - b.id)) {
  const t = n.titulo + ' ' + n.tags.join(' ');
  let c = null;
  for (const [re, re2, list] of rules) if (re.test(n.titulo) && (!re2 || re2.test(n.titulo))) { c = list[n.id % list.length]; break; }
  if (!c) { const cat = n.categorias.find(x => byCat[x]); const l = byCat[cat] || ['Actualidad', 'En detalle']; c = l[n.id % l.length]; }
  if (i % 17 === 5) c = LARGOS[(i / 17 | 0) % LARGOS.length];
  out[n.id] = c; i++;
}
fs.writeFileSync(R + 'data/cintillos.json', JSON.stringify(out, null, 1));
console.log(Object.keys(out).length, 'cintillos');
