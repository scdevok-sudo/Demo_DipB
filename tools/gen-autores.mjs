// Genera data/autores.json: un autor de FANTASIA por nota (id -> "Nombre Apellido"), estable (depende solo del id).
// Los autores reales del sitio actual no se usan en la maqueta. En produccion el autor sale de WordPress o de un campo propio (Hito 2).
import fs from 'node:fs'; import path from 'node:path';
const R = path.resolve(import.meta.dirname, '..');
const J = f => JSON.parse(fs.readFileSync(path.join(R, f), 'utf8'));
const raw = J('data/10_muestra_notas.json'), extra = J('data/11_notas_extra.json');
const ids = [...new Set([...raw.ultimas, ...Object.values(raw.por_categoria).flatMap(c => c.notas), ...extra].map(n => n.id))].sort((a, b) => a - b);
const N = ['Ariana', 'Bruno', 'Celia', 'Damián', 'Elena', 'Fabricio', 'Gisela', 'Hugo', 'Irene', 'Joaquín', 'Karina', 'Lautaro', 'Malena', 'Nahuel', 'Olivia', 'Patricio', 'Renata', 'Santino', 'Tamara', 'Ulises'];
const A = ['Aldana', 'Benavídez', 'Carranza', 'Dorrego', 'Echeverry', 'Fontana', 'Galarza', 'Herrero', 'Iturbe', 'Jáuregui', 'Lascano', 'Maidana', 'Navarrete', 'Ocampo', 'Paredes', 'Quiroz', 'Rinaldi', 'Sandoval', 'Toledano', 'Urquiza', 'Vallejos', 'Zamudio'];
const out = {}; ids.forEach(id => { const h = Math.imul(id, 2654435761) >>> 0; out[id] = `${N[h % N.length]} ${A[(h >>> 9) % A.length]}`; });
fs.writeFileSync(path.join(R, 'data/autores.json'), JSON.stringify(out, null, 1)); console.log(ids.length, 'autores de fantasia');
