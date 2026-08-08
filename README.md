# La Esquina — Abarrotes y Papelería

Tienda en línea de barrio con carrito y **pedido por WhatsApp**. Sin backend: todo corre en el navegador, así que se puede publicar en cualquier hosting estático (Netlify, Vercel, GitHub Pages, Hostinger, un cPanel cualquiera).

## Arranque rápido

**La forma fácil:** doble clic en `ABRIR-SITIO.bat` (Windows) o `abrir-sitio.sh` (Mac/Linux). Solo necesitas tener [Node.js](https://nodejs.org) instalado.

**Desde la terminal:**

```bash
cp .env.example .env      # pon aquí tu número de WhatsApp
npm run dev               # abre http://localhost:4321
npm test                  # 13 pruebas del carrito, totales y WhatsApp
```

> El sitio necesita servirse por HTTP: los navegadores bloquean los módulos ES si abres el `.html` directamente desde el disco. `servidor.mjs` resuelve eso sin instalar nada.

## Variables de entorno

Todo lo configurable vive en `.env` (nunca en el código). `scripts/build-config.mjs` lo lee y escribe `js/config.generated.js`, que sí está en `.gitignore`.

| Variable | Para qué sirve |
|---|---|
| `WHATSAPP_NUMERO` | Número del negocio, formato internacional solo dígitos (`5215512345678`) |
| `NEGOCIO_NOMBRE` / `DIRECCION` / `HORARIO` / `EMAIL` | Se inyectan en encabezado, pie y datos estructurados |
| `ENVIO_COSTO` | Costo de envío cuando no aplica el gratis |
| `ENVIO_GRATIS_DESDE` | Subtotal a partir del cual el envío es gratis |
| `PEDIDO_MINIMO` | Debajo de este monto el botón de WhatsApp queda deshabilitado |

## Estructura

```
index.html  tienda.html  ofertas.html     ← generadas por scripts/build-pages.mjs
css/estilos.css                           ← sistema de diseño con variables CSS
js/datos.js                               ← catálogo (56 productos, 12 categorías)
js/carrito.js                             ← lógica pura: carrito, totales, WhatsApp, filtros
js/app.js                                 ← render y eventos (delegación única)
js/config.generated.js                    ← generado desde .env, ignorado por git
scripts/build-config.mjs  build-pages.mjs
tests/pruebas.mjs
```

`scripts/build-pages.mjs` mantiene encabezado, carrito, modal y pie como **parciales reutilizables**: se editan una vez y las tres páginas se regeneran.

## Cómo funciona el pedido por WhatsApp

1. El cliente arma el carrito (se guarda en `localStorage`, sobrevive al refresh).
2. `totales()` calcula subtotal, envío y total antes de enviar nada.
3. `mensajeWhatsApp()` arma el texto con productos, cantidades, importes, total y datos de entrega.
4. `enlaceWhatsApp()` lo codifica y abre `https://wa.me/<número>?text=…`.

El botón se bloquea si el subtotal no llega al pedido mínimo.

## Cambiar el catálogo

Edita `js/datos.js`. Cada producto necesita `id, n, cat, p, stock, marca, unidad, d, img` y opcionalmente `ant` (precio anterior, activa la etiqueta de descuento) y `tags` (`oferta`, `nuevo`, `destacado`). Cuando conectes un CMS o una API, reemplaza ese archivo y el resto sigue funcionando igual.

## Accesibilidad y rendimiento

- Landmarks, `aria-current`, `aria-pressed`, `aria-live` en contador y cantidades, foco visible y enlace de salto.
- Diálogos con `role="dialog"`, `aria-modal` y cierre con `Escape`.
- Imágenes con `width`/`height` para evitar saltos de layout, `loading="lazy"` fuera del hero y `fetchpriority="high"` en el hero.
- Sin frameworks ni dependencias en tiempo de ejecución. CSS y JS suman menos de 40 KB sin comprimir.

## Imágenes

Fotografías de Unsplash servidas desde su CDN con parámetros de tamaño y calidad. Para producción, descarga las que uses y sírvelas desde tu propio dominio en `.webp`.
