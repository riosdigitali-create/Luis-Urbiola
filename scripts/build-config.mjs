/* Lee .env y genera js/config.generated.js con SOLO las variables públicas.
   Ningún secreto se escribe en el código fuente versionado. */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rutaEnv = existsSync(resolve(raiz, '.env'))
  ? resolve(raiz, '.env')
  : resolve(raiz, '.env.example');

const env = Object.fromEntries(
  readFileSync(rutaEnv, 'utf8')
    .split('\n')
    .filter((l) => l.trim() && !l.trim().startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const num = (v, d) => (Number.isFinite(+v) ? +v : d);

const publico = {
  whatsapp: String(env.WHATSAPP_NUMERO || '').replace(/\D/g, ''),
  negocio: {
    nombre: env.NEGOCIO_NOMBRE || 'La Esquina',
    direccion: env.NEGOCIO_DIRECCION || '',
    horario: env.NEGOCIO_HORARIO || '',
    email: env.NEGOCIO_EMAIL || ''
  },
  moneda: env.MONEDA || 'MXN',
  envioCosto: num(env.ENVIO_COSTO, 45),
  envioGratisDesde: num(env.ENVIO_GRATIS_DESDE, 350),
  pedidoMinimo: num(env.PEDIDO_MINIMO, 100)
};

writeFileSync(
  resolve(raiz, 'js/config.generated.js'),
  `/* GENERADO AUTOMÁTICAMENTE por scripts/build-config.mjs — no editar a mano. */\nexport const CONFIG = ${JSON.stringify(publico, null, 2)};\n`
);

const origen = rutaEnv.endsWith('.example') ? '.env.example (no se encontró .env)' : '.env';
console.log(`✔ js/config.generated.js escrito desde ${origen}`);
if (!publico.whatsapp) console.warn('⚠ WHATSAPP_NUMERO vacío: el botón de WhatsApp no funcionará.');
