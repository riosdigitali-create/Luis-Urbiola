/* Servidor estático mínimo. Los módulos ES no funcionan abriendo el HTML
   directamente (file://) por seguridad del navegador, así que se sirven por HTTP. */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)));
const PUERTO = process.env.PORT || 4321;
const MIME = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8',
  '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png',
  '.jpg':'image/jpeg', '.webp':'image/webp', '.ico':'image/x-icon' };

createServer(async (req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel === '/') rel = '/index.html';
  const ruta = resolve(RAIZ, '.' + normalize(rel));
  if (!ruta.startsWith(RAIZ) || /(^|[\\/])\.env/.test(ruta)) { res.writeHead(403).end('Prohibido'); return; }
  try {
    if ((await stat(ruta)).isDirectory()) throw new Error('dir');
    res.writeHead(200, { 'Content-Type': MIME[extname(ruta).toLowerCase()] || 'application/octet-stream' });
    res.end(await readFile(ruta));
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<meta charset="utf-8"><body style="font:16px system-ui;padding:60px"><h1>404</h1><a href="/">Volver al inicio</a>');
  }
}).listen(PUERTO, () => console.log(`\n  La Esquina en http://localhost:${PUERTO}\n  Ctrl+C para detener\n`));
