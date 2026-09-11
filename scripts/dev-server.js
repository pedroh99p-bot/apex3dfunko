// Servidor estático de desenvolvimento. Não é backend de pedidos.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname, sep } from 'node:path';
import { endpoints } from '../config/endpoints.js';
const root = fileURLToPath(new URL('../', import.meta.url));
const port = Number(process.env.PORT || 4173);
const visuals = endpoints.visualOrigins.join(' ');
const csp = `default-src 'none'; script-src 'self'; connect-src 'self'; style-src 'self' 'unsafe-inline' ${visuals}; img-src 'self' https://mifunko.com data: blob:; font-src 'self' ${visuals}; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`;
http.createServer(async (req, res) => {
  res.setHeader('Content-Security-Policy', csp);
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
  try {
    const path = decodeURIComponent(new URL(req.url, `http://127.0.0.1:${port}`).pathname);
    if (path === '/index.html') { res.writeHead(302, { Location: '/' }); return res.end(); }
    const template = path === endpoints.template;
    const publicPath = path === '/' ? '/dev.html' : path;
    if (!template && !/^\/(dev\.html|(?:js|css|config|assets)\/[\w./-]+)$/.test(publicPath)) { res.writeHead(404); return res.end(); }
    const file = resolve(root, template ? 'index.html' : `.${publicPath}`);
    if (!file.startsWith(resolve(root) + sep)) { res.writeHead(403); return res.end(); }
    const data = await readFile(file);
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
    res.setHeader('Content-Type', `${template ? 'text/plain' : types[extname(file)] || 'application/octet-stream'}; charset=utf-8`);
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch { res.writeHead(404); res.end(); }
}).listen(port, '127.0.0.1', () => console.log(`Prévia local: http://127.0.0.1:${port}`));
