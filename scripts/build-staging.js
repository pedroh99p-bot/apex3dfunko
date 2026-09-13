import { cp, mkdir, readFile, writeFile, rm, realpath } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
const root = await realpath(fileURLToPath(new URL('../', import.meta.url)));
const output = resolve(root, 'dist');
const actual = await realpath(output).catch(error => { if (error.code === 'ENOENT') return output; throw error; });
if (dirname(actual) !== root || actual !== output) throw new Error('Destino de build fora do workspace.');
await rm(output, { recursive: true, force: true });
await mkdir(output);
// Explicit public files; never the historical index, docs or credentials.
const manifest = JSON.parse(await readFile(resolve(root, 'docs/evidence/original-shell-assets.json'), 'utf8'));
const publicFiles = [...new Set([
  ...manifest.filter(entry => entry.file && entry.status !== 'excluded').map(entry => entry.file),
  'assets/brand/apex-logo.png','assets/brand/apex-share.webp','assets/process/apex-impressao-3d.webp','assets/ui/review-placeholder.svg',
  'css/apex-shell.css','css/apex-theme.css','css/shell-inline.css','css/commercial-v1.css',
  'js/main.js','js/shell-dom.js','js/shell-controller.js','js/shell-interactions.js','js/commercial-ui.js','js/analytics.js','js/whatsapp.js',
  'js/state.js','js/pricing.js','js/uploads.js','js/date.js','js/validation.js','js/order.js','js/review.js',
  'config/products.js','config/pricing.js','config/special-objects.js','config/commercial.js','config/uploads.js','config/mvp.js','config/analytics.js','config/brand.js',
])];
for (const file of publicFiles) {
  const target = resolve(output, file); await mkdir(dirname(target), { recursive: true }); await cp(resolve(root, file), target);
}
await writeFile(resolve(output, 'index.html'), await readFile(resolve(root, 'dev.html')));
await writeFile(resolve(output, '_headers'), "/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: no-referrer\n  X-Frame-Options: DENY\n  X-Robots-Tag: noindex, nofollow\n");
console.log('Staging estático: ' + output);
