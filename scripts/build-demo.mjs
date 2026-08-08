/* Genera UN SOLO archivo HTML autónomo con las tres vistas del sitio.
   Sin servidor, sin Node, sin dependencias: se abre con doble clic. */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const R = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const leer = (p) => readFileSync(resolve(R, p), 'utf8');
const plano = (s) => s
  .replace(/^\s*import[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '')
  .replace(/^\s*export\s+(?=(const|function|let|class))/gm, '')
  .replace(/^\s*export\s+\{[^}]*\};?\s*$/gm, '');

/* Adapta app.js multi-pagina a una sola pagina con router por hash. */
const adaptarApp = (src) => plano(src)
  // el arranque deja de depender de DOMContentLoaded
  .replace("document.addEventListener('DOMContentLoaded', () => {", 'function arrancar(){')
  .replace(/\n\}\);\n\n\/\* -+ Inicio -+ \*\//, '\n}\n\n/* --- Inicio --- */')
  // los parametros viajan en el hash, no en la query
  .replace('const url = new URLSearchParams(location.search);',
           "const url = new URLSearchParams(location.hash.split('?')[1] || '');")
  .replace("location.href = `tienda.html?q=${encodeURIComponent(q)}`;",
           "location.hash = `#/tienda?q=${encodeURIComponent(q)}`;")
  .replace("if (location.pathname.endsWith('tienda.html'))", "if (location.hash.startsWith('#/tienda'))")
  .replace(/href="tienda\.html\?cat=\$\{c\.id\}"/g, 'href="#/tienda?cat=${c.id}"')
  // puente para que el router pueda re-aplicar filtros al cambiar de vista
  .replace(/\n  pintarFiltros\(\); aplicar\(\);\n\}/,
    `\n  aplicarDesdeURL = (p) => {
    f.depto = p.get('depto') || 'todos';
    f.cats  = p.get('cat') ? [p.get('cat')] : [];
    f.q     = p.get('q') || '';
    if (inputBusq) inputBusq.value = f.q;
    pintarFiltros(); aplicar();
  };
  pintarFiltros(); aplicar();
}`);

const DESTINO = process.argv[2] || resolve(R, '..', 'DEMO-Abarrotes-y-Papeleria.html');

const VISTA = `
<main id="main">
  <!-- ===== INICIO ===== -->
  <section class="vista" id="v-inicio">
    <div class="hero"><div class="wrap"><div class="hero__grid">
      <div class="hero__main">
        <img id="heroImg" alt="Pasillo de tienda de abarrotes con estantes surtidos" fetchpriority="high" width="1400" height="900">
        <div class="hero__copy">
          <span class="pill">Entrega el mismo dia</span>
          <h1>Tu despensa y tu papeleria en un solo pedido</h1>
          <p>Arma tu carrito, revisa el total y mandalo por WhatsApp. Nosotros lo preparamos y lo llevamos a tu puerta.</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <a class="btn btn--primary" href="#/tienda">Ver catalogo</a>
            <a class="btn btn--ghost" href="#/ofertas">Ofertas de la semana</a>
          </div>
        </div>
      </div>
      <div class="hero__side">
        <a class="hcard" href="#/tienda?depto=abarrotes">
          <img id="heroAb" alt="Frutas y abarrotes en anaqueles de madera" loading="lazy" width="800" height="600">
          <div><h3>Abarrotes</h3><span>Despensa, lacteos, pan y limpieza</span></div>
        </a>
        <a class="hcard" href="#/tienda?depto=papeleria">
          <img id="heroPa" alt="Exhibidor con cuadernos y material de arte" loading="lazy" width="800" height="600">
          <div><h3>Papeleria</h3><span>Cuadernos, escritura, arte y mochilas</span></div>
        </a>
      </div>
    </div></div></div>

    <div class="sec"><div class="wrap"><div class="perks">
      <div class="perk"><b>Envio el mismo dia</b><span>Pide antes de las 18:00 y recibelo hoy dentro de la colonia.</span></div>
      <div class="perk"><b>Pedido por WhatsApp</b><span>Sin apps ni registros. Tu pedido llega escrito y con el total calculado.</span></div>
      <div class="perk"><b>Pan del dia</b><span>Horneado a las 7:00 y a las 17:00. Si se agota, te avisamos.</span></div>
      <div class="perk"><b>Paga como quieras</b><span>Efectivo, transferencia o tarjeta al momento de la entrega.</span></div>
    </div></div></div>

    <div class="sec"><div class="wrap">
      <div class="sec__head"><div>
        <p class="eyebrow">Categorias</p><h2>Encuentra rapido lo que buscas</h2>
        <p>Doce categorias entre abarrotes y papeleria, con precios actualizados cada lunes.</p>
      </div></div>
      <div class="cats" id="cats"></div>
    </div></div>

    <div class="sec"><div class="wrap">
      <div class="sec__head"><div>
        <p class="eyebrow">Lo mas pedido</p><h2>Productos destacados</h2>
      </div><a class="btn btn--ghost" href="#/tienda">Ver todo</a></div>
      <div class="grid" id="gridDestacados"></div>
    </div></div>

    <div class="sec"><div class="wrap">
      <div class="strip">
        <div><p class="eyebrow" style="color:var(--yellow)">Ofertas de la semana</p>
          <h2>Promociones que si bajan el ticket</h2>
          <p>Tres promociones activas cada semana en despensa, limpieza y regreso a clases.</p></div>
        <a class="btn btn--primary" href="#/ofertas">Ver ofertas</a>
      </div>
      <div class="deals" id="deals" style="margin-top:16px"></div>
    </div></div>

    <div class="sec"><div class="wrap">
      <div class="sec__head"><div><p class="eyebrow">Recien llegado</p><h2>Novedades en el anaquel</h2></div></div>
      <div class="grid" id="gridNuevos"></div>
    </div></div>
  </section>

  <!-- ===== TIENDA ===== -->
  <section class="vista" id="v-tienda" hidden><div class="wrap">
    <div style="padding:26px 0 4px">
      <p class="eyebrow">Catalogo</p>
      <h1 id="tituloTienda" style="font-size:clamp(1.6rem,3vw,2.3rem)">Todo el catalogo</h1>
      <p id="subtituloTienda" style="color:var(--ink-2);margin:8px 0 0"></p>
      <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap">
        <button class="btn btn--ghost js-depto" data-depto="todos" type="button" aria-pressed="true">Todo</button>
        <button class="btn btn--ghost js-depto" data-depto="abarrotes" type="button" aria-pressed="false">Abarrotes</button>
        <button class="btn btn--ghost js-depto" data-depto="papeleria" type="button" aria-pressed="false">Papeleria</button>
      </div>
    </div>
    <div class="shop">
      <aside class="filters" id="filtros" aria-label="Filtros">
        <div class="fgroup"><h3>Buscar</h3>
          <label class="sr-only" for="busqTienda">Buscar en el catalogo</label>
          <input id="busqTienda" type="search" placeholder="Nombre, marca..." style="width:100%;padding:10px 13px;border:1px solid var(--line);border-radius:10px"></div>
        <div class="fgroup"><h3>Categoria</h3><div id="fCats"></div></div>
        <div class="fgroup"><h3>Marca</h3><div id="fMarcas"></div></div>
        <div class="fgroup"><h3>Precio maximo</h3>
          <label class="sr-only" for="fPrecio">Precio maximo</label>
          <input class="range" id="fPrecio" type="range" min="0" step="5">
          <div class="rangeval"><span>$0</span><span id="precioVal"></span></div></div>
        <div class="fgroup"><h3>Otros</h3>
          <label class="chk"><input type="checkbox" id="fOferta"><span>Solo en oferta</span></label>
          <label class="chk"><input type="checkbox" id="fDisp"><span>Solo disponibles</span></label></div>
        <button class="btn btn--ghost btn--block" id="limpiar" type="button">Limpiar filtros</button>
      </aside>
      <div>
        <div class="toolbar">
          <button class="btn btn--ghost filtersToggle" id="toggleFiltros" type="button">Filtros</button>
          <span class="count" id="contador" aria-live="polite"></span>
          <label class="sr-only" for="orden">Ordenar por</label>
          <select id="orden">
            <option value="relevancia">Mas relevantes</option>
            <option value="precio_asc">Precio: menor a mayor</option>
            <option value="precio_desc">Precio: mayor a menor</option>
            <option value="descuento">Mayor descuento</option>
            <option value="nombre">Nombre A-Z</option>
          </select>
        </div>
        <div class="grid" id="gridTienda"></div>
      </div>
    </div>
  </div></section>

  <!-- ===== OFERTAS ===== -->
  <section class="vista" id="v-ofertas" hidden><div class="wrap">
    <div class="sec">
      <div class="strip">
        <div><p class="eyebrow" style="color:var(--yellow)">Vigencia: <span id="vigencia"></span></p>
          <h2>Ofertas de la semana</h2>
          <p>Precios rebajados mientras dure el inventario. Se actualizan cada lunes por la manana.</p></div>
        <a class="btn btn--primary" href="#/tienda">Ver catalogo completo</a>
      </div>
      <div class="deals" id="deals2" style="margin-top:16px"></div>
    </div>
    <div class="sec" style="padding-top:0">
      <div class="sec__head"><div><p class="eyebrow">Precio rebajado</p><h2>Productos en oferta</h2>
        <p>Ordenados por porcentaje de descuento, del mayor al menor.</p></div></div>
      <div class="grid" id="gridOfertas"></div>
    </div>
  </div></section>
</main>`;

const ROUTER = `
let aplicarDesdeURL = () => {};
/* ---- Router por hash: una sola pagina, tres vistas ---- */
function rutaActual() {
  const h = location.hash.replace(/^#\\/?/, '') || 'inicio';
  const [nombre, query] = h.split('?');
  return { vista: ['inicio','tienda','ofertas'].includes(nombre) ? nombre : 'inicio',
           params: new URLSearchParams(query || '') };
}
function navegar() {
  const { vista, params } = rutaActual();
  document.querySelectorAll('.vista').forEach(s => s.hidden = s.id !== 'v-' + vista);
  document.querySelectorAll('.nav a').forEach(a => {
    const suya = (a.getAttribute('href') || '').replace(/^#\\//, '').split('?')[0] || 'inicio';
    suya === vista ? a.setAttribute('aria-current','page') : a.removeAttribute('aria-current');
  });
  if (vista === 'tienda') aplicarDesdeURL(params);
  window.scrollTo({ top: 0, behavior: 'instant' });
  document.title = { inicio:'La Esquina - Abarrotes y papeleria a domicilio',
    tienda:'Catalogo - La Esquina', ofertas:'Ofertas de la semana - La Esquina' }[vista];
}
window.addEventListener('hashchange', navegar);`;

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>La Esquina - Abarrotes y papeleria a domicilio</title>
<meta name="description" content="Despensa, lacteos, pan del dia, limpieza, cuadernos y utiles escolares. Arma tu pedido y envialo por WhatsApp. Entrega el mismo dia.">
<meta name="theme-color" content="#FF5A1F">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://images.unsplash.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='26' fill='%23FF5A1F'/><text y='72' x='50' text-anchor='middle' font-size='58'>C</text></svg>">
<style>
${leer('css/estilos.css')}
.vista[hidden]{display:none}
</style>
</head>
<body>
<a class="skip" href="#main">Saltar al contenido</a>

<div class="topbar"><div class="wrap">
  Envio <b>GRATIS</b> en pedidos desde <span data-cfg-mxn="envioGratisDesde">$350.00</span> &middot; Entrega el mismo dia &middot; <b>DEMO</b>
</div></div>

<header class="hdr">
  <div class="wrap hdr__in">
    <button class="iconbtn burger" id="burger" type="button" aria-label="Abrir menu" aria-expanded="false">
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button>
    <a class="logo" href="#/inicio">
      <span class="logo__mark" aria-hidden="true">&#128722;</span>
      <span>La Esquina<small>Abarrotes y papeleria</small></span>
    </a>
    <nav class="nav" aria-label="Principal">
      <a href="#/inicio">Inicio</a>
      <a href="#/tienda?depto=abarrotes">Abarrotes</a>
      <a href="#/tienda?depto=papeleria">Papeleria</a>
      <a href="#/ofertas">Ofertas</a>
    </nav>
    <div class="hdr__actions">
      <div class="search">
        <label class="sr-only" for="q">Buscar productos</label>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>
        <input class="js-search" id="q" type="search" placeholder="Buscar arroz, cuadernos, cafe..." autocomplete="off">
      </div>
      <button class="iconbtn js-cart-open" type="button" aria-label="Abrir carrito">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.4 11.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6"/></svg>
        <span class="badge js-cart-count" hidden>0</span>
      </button>
    </div>
  </div>
  <div class="search search--mobile" hidden id="navMovil">
    <label class="sr-only" for="qm">Buscar productos</label>
    <input class="js-search" id="qm" type="search" placeholder="Buscar productos..." autocomplete="off">
    <nav class="nav" style="display:flex;flex-wrap:wrap;margin:10px 0 0" aria-label="Principal movil">
      <a href="#/inicio">Inicio</a><a href="#/tienda?depto=abarrotes">Abarrotes</a>
      <a href="#/tienda?depto=papeleria">Papeleria</a><a href="#/ofertas">Ofertas</a>
    </nav>
  </div>
</header>

${VISTA}

<div class="overlay" id="overlay"></div>
<aside class="cart" id="cart" role="dialog" aria-modal="true" aria-label="Carrito de compras" aria-hidden="true">
  <div class="cart__hd"><h2>Tu pedido</h2>
    <button class="iconbtn" id="cartClose" type="button" aria-label="Cerrar carrito">&#10005;</button></div>
  <div class="cart__items" id="cartItems"></div>
  <div class="cart__ft" id="cartFoot" hidden>
    <div class="field"><label for="fNombre">Nombre de quien recibe</label>
      <input id="fNombre" type="text" placeholder="Ana Rivera" autocomplete="name"></div>
    <div class="field"><label for="fDireccion">Direccion de entrega</label>
      <input id="fDireccion" type="text" placeholder="Calle, numero, colonia" autocomplete="street-address"></div>
    <div class="field" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <span><label for="fEntrega">Entrega</label>
        <select id="fEntrega"><option value="domicilio">A domicilio</option><option value="tienda">Recoger en tienda</option></select></span>
      <span><label for="fPago">Pago</label>
        <select id="fPago"><option>Efectivo</option><option>Transferencia</option><option>Tarjeta en entrega</option></select></span>
    </div>
    <div class="field"><label for="fNotas">Notas para el pedido</label>
      <textarea id="fNotas" placeholder="Ej. tocar el timbre, el pan bien dorado..."></textarea></div>
    <div class="row"><span>Subtotal</span><span id="rowSub">$0.00</span></div>
    <div class="row"><span>Envio</span><span id="rowEnvio">$0.00</span></div>
    <div class="row row--total"><span>Total</span><span id="rowTotal">$0.00</span></div>
    <p class="cart__note" id="cartNota"></p>
    <button class="btn btn--wa btn--block" id="btnWa" type="button" style="margin-top:12px">Enviar pedido por WhatsApp</button>
    <p class="cart__note">Se abre WhatsApp con tu pedido ya escrito. Confirmas ahi y listo.</p>
  </div>
</aside>

<div class="modal" id="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitulo" aria-hidden="true">
  <div class="modal__bd" id="modalBody"></div>
</div>

<div class="mbar">
  <button class="btn btn--dark btn--block js-cart-open" type="button">Ver pedido &middot; <span class="js-cart-total">$0.00</span></button>
</div>

<footer class="ft"><div class="wrap">
  <div class="ft__grid">
    <div><span class="ft__logo">La Esquina</span>
      <p>La tienda del barrio, ahora tambien en linea. Abarrotes frescos y toda la papeleria, con entrega el mismo dia en tu colonia.</p>
      <p><b style="color:#fff" data-cfg="direccion"></b></p><p data-cfg="horario"></p></div>
    <div><h4>Comprar</h4><a href="#/tienda?depto=abarrotes">Abarrotes</a><a href="#/tienda?depto=papeleria">Papeleria</a>
      <a href="#/ofertas">Ofertas de la semana</a><a href="#/tienda">Todo el catalogo</a></div>
    <div><h4>Ayuda</h4><a href="#/inicio">Envios y cobertura</a><a href="#/inicio">Formas de pago</a>
      <a href="#/inicio">Cambios y devoluciones</a><a href="#/inicio">Preguntas frecuentes</a></div>
    <div><h4>Contacto</h4><a href="#/inicio" data-cfg="email"></a><a href="#/inicio">Pedidos por WhatsApp</a><a href="#/inicio">Facturacion</a></div>
  </div>
  <div class="ft__bot">
    <span>&copy; 2026 La Esquina. Precios en pesos mexicanos, IVA incluido.</span>
    <span>Demostracion &middot; Fotografias de Unsplash</span>
  </div>
</div></footer>

<script>
(function(){
"use strict";
${plano(leer('js/config.generated.js'))}
${plano(leer('js/datos.js'))}
${plano(leer('js/carrito.js'))}
const C = { mxn, estadoStock, agregar, cambiarCantidad, quitar, piezas, totales,
            mensajeWhatsApp, enlaceWhatsApp, filtrar, descuento, deptoDe };
${adaptarApp(leer('js/app.js'))}
${ROUTER}
arrancar();
navegar();
})();
</script>
</body>
</html>`;

/* replace con funcion: evita que $$ del codigo se colapse a $ */
writeFileSync(DESTINO, html);
console.log('OK ->', DESTINO, `(${(html.length / 1024).toFixed(0)} KB)`);
