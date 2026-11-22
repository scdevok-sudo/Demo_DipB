// Publica SOLO lo que se tiene que ver en GitHub Pages: los *.html de la raiz, assets/, robots.txt y un .nojekyll.
// Arma un commit nuevo (sin historial) en la rama local `gh-pages`; `main` nunca se sirve.
// Uso (desde la raiz del repo):
//   node build.mjs            # regenera el HTML
//   node tools/publish.mjs    # arma la rama gh-pages local con el sitio (no toca el remoto)
//   git push --force origin gh-pages   # sube la rama (o: node tools/publish.mjs --push)
import { cpSync, mkdtempSync, readdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const git = (cwd, ...a) => execFileSync('git', a, { cwd, stdio: ['ignore', 'pipe', 'inherit'] }).toString().trim();
const push = process.argv.includes('--push');

const htmls = readdirSync(root).filter(f => f.endsWith('.html'));
if (!htmls.includes('index.html')) throw new Error('No hay index.html: corre antes `node build.mjs`.');
if (!existsSync(join(root, 'assets'))) throw new Error('Falta assets/.');

const tmp = mkdtempSync(join(tmpdir(), 'pages-'));
try {
  htmls.forEach(f => cpSync(join(root, f), join(tmp, f)));
  cpSync(join(root, 'assets'), join(tmp, 'assets'), { recursive: true });
  if (existsSync(join(root, 'robots.txt'))) cpSync(join(root, 'robots.txt'), join(tmp, 'robots.txt'));
  writeFileSync(join(tmp, '.nojekyll'), '');
  git(tmp, 'init', '-q', '-b', 'gh-pages');
  git(tmp, 'add', '-A');
  const rev = git(root, 'rev-parse', '--short', 'HEAD');
  git(tmp, '-c', 'user.name=publish', '-c', 'user.email=publish@localhost', 'commit', '-q', '-m', `Sitio generado desde main@${rev}`);
  git(root, 'fetch', '-q', '--force', tmp, 'gh-pages:gh-pages');   // rama local gh-pages = ese unico commit
  console.log(`✓ rama gh-pages lista (${htmls.length} paginas html + assets/ + robots.txt + .nojekyll), generada desde main@${rev}`);
  if (push) { git(root, 'push', '--force', 'origin', 'gh-pages'); console.log('✓ gh-pages subida a origin'); }
  else console.log('Para subirla: git push --force origin gh-pages');
} finally { rmSync(tmp, { recursive: true, force: true }); }
