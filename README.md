# m-cv-angel-sampayo

Portafolio / CV web de Ángel Sampayo. Sitio estático, sin build ni dependencias de npm.

## Ver en local

```bash
node scripts/serve.mjs        # http://localhost:5500
```

(Abrir `index.html` con doble clic no basta: la escena 3D es un módulo ES y el navegador lo bloquea en `file://`.)

## Estructura

```
index.html            Todo el contenido en español (fuente de verdad)
css/styles.css        Tokens de color/tipo al inicio, luego una sección por bloque
js/i18n.js            Capa en inglés: claves data-i18n -> texto
js/main.js            Idioma, menú móvil, barra que cambia de tono, sección activa
js/orbit.js           Escena 3D del hero (three.js)
vendor/three/         three.js 0.184 (MIT), copiado de ../edooly/node_modules
assets/img/           Fotos y capturas en WebP
assets/cv/            CV en PDF (copiado de ../cv-angel-sampayo)
scripts/serve.mjs     Servidor estático sin dependencias
scripts/optimize-images.cjs  Regenera los WebP (usa el sharp de ../edooly)
```

## Editar textos

- Español: directamente en `index.html`.
- Inglés: la misma clave en `js/i18n.js`. Cada elemento traducible lleva `data-i18n` (texto), `data-i18n-html` (con etiquetas) o `data-i18n-alt` (alt de imagen).

## Publicar

Cualquier hosting estático (GitHub Pages, Netlify, Vercel). Sube la carpeta tal cual; `scripts/` no se usa en producción.
