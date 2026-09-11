import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url), output = new URL('../dist/', import.meta.url);
await mkdir(output, { recursive: true });
// Explicit public allowlist; the historical index, docs, uploads and credentials never enter dist.
for (const dir of ['js', 'css', 'config', 'assets']) {
  await cp(new URL(dir, root), new URL(dir, output), { recursive: true });
}
await writeFile(new URL('index.html', output), await readFile(new URL('dev.html', root)));
await writeFile(new URL('_headers', output), "/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: no-referrer\n  X-Frame-Options: DENY\n  X-Robots-Tag: noindex, nofollow\n");
console.log('Staging estático: ' + fileURLToPath(output));
