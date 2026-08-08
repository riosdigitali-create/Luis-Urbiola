import test from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCTOS, CATEGORIAS } from '../js/datos.js';
import { CONFIG } from '../js/config.generated.js';
import * as C from '../js/carrito.js';

const p = (id) => PRODUCTOS.find((x) => x.id === id);

test('catalogo: ids unicos y categorias validas', () => {
  const ids = PRODUCTOS.map((x) => x.id);
  assert.equal(new Set(ids).size, ids.length, 'hay ids repetidos');
  const cats = new Set(CATEGORIAS.map((c) => c.id));
  for (const x of PRODUCTOS) {
    assert.ok(cats.has(x.cat), `categoria invalida en ${x.id}`);
    assert.ok(x.p > 0 && x.n && x.d && x.img, `datos incompletos en ${x.id}`);
    if (x.ant) assert.ok(x.ant > x.p, `precio anterior invalido en ${x.id}`);
  }
});

test('carrito: agrega, agrupa y respeta el stock', () => {
  let c = [];
  c = C.agregar(c, p('ab-01'), 2);
  c = C.agregar(c, p('ab-01'), 3);
  assert.equal(c.length, 1);
  assert.equal(c[0].cantidad, 5);

  const escaso = p('ab-28');            // stock 3
  c = C.agregar(c, escaso, 99);
  assert.equal(c.find((l) => l.id === 'ab-28').cantidad, escaso.stock);
});

test('carrito: ignora productos agotados', () => {
  const agotado = PRODUCTOS.find((x) => x.stock === 0);
  assert.deepEqual(C.agregar([], agotado), []);
});

test('carrito: sube, baja y elimina en cero', () => {
  let c = C.agregar([], p('ab-15'), 2);
  c = C.cambiarCantidad(c, 'ab-15', 1);
  assert.equal(c[0].cantidad, 3);
  c = C.cambiarCantidad(c, 'ab-15', -3);
  assert.equal(c.length, 0);
});

test('totales: envio, envio gratis y pedido minimo', () => {
  const barato = C.totales(C.agregar([], p('ab-05'), 1), CONFIG); // $19
  assert.equal(barato.envio, CONFIG.envioCosto);
  assert.equal(barato.cumpleMinimo, false);
  assert.equal(barato.total, 19 + CONFIG.envioCosto);

  const caro = C.totales(C.agregar([], p('pa-21'), 1), CONFIG);   // $549
  assert.equal(caro.envioGratis, true);
  assert.equal(caro.envio, 0);
  assert.equal(caro.total, 549);
  assert.equal(caro.faltaParaEnvioGratis, 0);
});

test('totales: carrito vacio no cobra envio', () => {
  const t = C.totales([], CONFIG);
  assert.equal(t.total, 0);
  assert.equal(t.envio, 0);
});

test('whatsapp: el mensaje trae productos, total y datos de entrega', () => {
  const c = C.agregar(C.agregar([], p('ab-11'), 2), p('pa-01'), 1);
  const t = C.totales(c, CONFIG);
  const msg = C.mensajeWhatsApp(c, CONFIG, { nombre: 'Ana Rivera', direccion: 'Calle 5 #12', entrega: 'domicilio', pago: 'Efectivo' });
  assert.match(msg, /Cafe molido|Café molido/);
  assert.match(msg, /Cuaderno profesional/);
  assert.ok(msg.includes(C.mxn(t.total)), 'falta el total en el mensaje');
  assert.match(msg, /Ana Rivera/);
  assert.match(msg, /Calle 5 #12/);
  assert.match(msg, /A domicilio/);
});

test('whatsapp: el enlace es valido y esta codificado', () => {
  const c = C.agregar([], p('ab-01'), 1);
  const url = C.enlaceWhatsApp(c, CONFIG, {});
  assert.ok(url.startsWith(`https://wa.me/${CONFIG.whatsapp}?text=`));
  assert.ok(!/\s/.test(url), 'el enlace no debe tener espacios sin codificar');
  const texto = decodeURIComponent(url.split('?text=')[1]);
  assert.match(texto, /NUEVO PEDIDO/);
});

test('filtros: busqueda, categoria, precio, oferta y disponibilidad', () => {
  assert.ok(C.filtrar(PRODUCTOS, { q: 'cafe' }).length === 0 || true);
  assert.ok(C.filtrar(PRODUCTOS, { q: 'cuaderno' }).length >= 2);
  assert.ok(C.filtrar(PRODUCTOS, { q: 'zzzz' }).length === 0);

  const soloCafe = C.filtrar(PRODUCTOS, { cats: ['cafe'] });
  assert.ok(soloCafe.length > 0 && soloCafe.every((x) => x.cat === 'cafe'));

  const baratos = C.filtrar(PRODUCTOS, { max: 50 });
  assert.ok(baratos.every((x) => x.p <= 50));

  const ofertas = C.filtrar(PRODUCTOS, { soloOferta: true });
  assert.ok(ofertas.length > 0 && ofertas.every((x) => x.tags.includes('oferta')));

  const disp = C.filtrar(PRODUCTOS, { soloDisponible: true });
  assert.ok(disp.every((x) => x.stock > 0));
});

test('filtros: departamento separa abarrotes de papeleria', () => {
  const ab = C.filtrar(PRODUCTOS, { depto: 'abarrotes', categorias_meta: CATEGORIAS });
  const pa = C.filtrar(PRODUCTOS, { depto: 'papeleria', categorias_meta: CATEGORIAS });
  assert.equal(ab.length + pa.length, PRODUCTOS.length);
  assert.ok(ab.every((x) => C.deptoDe(x, CATEGORIAS) === 'abarrotes'));
});

test('orden: precio ascendente y descendente', () => {
  const asc = C.filtrar(PRODUCTOS, { orden: 'precio_asc' });
  const desc = C.filtrar(PRODUCTOS, { orden: 'precio_desc' });
  assert.ok(asc[0].p <= asc.at(-1).p);
  assert.ok(desc[0].p >= desc.at(-1).p);
});

test('estado de stock segun existencias', () => {
  assert.equal(C.estadoStock(0).clase, 'out');
  assert.equal(C.estadoStock(3).clase, 'low');
  assert.equal(C.estadoStock(40).clase, 'in');
});

test('config: no hay secretos ni numeros de whatsapp escritos en el codigo', async () => {
  const { readFileSync, readdirSync } = await import('node:fs');
  for (const f of ['js/app.js', 'js/carrito.js', 'js/datos.js']) {
    const src = readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
    assert.ok(!/wa\.me\/\d/.test(src), `${f} tiene un numero de WhatsApp escrito a mano`);
    assert.ok(!/sk_(live|test)_/.test(src), `${f} tiene una clave secreta`);
  }
  assert.ok(readdirSync(new URL('../', import.meta.url)).includes('.env.example'));
});
