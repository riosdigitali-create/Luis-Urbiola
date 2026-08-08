/* Compone las páginas HTML a partir de parciales reutilizables
   (encabezado, carrito, modal, pie). Ejecutar: npm run build:pages */
import { writeFileSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const env = Object.fromEntries(
  readFileSync(resolve(raiz, '.env.example'), 'utf8').split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
);
const NEG = env.NEGOCIO_NOMBRE || 'La Esquina';

const ico = (d) => `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const icoBuscar = ico('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>');
const icoCarro  = ico('<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.4 11.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6"/>');
const icoMenu   = ico('<path d="M3 6h18M3 12h18M3 18h18"/>');

const head = (t, d) => `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${t}</title>
  <meta name="description" content="${d}">
  <meta name="theme-color" content="#FF5A1F">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${t}">
  <meta property="og:description" content="${d}">
  <meta property="og:locale" content="es_MX">
  <meta name="robots" content="index,follow">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://images.unsplash.com">
  <link rel="dns-prefetch" href="https://images.unsplash.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/estilos.css">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='26' fill='%23FF5A1F'/><text y='72' x='50' text-anchor='middle' font-size='58'>C</text></svg>">
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"GroceryStore","name":"${NEG}","description":"${d}",
   "address":{"@type":"PostalAddress","streetAddress":"${env.NEGOCIO_DIRECCION}","addressCountry":"MX"},
   "openingHours":"Mo-Sa 07:00-21:00","priceRange":"$$","currenciesAccepted":"MXN"}
  </script>
</head>
<body>
<a class="skip" href="#main">Saltar al contenido</a>`;

const header = (pag) => {
  const link = (h, t, id) => `<a href="${h}"${id === pag ? ' aria-current="page"' : ''}>${t}</a>`;
  return `
<div class="topbar"><div class="wrap">
  Envio <b>GRATIS</b> en pedidos desde <span data-cfg-mxn="envioGratisDesde">$350.00</span> &middot; Entrega el mismo dia
</div></div>

<header class="hdr">
  <div class="wrap hdr__in">
    <button class="iconbtn burger" id="burger" type="button" aria-label="Abrir menu" aria-expanded="false">${icoMenu}</button>
    <a class="logo" href="index.html">
      <span class="logo__mark" aria-hidden="true">&#128722;</span>
      <span>${NEG}<small>Abarrotes y papeleria</small></span>
    </a>
    <nav class="nav" aria-label="Principal">
      ${link('index.html', 'Inicio', 'inicio')}
      ${link('tienda.html?depto=abarrotes', 'Abarrotes', 'abarrotes')}
      ${link('tienda.html?depto=papeleria', 'Papeler&iacute;a', 'papeleria')}
      ${link('ofertas.html', 'Ofertas', 'ofertas')}
    </nav>
    <div class="hdr__actions">
      <div class="search">
        <label class="sr-only" for="q">Buscar productos</label>
        ${icoBuscar}
        <input class="js-search" id="q" type="search" placeholder="Buscar arroz, cuadernos, cafe..." autocomplete="off">
      </div>
      <button class="iconbtn js-cart-open" type="button" aria-label="Abrir carrito">
        ${icoCarro}<span class="badge js-cart-count" hidden>0</span>
      </button>
    </div>
  </div>
  <div class="search search--mobile" hidden id="navMovil">
    <label class="sr-only" for="qm">Buscar productos</label>
    <input class="js-search" id="qm" type="search" placeholder="Buscar productos..." autocomplete="off">
    <nav class="nav" style="display:flex;flex-wrap:wrap;margin:10px 0 0" aria-label="Principal movil">
      ${link('index.html', 'Inicio', 'inicio')}
      ${link('tienda.html?depto=abarrotes', 'Abarrotes', 'abarrotes')}
      ${link('tienda.html?depto=papeleria', 'Papeler&iacute;a', 'papeleria')}
      ${link('ofertas.html', 'Ofertas', 'ofertas')}
    </nav>
  </div>
</header>`;
};

const carritoHTML = `
<div class="overlay" id="overlay"></div>
<aside class="cart" id="cart" role="dialog" aria-modal="true" aria-label="Carrito de compras" aria-hidden="true">
  <div class="cart__hd">
    <h2>Tu pedido</h2>
    <button class="iconbtn" id="cartClose" type="button" aria-label="Cerrar carrito">&#10005;</button>
  </div>
  <div class="cart__items" id="cartItems"></div>
  <div class="cart__ft" id="cartFoot" hidden>
    <div class="field">
      <label for="fNombre">Nombre de quien recibe</label>
      <input id="fNombre" type="text" placeholder="Ana Rivera" autocomplete="name">
    </div>
    <div class="field">
      <label for="fDireccion">Direccion de entrega</label>
      <input id="fDireccion" type="text" placeholder="Calle, numero, colonia" autocomplete="street-address">
    </div>
    <div class="field" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <span><label for="fEntrega">Entrega</label>
        <select id="fEntrega"><option value="domicilio">A domicilio</option><option value="tienda">Recoger en tienda</option></select></span>
      <span><label for="fPago">Pago</label>
        <select id="fPago"><option>Efectivo</option><option>Transferencia</option><option>Tarjeta en entrega</option></select></span>
    </div>
    <div class="field">
      <label for="fNotas">Notas para el pedido</label>
      <textarea id="fNotas" placeholder="Ej. tocar el timbre, el pan bien dorado..."></textarea>
    </div>
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
  <button class="btn btn--dark btn--block js-cart-open" type="button">
    Ver pedido &middot; <span class="js-cart-total">$0.00</span>
  </button>
</div>`;

const footer = `
<footer class="ft">
  <div class="wrap">
    <div class="ft__grid">
      <div>
        <span class="ft__logo">${NEG}</span>
        <p>La tienda del barrio, ahora tambien en linea. Abarrotes frescos y toda la papeleria, con entrega el mismo dia en tu colonia.</p>
        <p><b style="color:#fff" data-cfg="direccion"></b></p>
        <p data-cfg="horario"></p>
      </div>
      <div><h4>Comprar</h4>
        <a href="tienda.html?depto=abarrotes">Abarrotes</a>
        <a href="tienda.html?depto=papeleria">Papeleria</a>
        <a href="ofertas.html">Ofertas de la semana</a>
        <a href="tienda.html">Todo el catalogo</a></div>
      <div><h4>Ayuda</h4>
        <a href="#envios">Envios y cobertura</a>
        <a href="#pagos">Formas de pago</a>
        <a href="#devoluciones">Cambios y devoluciones</a>
        <a href="#faq">Preguntas frecuentes</a></div>
      <div><h4>Contacto</h4>
        <a href="#" data-cfg="email"></a>
        <a href="#">Pedidos por WhatsApp</a>
        <a href="#">Facturacion</a></div>
    </div>
    <div class="ft__bot">
      <span>&copy; 2026 ${NEG}. Precios en pesos mexicanos, IVA incluido.</span>
      <span>Fotografias de Unsplash &middot; Contenido de demostracion</span>
    </div>
  </div>
</footer>
<script type="module" src="js/app.js"></script>
</body>
</html>`;

const pagina = ({ archivo, titulo, desc, pag, main }) =>
  writeFileSync(resolve(raiz, archivo), head(titulo, desc) + header(pag) + main + carritoHTML + footer);

pagina({
  archivo: 'index.html', pag: 'inicio',
  titulo: `${NEG} - Abarrotes y papeleria a domicilio`,
  desc: 'Despensa, lacteos, pan del dia, limpieza, cuadernos y utiles escolares. Arma tu pedido y envialo por WhatsApp. Entrega el mismo dia.',
  main: `
<main id="main">
  <section class="hero"><div class="wrap"><div class="hero__grid">
    <div class="hero__main">
      <img id="heroImg" alt="Pasillo de tienda de abarrotes con estantes surtidos" fetchpriority="high" width="1400" height="900">
      <div class="hero__copy">
        <span class="pill">Entrega el mismo dia</span>
        <h1>Tu despensa y tu papeleria en un solo pedido</h1>
        <p>Arma tu carrito, revisa el total y mandalo por WhatsApp. Nosotros lo preparamos y lo llevamos a tu puerta.</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <a class="btn btn--primary" href="tienda.html">Ver catalogo</a>
          <a class="btn btn--ghost" href="ofertas.html">Ofertas de la semana</a>
        </div>
      </div>
    </div>
    <div class="hero__side">
      <a class="hcard" href="tienda.html?depto=abarrotes">
        <img id="heroAb" alt="Frutas y abarrotes acomodados en anaqueles de madera" loading="lazy" width="800" height="600">
        <div><h3>Abarrotes</h3><span>Despensa, lacteos, pan y limpieza</span></div>
      </a>
      <a class="hcard" href="tienda.html?depto=papeleria">
        <img id="heroPa" alt="Exhibidor con cuadernos y material de arte" loading="lazy" width="800" height="600">
        <div><h3>Papeleria</h3><span>Cuadernos, escritura, arte y mochilas</span></div>
      </a>
    </div>
  </div></div></section>

  <section class="sec"><div class="wrap">
    <div class="perks">
      <div class="perk"><b>Envio el mismo dia</b><span>Pide antes de las 18:00 y recibelo hoy dentro de la colonia.</span></div>
      <div class="perk"><b>Pedido por WhatsApp</b><span>Sin apps ni registros. Tu pedido llega escrito y con el total calculado.</span></div>
      <div class="perk"><b>Pan del dia</b><span>Horneado a las 7:00 y a las 17:00. Si se agota, te avisamos.</span></div>
      <div class="perk"><b>Paga como quieras</b><span>Efectivo, transferencia o tarjeta al momento de la entrega.</span></div>
    </div>
  </div></section>

  <section class="sec" id="categorias"><div class="wrap">
    <div class="sec__head"><div>
      <p class="eyebrow">Categorias</p>
      <h2>Encuentra rapido lo que buscas</h2>
      <p>Doce categorias entre abarrotes y papeleria, con precios actualizados todos los lunes.</p>
    </div></div>
    <div class="cats" id="cats"></div>
  </div></section>

  <section class="sec"><div class="wrap">
    <div class="sec__head"><div>
      <p class="eyebrow">Lo mas pedido</p>
      <h2>Productos destacados</h2>
      <p>Lo que mas sale de la tienda esta temporada.</p>
    </div><a class="btn btn--ghost" href="tienda.html">Ver todo</a></div>
    <div class="grid" id="gridDestacados"></div>
  </div></section>

  <section class="sec"><div class="wrap">
    <div class="strip">
      <div>
        <p class="eyebrow" style="color:var(--yellow)">Ofertas de la semana</p>
        <h2>Promociones que si bajan el ticket</h2>
        <p>Tres promociones activas cada semana en despensa, limpieza y regreso a clases.</p>
      </div>
      <a class="btn btn--primary" href="ofertas.html">Ver ofertas</a>
    </div>
    <div class="deals" id="deals" style="margin-top:16px"></div>
  </div></section>

  <section class="sec"><div class="wrap">
    <div class="sec__head"><div>
      <p class="eyebrow">Recien llegado</p>
      <h2>Novedades en el anaquel</h2>
    </div></div>
    <div class="grid" id="gridNuevos"></div>
  </div></section>
</main>`
});

pagina({
  archivo: 'tienda.html', pag: 'abarrotes',
  titulo: `Catalogo - ${NEG}`,
  desc: 'Busca y filtra entre 56 productos de abarrotes y papeleria por categoria, marca, precio y disponibilidad.',
  main: `
<main id="main"><div class="wrap">
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
      <div class="fgroup">
        <h3>Buscar</h3>
        <label class="sr-only" for="busqTienda">Buscar en el catalogo</label>
        <input id="busqTienda" type="search" placeholder="Nombre, marca..." style="width:100%;padding:10px 13px;border:1px solid var(--line);border-radius:10px">
      </div>
      <div class="fgroup"><h3>Categoria</h3><div id="fCats"></div></div>
      <div class="fgroup"><h3>Marca</h3><div id="fMarcas"></div></div>
      <div class="fgroup">
        <h3>Precio maximo</h3>
        <label class="sr-only" for="fPrecio">Precio maximo</label>
        <input class="range" id="fPrecio" type="range" min="0" step="5">
        <div class="rangeval"><span>$0</span><span id="precioVal"></span></div>
      </div>
      <div class="fgroup">
        <h3>Otros</h3>
        <label class="chk"><input type="checkbox" id="fOferta"><span>Solo en oferta</span></label>
        <label class="chk"><input type="checkbox" id="fDisp"><span>Solo disponibles</span></label>
      </div>
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
</div></main>`
});

pagina({
  archivo: 'ofertas.html', pag: 'ofertas',
  titulo: `Ofertas de la semana - ${NEG}`,
  desc: 'Promociones vigentes en despensa, limpieza, cafe y regreso a clases. Precios rebajados durante toda la semana.',
  main: `
<main id="main"><div class="wrap">
  <section class="sec">
    <div class="strip">
      <div>
        <p class="eyebrow" style="color:var(--yellow)">Vigencia: <span id="vigencia"></span></p>
        <h2>Ofertas de la semana</h2>
        <p>Precios rebajados en toda la tienda mientras dure el inventario. Se actualizan cada lunes por la manana.</p>
      </div>
      <a class="btn btn--primary" href="tienda.html">Ver catalogo completo</a>
    </div>
    <div class="deals" id="deals2" style="margin-top:16px"></div>
  </section>

  <section class="sec" style="padding-top:0">
    <div class="sec__head"><div>
      <p class="eyebrow">Precio rebajado</p>
      <h2>Productos en oferta</h2>
      <p>Ordenados por porcentaje de descuento, del mayor al menor.</p>
    </div></div>
    <div class="grid" id="gridOfertas"></div>
  </section>
</div></main>`
});

console.log('OK: index.html, tienda.html y ofertas.html generadas');
