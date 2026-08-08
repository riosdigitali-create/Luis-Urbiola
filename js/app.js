import { PRODUCTOS, CATEGORIAS, DEPTOS, OFERTAS_SEMANA, HERO } from './datos.js';
import { CONFIG } from './config.generated.js';
import * as C from './carrito.js';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const CLAVE = 'laesquina.carrito.v1';

let carrito = [];
try { carrito = JSON.parse(localStorage.getItem(CLAVE)) || []; } catch { carrito = []; }

const guardar = () => { try { localStorage.setItem(CLAVE, JSON.stringify(carrito)); } catch {} };
const porId  = (id) => PRODUCTOS.find((p) => p.id === id);
const esc = (s) => String(s).replace(/[&<>"']/g, (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));

/* ---------------- Toast ---------------- */
let tToast;
function avisar(msg) {
  let t = $('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role','status'); document.body.appendChild(t); }
  t.textContent = msg;
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(tToast);
  tToast = setTimeout(() => t.classList.remove('show'), 2400);
}

/* ---------------- Tarjeta de producto ---------------- */
export function tarjeta(p) {
  const st = C.estadoStock(p.stock);
  const off = C.descuento(p);
  const tags = [
    off ? `<span class="tag tag--off">-${off}%</span>` : '',
    p.tags.includes('nuevo') ? '<span class="tag tag--new">Nuevo</span>' : '',
    p.tags.includes('destacado') ? '<span class="tag tag--hit">Destacado</span>' : ''
  ].join('');
  return `
  <article class="card" data-id="${p.id}">
    <div class="card__media">
      <div class="tags">${tags}</div>
      <img src="${p.img}" alt="${esc(p.n)}" loading="lazy" decoding="async" width="600" height="600">
    </div>
    <div class="card__body">
      <span class="card__cat">${esc(p.marca)}</span>
      <h3 class="card__title">${esc(p.n)}</h3>
      <p class="card__desc">${esc(p.d)}</p>
      <div class="card__foot">
        <span class="price">${C.mxn(p.p)}${p.ant ? `<s>${C.mxn(p.ant)}</s>` : ''}</span>
        <span class="unit">${esc(p.unidad)}</span>
      </div>
      <span class="stock stock--${st.clase}">${st.texto}</span>
    </div>
    <div class="card__actions">
      <button class="btn btn--ghost js-ver" type="button">Ver ficha</button>
      <button class="btn btn--primary js-add" type="button" ${p.stock <= 0 ? 'disabled' : ''}>
        ${p.stock <= 0 ? 'Agotado' : 'Agregar'}
      </button>
    </div>
  </article>`;
}

export const pintarGrid = (el, lista) => {
  if (!el) return;
  el.innerHTML = lista.length
    ? lista.map(tarjeta).join('')
    : `<div class="empty" style="grid-column:1/-1"><div>🔍</div><h3>Sin resultados</h3><p>Prueba con otra palabra o quita algún filtro.</p></div>`;
};

/* ---------------- Carrito ---------------- */
function pintarCarrito() {
  const cont = $('#cartItems'), ft = $('#cartFoot');
  const t = C.totales(carrito, CONFIG);
  $$('.js-cart-count').forEach((b) => { b.textContent = t.piezas; b.hidden = t.piezas === 0; });
  $$('.js-cart-total').forEach((b) => (b.textContent = C.mxn(t.total)));

  if (!cont) return;
  if (!carrito.length) {
    cont.innerHTML = `<div class="cart__empty"><div>🛒</div><p>Tu carrito está vacío.</p><p style="font-size:.85rem">Agrega productos y envía tu pedido por WhatsApp.</p></div>`;
    if (ft) ft.hidden = true;
    return;
  }
  if (ft) ft.hidden = false;
  cont.innerHTML = carrito.map((l) => `
    <div class="ci" data-id="${l.id}">
      <img src="${l.img}" alt="" loading="lazy" width="64" height="64">
      <div>
        <b>${esc(l.n)}</b>
        <small>${esc(l.unidad)} · ${C.mxn(l.p)}</small>
        <div class="qty">
          <button type="button" class="js-menos" aria-label="Quitar una unidad de ${esc(l.n)}">−</button>
          <span aria-live="polite">${l.cantidad}</span>
          <button type="button" class="js-mas" aria-label="Agregar una unidad de ${esc(l.n)}" ${l.cantidad >= l.stock ? 'disabled' : ''}>+</button>
        </div>
        <button type="button" class="ci__rm js-quitar">Eliminar</button>
      </div>
      <span class="ci__price">${C.mxn(l.p * l.cantidad)}</span>
    </div>`).join('');

  $('#rowSub').textContent = C.mxn(t.subtotal);
  $('#rowEnvio').textContent = t.envioGratis ? 'GRATIS' : C.mxn(t.envio);
  $('#rowTotal').textContent = C.mxn(t.total);
  const nota = $('#cartNota');
  if (nota) {
    nota.textContent = t.envioGratis
      ? '🎉 Tu pedido tiene envío gratis.'
      : `Te faltan ${C.mxn(t.faltaParaEnvioGratis)} para envío gratis.`;
  }
  const btn = $('#btnWa');
  if (btn) {
    const ok = t.cumpleMinimo;
    btn.disabled = !ok;
    btn.textContent = ok ? `Enviar pedido por WhatsApp · ${C.mxn(t.total)}` : `Pedido mínimo ${C.mxn(CONFIG.pedidoMinimo)}`;
  }
}

const abrirCarrito = () => { $('#cart')?.classList.add('open'); $('#overlay')?.classList.add('open'); $('#cart')?.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; $('#cartClose')?.focus(); };
const cerrarCarrito = () => { $('#cart')?.classList.remove('open'); $('#overlay')?.classList.remove('open'); $('#cart')?.setAttribute('aria-hidden','true'); document.body.style.overflow=''; };

function agregarAlCarrito(id, n = 1) {
  const p = porId(id);
  const antes = C.piezas(carrito);
  carrito = C.agregar(carrito, p, n);
  guardar(); pintarCarrito();
  avisar(C.piezas(carrito) > antes ? `${p.n} agregado` : 'No hay más existencias');
}

/* ---------------- Modal de ficha ---------------- */
function abrirFicha(id) {
  const p = porId(id); if (!p) return;
  const st = C.estadoStock(p.stock);
  const cat = CATEGORIAS.find((c) => c.id === p.cat);
  $('#modalBody').innerHTML = `
    <button class="modal__x" id="modalX" type="button" aria-label="Cerrar ficha">✕</button>
    <img src="${p.img.replace('w=600','w=900')}" alt="${esc(p.n)}">
    <div class="modal__info">
      <span class="card__cat">${esc(p.marca)} · ${esc(cat?.nombre || '')}</span>
      <h2 id="modalTitulo">${esc(p.n)}</h2>
      <p style="color:var(--ink-2);font-size:.92rem;margin:0">${esc(p.d)}</p>
      <div class="card__foot">
        <span class="price">${C.mxn(p.p)}${p.ant ? `<s>${C.mxn(p.ant)}</s>` : ''}</span>
        <span class="stock stock--${st.clase}">${st.texto}</span>
      </div>
      <ul class="specs">
        <li><span>Presentación</span><b>${esc(p.unidad)}</b></li>
        <li><span>Marca</span><b>${esc(p.marca)}</b></li>
        <li><span>Categoría</span><b>${esc(cat?.nombre || '')}</b></li>
        <li><span>Existencias</span><b>${p.stock > 0 ? p.stock + ' pzas' : 'Sin existencias'}</b></li>
        <li><span>Código</span><b>${p.id.toUpperCase()}</b></li>
      </ul>
      <button class="btn btn--primary btn--block js-add-modal" type="button" data-id="${p.id}" ${p.stock <= 0 ? 'disabled' : ''}>
        ${p.stock <= 0 ? 'Sin existencias' : 'Agregar al carrito'}
      </button>
    </div>`;
  const m = $('#modal');
  m.classList.add('open'); m.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
  $('#modalX').focus();
}
const cerrarFicha = () => { $('#modal')?.classList.remove('open'); $('#modal')?.setAttribute('aria-hidden','true'); document.body.style.overflow=''; };

/* ---------------- Arranque ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  // Datos del negocio en el marcado
  $$('[data-cfg]').forEach((el) => {
    const v = el.dataset.cfg.split('.').reduce((o, k) => o?.[k], { ...CONFIG, ...CONFIG.negocio });
    if (v != null) el.textContent = v;
  });
  $$('[data-cfg-mxn]').forEach((el) => {
    const v = el.dataset.cfgMxn.split('.').reduce((o, k) => o?.[k], CONFIG);
    if (v != null) el.textContent = C.mxn(v);
  });

  pintarCarrito();

  // Delegación global de eventos
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (e.target.closest('.js-add') && card) return agregarAlCarrito(card.dataset.id);
    if (e.target.closest('.js-ver')  && card) return abrirFicha(card.dataset.id);

    const addModal = e.target.closest('.js-add-modal');
    if (addModal) { agregarAlCarrito(addModal.dataset.id); cerrarFicha(); return; }

    const ci = e.target.closest('.ci');
    if (ci) {
      const id = ci.dataset.id;
      if (e.target.closest('.js-mas'))    { carrito = C.cambiarCantidad(carrito, id,  1); guardar(); pintarCarrito(); return; }
      if (e.target.closest('.js-menos'))  { carrito = C.cambiarCantidad(carrito, id, -1); guardar(); pintarCarrito(); return; }
      if (e.target.closest('.js-quitar')) { carrito = C.quitar(carrito, id); guardar(); pintarCarrito(); return; }
    }

    if (e.target.closest('.js-cart-open')) { e.preventDefault(); abrirCarrito(); }
    if (e.target.closest('#cartClose') || e.target.id === 'overlay') cerrarCarrito();
    if (e.target.closest('#modalX') || e.target.id === 'modal') cerrarFicha();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { cerrarCarrito(); cerrarFicha(); }
  });

  // Envío por WhatsApp
  $('#btnWa')?.addEventListener('click', () => {
    if (!carrito.length) return;
    const datos = {
      nombre: $('#fNombre')?.value.trim(),
      direccion: $('#fDireccion')?.value.trim(),
      entrega: $('#fEntrega')?.value,
      pago: $('#fPago')?.value,
      notas: $('#fNotas')?.value.trim()
    };
    if (!CONFIG.whatsapp) return avisar('Falta configurar WHATSAPP_NUMERO en .env');
    window.open(C.enlaceWhatsApp(carrito, CONFIG, datos), '_blank', 'noopener');
  });

  // Buscador del encabezado → manda a la tienda
  $$('.js-search').forEach((inp) => {
    inp.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const q = inp.value.trim();
      if (location.pathname.endsWith('tienda.html')) {
        window.dispatchEvent(new CustomEvent('buscar', { detail: q }));
      } else {
        location.href = `tienda.html?q=${encodeURIComponent(q)}`;
      }
    });
  });

  $('#burger')?.addEventListener('click', () => $('#navMovil')?.toggleAttribute('hidden'));

  // Render según la página
  if ($('#gridDestacados')) montarInicio();
  if ($('#gridTienda'))     montarTienda();
  if ($('#gridOfertas'))    montarOfertas();
});

/* ---------------- Inicio ---------------- */
function montarInicio() {
  $('#heroImg').src = HERO.principal;
  $('#heroAb').src  = HERO.abarrotes;
  $('#heroPa').src  = HERO.papeleria;

  pintarGrid($('#gridDestacados'), PRODUCTOS.filter((p) => p.tags.includes('destacado')).slice(0, 8));
  pintarGrid($('#gridNuevos'),     PRODUCTOS.filter((p) => p.tags.includes('nuevo')).slice(0, 4));

  $('#cats').innerHTML = CATEGORIAS.map((c) => `
    <a class="cat" href="tienda.html?cat=${c.id}">
      <span class="cat__ico" aria-hidden="true">${c.icono}</span>
      <b>${c.nombre}</b>
      <span>${PRODUCTOS.filter((p) => p.cat === c.id).length} productos</span>
    </a>`).join('');

  $('#deals').innerHTML = OFERTAS_SEMANA.banners.map((b) => `
    <div class="deal"><b>${esc(b.t)}</b><span>${esc(b.s)}</span></div>`).join('');
}

/* ---------------- Tienda ---------------- */
function montarTienda() {
  const url = new URLSearchParams(location.search);
  const f = {
    q: url.get('q') || '',
    depto: url.get('depto') || 'todos',
    cats: url.get('cat') ? [url.get('cat')] : [],
    marcas: [],
    max: Math.max(...PRODUCTOS.map((p) => p.p)),
    orden: 'relevancia',
    soloOferta: false,
    soloDisponible: false,
    categorias_meta: CATEGORIAS
  };
  const MAXP = f.max;
  const inputBusq = $('#busqTienda');
  if (inputBusq) inputBusq.value = f.q;

  const catsVisibles = () =>
    CATEGORIAS.filter((c) => f.depto === 'todos' || c.depto === f.depto);

  function pintarFiltros() {
    $('#fCats').innerHTML = catsVisibles().map((c) => `
      <label class="chk">
        <input type="checkbox" value="${c.id}" ${f.cats.includes(c.id) ? 'checked' : ''}>
        <span>${c.icono} ${c.nombre}</span>
        <small>${PRODUCTOS.filter((p) => p.cat === c.id).length}</small>
      </label>`).join('');

    const marcas = [...new Set(PRODUCTOS.map((p) => p.marca))].sort((a, b) => a.localeCompare(b, 'es'));
    $('#fMarcas').innerHTML = marcas.map((m) => `
      <label class="chk">
        <input type="checkbox" value="${esc(m)}" ${f.marcas.includes(m) ? 'checked' : ''}>
        <span>${esc(m)}</span>
      </label>`).join('');
  }

  function aplicar() {
    const r = C.filtrar(PRODUCTOS, f);
    pintarGrid($('#gridTienda'), r);
    $('#contador').textContent = `${r.length} ${r.length === 1 ? 'producto' : 'productos'}`;
    const t = DEPTOS[f.depto];
    $('#tituloTienda').textContent = t ? t.nombre : 'Todo el catálogo';
    $('#subtituloTienda').textContent = t ? t.desc : 'Abarrotes y papelería en un mismo pedido, con entrega el mismo día.';
    $$('.js-depto').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.depto === f.depto)));
  }

  $('#fCats').addEventListener('change', (e) => {
    f.cats = $$('#fCats input:checked').map((i) => i.value); aplicar();
  });
  $('#fMarcas').addEventListener('change', () => {
    f.marcas = $$('#fMarcas input:checked').map((i) => i.value); aplicar();
  });
  const rango = $('#fPrecio');
  rango.max = MAXP; rango.value = MAXP;
  $('#precioVal').textContent = C.mxn(MAXP);
  rango.addEventListener('input', () => { f.max = +rango.value; $('#precioVal').textContent = C.mxn(f.max); aplicar(); });
  $('#fOferta').addEventListener('change', (e) => { f.soloOferta = e.target.checked; aplicar(); });
  $('#fDisp').addEventListener('change', (e) => { f.soloDisponible = e.target.checked; aplicar(); });
  $('#orden').addEventListener('change', (e) => { f.orden = e.target.value; aplicar(); });
  inputBusq?.addEventListener('input', () => { f.q = inputBusq.value; aplicar(); });
  window.addEventListener('buscar', (e) => { f.q = e.detail; if (inputBusq) inputBusq.value = e.detail; aplicar(); });

  $$('.js-depto').forEach((b) => b.addEventListener('click', () => {
    f.depto = b.dataset.depto; f.cats = []; pintarFiltros(); aplicar();
  }));
  $('#limpiar').addEventListener('click', () => {
    f.q=''; f.cats=[]; f.marcas=[]; f.max=MAXP; f.soloOferta=false; f.soloDisponible=false; f.depto='todos';
    if (inputBusq) inputBusq.value='';
    rango.value = MAXP; $('#precioVal').textContent = C.mxn(MAXP);
    $('#fOferta').checked=false; $('#fDisp').checked=false;
    pintarFiltros(); aplicar();
  });
  $('#toggleFiltros').addEventListener('click', () => $('#filtros').classList.toggle('open'));

  pintarFiltros(); aplicar();
}

/* ---------------- Ofertas ---------------- */
function montarOfertas() {
  $('#vigencia').textContent = OFERTAS_SEMANA.vigencia;
  $('#deals2').innerHTML = OFERTAS_SEMANA.banners.map((b) => `
    <div class="deal"><b>${esc(b.t)}</b><span>${esc(b.s)}</span></div>`).join('');
  pintarGrid($('#gridOfertas'), C.filtrar(PRODUCTOS, { soloOferta: true, orden: 'descuento' }));
}
