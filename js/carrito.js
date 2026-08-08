/* Lógica pura del carrito y del pedido por WhatsApp.
   Sin dependencias del DOM: se puede probar en Node. */

export const mxn = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 }).format(n);

export const estadoStock = (stock) =>
  stock <= 0 ? { clase: 'out', texto: 'Agotado' }
  : stock <= 5 ? { clase: 'low', texto: `Últimas ${stock} pzas` }
  : { clase: 'in', texto: 'Disponible' };

/** Añade o incrementa respetando el stock. Devuelve un carrito nuevo. */
export function agregar(carrito, producto, cantidad = 1) {
  if (!producto || producto.stock <= 0) return carrito;
  const nuevo = carrito.map((l) => ({ ...l }));
  const linea = nuevo.find((l) => l.id === producto.id);
  if (linea) {
    linea.cantidad = Math.min(linea.cantidad + cantidad, producto.stock);
  } else {
    nuevo.push({
      id: producto.id, n: producto.n, p: producto.p, img: producto.img,
      unidad: producto.unidad, stock: producto.stock,
      cantidad: Math.min(cantidad, producto.stock)
    });
  }
  return nuevo;
}

/** Cambia la cantidad de una línea. Si llega a 0 la elimina. */
export function cambiarCantidad(carrito, id, delta) {
  return carrito
    .map((l) => (l.id === id ? { ...l, cantidad: Math.min(Math.max(l.cantidad + delta, 0), l.stock) } : l))
    .filter((l) => l.cantidad > 0);
}

export const quitar = (carrito, id) => carrito.filter((l) => l.id !== id);

export const piezas = (carrito) => carrito.reduce((s, l) => s + l.cantidad, 0);

/** Totales del pedido, incluido el envío según las reglas del negocio. */
export function totales(carrito, cfg) {
  const subtotal = carrito.reduce((s, l) => s + l.p * l.cantidad, 0);
  const gratis = subtotal >= cfg.envioGratisDesde;
  const envio = subtotal === 0 || gratis ? 0 : cfg.envioCosto;
  return {
    subtotal,
    envio,
    envioGratis: gratis,
    faltaParaEnvioGratis: Math.max(cfg.envioGratisDesde - subtotal, 0),
    total: subtotal + envio,
    piezas: piezas(carrito),
    cumpleMinimo: subtotal >= cfg.pedidoMinimo
  };
}

/** Arma el texto del pedido tal como llegará al WhatsApp del negocio. */
export function mensajeWhatsApp(carrito, cfg, datos = {}) {
  const t = totales(carrito, cfg);
  const L = [];
  L.push(`*NUEVO PEDIDO — ${cfg.negocio.nombre}*`);
  L.push('');
  L.push('*Productos*');
  carrito.forEach((l, i) => {
    L.push(`${i + 1}. ${l.n}`);
    L.push(`   ${l.cantidad} × ${mxn(l.p)} = ${mxn(l.p * l.cantidad)}`);
  });
  L.push('');
  L.push(`Subtotal: ${mxn(t.subtotal)}`);
  L.push(`Envío: ${t.envioGratis ? 'GRATIS' : mxn(t.envio)}`);
  L.push(`*TOTAL: ${mxn(t.total)}*`);
  L.push(`Piezas: ${t.piezas}`);
  L.push('');
  L.push('*Datos de entrega*');
  L.push(`Nombre: ${datos.nombre || '(por confirmar)'}`);
  L.push(`Dirección: ${datos.direccion || '(por confirmar)'}`);
  L.push(`Entrega: ${datos.entrega === 'tienda' ? 'Recoger en tienda' : 'A domicilio'}`);
  L.push(`Pago: ${datos.pago || 'Efectivo'}`);
  if (datos.notas) L.push(`Notas: ${datos.notas}`);
  return L.join('\n');
}

export function enlaceWhatsApp(carrito, cfg, datos = {}) {
  return `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(mensajeWhatsApp(carrito, cfg, datos))}`;
}

/** Filtro y orden del catálogo. */
export function filtrar(productos, f = {}) {
  const q = (f.q || '').trim().toLowerCase();
  let r = productos.filter((p) => {
    if (f.depto && f.depto !== 'todos' && deptoDe(p, f.categorias_meta) !== f.depto) return false;
    if (f.cats?.length && !f.cats.includes(p.cat)) return false;
    if (f.marcas?.length && !f.marcas.includes(p.marca)) return false;
    if (f.max != null && p.p > f.max) return false;
    if (f.soloOferta && !p.tags.includes('oferta')) return false;
    if (f.soloDisponible && p.stock <= 0) return false;
    if (q) {
      const heno = `${p.n} ${p.d} ${p.marca} ${p.cat}`.toLowerCase();
      if (!q.split(/\s+/).every((t) => heno.includes(t))) return false;
    }
    return true;
  });
  const orden = {
    relevancia: (a, b) => (b.tags.length - a.tags.length) || a.p - b.p,
    precio_asc: (a, b) => a.p - b.p,
    precio_desc: (a, b) => b.p - a.p,
    nombre: (a, b) => a.n.localeCompare(b.n, 'es'),
    descuento: (a, b) => desc(b) - desc(a)
  };
  return r.sort(orden[f.orden] || orden.relevancia);
}

const desc = (p) => (p.ant ? Math.round((1 - p.p / p.ant) * 100) : 0);
export const descuento = desc;

export function deptoDe(p, categorias) {
  return categorias?.find((c) => c.id === p.cat)?.depto || '';
}
