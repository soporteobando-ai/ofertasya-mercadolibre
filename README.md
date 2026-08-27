# OfertasYA — Catálogo de afiliados Mercado Libre

Sitio estático (HTML + Tailwind CSS vía CDN + JavaScript vanilla) para mostrar un catálogo de productos con enlaces de afiliado a Mercado Libre, con búsqueda en tiempo real y filtros por categoría.

## Estructura del proyecto

```
web_Ventas_mercadolibre/
├── index.html          # Página principal (navbar, hero, filtros, grid, footer)
├── admin.html           # Panel de administración: agregar/editar/ocultar productos
├── css/
│   └── style.css       # Estilos complementarios a Tailwind (animaciones, line-clamp, etc.)
├── js/
│   ├── app.js           # Lógica del sitio público: filtros, búsqueda y render de tarjetas
│   ├── admin.js         # Lógica del panel de administración
│   ├── storage.js       # Capa compartida de persistencia (localStorage)
│   └── products.json    # Catálogo de fábrica (semilla inicial)
└── README.md
```

## Panel de administración (cargar/seleccionar tus productos)

Abrí **`admin.html`** (o hacé clic en "Panel de administración" en el footer del sitio) para gestionar el catálogo
sin tocar código:

- **Agregar producto**: completá el formulario (título, categoría, precio, descripción, imagen, link de afiliado,
  calificación) y guardá.
- **Visible / Oculto**: activá o desactivá un producto del sitio público sin borrarlo.
- **Destacado**: marca el badge "⭐ Destacado" en la tarjeta.
- **Editar / Eliminar**: modificá o quitá cualquier producto ya cargado.
- **Exportar JSON**: descarga el catálogo actual como `products.json`, para reemplazar el archivo del proyecto
  antes de subir el sitio a producción (así los cambios quedan en el repo y no solo en tu navegador).
- **Importar JSON**: carga un archivo `products.json` completo (por ejemplo, para restaurarlo en otra compu).
- **Restaurar catálogo de fábrica**: vuelve a los productos originales del proyecto.

⚠️ Los cambios del panel se guardan en `localStorage`, es decir, **en el navegador donde los hiciste**. El sitio
público (`index.html`) los lee automáticamente. Para que otros visitantes (en otro navegador/dispositivo) vean tus
productos, exportá el JSON y reemplazá `js/products.json` antes de desplegar.

### Sobre las imágenes de producto

Los 8 productos de ejemplo usan fotos reales (no capturas de Mercado Libre: su sitio bloquea el scraping
automatizado con protección anti-bots, incluso vía su API pública). Para tus productos reales, la forma más simple
de conseguir la imagen exacta del producto es:

1. Abrí el producto real en Mercado Libre, en tu propio navegador (ahí no hay bloqueo, es solo anti-bots).
2. Clic derecho sobre la foto → **"Copiar dirección de la imagen"**.
3. Pegá esa URL en el campo "URL de imagen" del panel admin.

## Cómo agregar o editar productos manualmente (sin el panel)

Si preferís editar el JSON a mano en vez de usar `admin.html`, modificá `js/products.json`. Cada producto sigue
esta estructura:

```json
{
  "id": 9,
  "title": "Nombre del producto",
  "category": "Tecnología",
  "description": "Breve resumen del producto (1-2 líneas).",
  "price": 99990,
  "image": "https://url-de-la-imagen.jpg",
  "affiliateUrl": "https://www.mercadolibre.com.ar/tu-link-de-afiliado",
  "rating": 4.7,
  "featured": true
}
```

- `featured: true` muestra el badge "⭐ Destacado" en la tarjeta.
- `category` se usa automáticamente para generar los botones de filtro (no hace falta tocar el HTML/JS).
- No es necesario editar `index.html` ni `app.js` para agregar productos nuevos, solo el JSON.

## Ejecutar el proyecto en local

Como `app.js` carga `products.json` con `fetch()`, **no funciona abriendo `index.html` con doble clic** (los navegadores bloquean peticiones a archivos locales por seguridad/CORS). Necesitás levantar un servidor local simple:

### Opción 1: Python (si ya lo tenés instalado)
```bash
cd web_Ventas_mercadolibre
python -m http.server 8000
```
Abrí `http://localhost:8000` en el navegador.

### Opción 2: Node.js (con npx, sin instalar nada global)
```bash
cd web_Ventas_mercadolibre
npx serve
```

### Opción 3: Extensión "Live Server" de VS Code
Instalá la extensión **Live Server**, clic derecho sobre `index.html` → "Open with Live Server".

## Cómo desplegarlo gratis

### GitHub Pages
1. Subí esta carpeta a un repositorio de GitHub.
2. Andá a **Settings → Pages**.
3. En "Source" elegí la rama `main` y la carpeta `/root`.
4. Guardá; en unos minutos el sitio queda publicado en `https://tu-usuario.github.io/tu-repo/`.

### Vercel
1. Creá una cuenta en [vercel.com](https://vercel.com).
2. "Add New Project" → importá el repositorio (o arrastrá la carpeta con `vercel` CLI).
3. Framework preset: **Other** (sitio estático). No requiere build.
4. Deploy. Vercel te da una URL pública al instante.

### Netlify
1. Creá una cuenta en [netlify.com](https://netlify.com).
2. "Add new site" → "Deploy manually" → arrastrá la carpeta del proyecto.
3. Listo, obtenés una URL pública (podés conectar un dominio propio después).

En los tres casos no hace falta configurar build command ni output directory: es un sitio 100% estático.

## Personalización rápida

- **Colores/marca:** editá la sección `tailwind.config` dentro del `<script>` en `index.html` (colores `brand`).
- **Textos del hero:** editá directamente el `<section>` con el `<h1>` en `index.html`.
- **Disclaimer legal:** está en el `<footer>` de `index.html`, ajustalo según tus términos reales del Programa de Afiliados de Mercado Libre.

## Notas técnicas

- Tailwind se carga vía CDN (`cdn.tailwindcss.com`) para simplicidad; para producción a gran escala se recomienda migrar a una build local de Tailwind (PostCSS/CLI) para reducir el peso de la página.
- Todos los botones "Ver en Mercado Libre" usan `target="_blank"` y `rel="nofollow noopener noreferrer sponsored"` como corresponde a enlaces de afiliado.
- El buscador filtra por título, descripción y categoría, sin recargar la página.
- Los 8 `affiliateUrl` de ejemplo apuntan a productos reales y vigentes en Mercado Libre Argentina, pero **sin tu tag de afiliado**. Cuando te aprueben en el Programa de Afiliados, reemplazá cada link por el que te genera el propio Mercado Libre (o agregale tu parámetro de tracking) desde el panel `admin.html`.
