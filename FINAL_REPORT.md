# Informe final — Portafolio de Ángel Sampayo

Fecha: 2026-10-11 · Carpeta: `C:\Code\m-cv-angel-sampayo`

## Resumen

Construí una landing/portafolio estática, bilingüe (español/inglés) y responsive, con una escena 3D propia en el hero. Edooly es el centro del sitio; Runode, HVACKEROS y Política Abierta aparecen con el peso y el rol que les corresponde. Todo el contenido sale de los repositorios; no inventé logros ni cifras.

Para verla: `node scripts/serve.mjs` y abrir http://localhost:5500.

## Repositorios analizados

| Repo | Qué tomé |
|---|---|
| `cv-angel-sampayo` | Identidad: nombre, rol, textos de "sobre mí", foto, experiencia, educación, idiomas, contacto, CV en PDF, capturas de Runode y HVACKEROS. |
| `edooly` | README, `package.json`, `locales/es/landing.json` (misión, rol "Fundador y CEO"), imágenes reales (mundos, lección, app, mascota) y métricas: 726 commits (desde 2026-05-14), 83 modelos Prisma, 55 migraciones, 236 archivos de pruebas, i18n es/en, carpeta `mobile/` (Android + iOS en preparación), `appId` `com.edooly.app`. |
| `edooly-content` | Repo del equipo de contenido; 3 colaboradores además de Ángel. |
| `edooly-social-media` | Content Studio (Gemini + validador + ElevenLabs + Remotion). |
| `edooly-analytics` | Panel interno Next.js de solo lectura. |
| `video-generator` | Edoo Video Studio (imagen a video con GPUs en la nube). |
| `runode` / `runode-web` | 50 commits entre el 7 y el 18 de septiembre de 2026: lo presento como "exploración de dos semanas". |
| `Politica-Abierta` | 9 repos, casi todos de otro autor (diazhector98). Ángel tiene 1 commit en el sitio web. Lo presento como contribución voluntaria a un proyecto de otro equipo. |
| `HVACKEROS` | README del sitio y rol de Director de Finanzas. |

## Decisiones de contenido

- **Edooly es el protagonista**: sección propia y más larga, con capturas reales, "Lo que construí" (6 sistemas), ficha técnica con cifras verificadas en el repo y las herramientas internas que construiste alrededor.
- **Runode** se etiqueta explícitamente como exploración de dos semanas.
- **Política Abierta**: "creada y mantenida por otro equipo"; tú aportas correcciones y mejoras como voluntario. Sin captura, en un bloque más pequeño.
- **No publiqué tu teléfono** (sí está en el PDF del CV). En la web solo hay correo, LinkedIn y GitHub.
- **Sin números de usuarios ni instalaciones**: no había una cifra pública confirmable.
- Las cifras del repo (commits, modelos, pruebas) son de hoy; quedan escritas a mano en el HTML.

## Dirección visual

- **Concepto "Órbita"**: Edooly es literalmente un universo (mundos que orbitan una luna). El hero lo traduce a algo sobrio: una esfera cromada con reflejos azul y violeta, tres órbitas finas y satélites pequeños (uno amarillo, el color de Edoo).
- **Alternancia noche/luna**: hero oscuro → sobre mí claro → Edooly oscuro → proyectos blanco → trayectoria claro → contacto oscuro.
- **Tipografía**: Bricolage Grotesque para titulares (el nombre a gran escala es el elemento gráfico principal) y Newsreader (serif de texto) para lectura larga.
- **Paleta**: noche `#0A0C1B`, luna `#EEF0F6`, papel `#FFFFFF`, tinta `#10121F`, órbita `#8B8FFF`, sol de Edooly `#FDDC3F` (solo en la sección de Edooly).
- **Movimiento contenido**: solo la entrada del hero y la escena 3D (que responde al puntero y al scroll). Sin animaciones en cada sección.
- **Bilingüe**: español por defecto; inglés si el navegador está en otro idioma. El botón ES/EN guarda la preferencia.

## 3D y rendimiento (pensado para una GT 1030)

- **Spline**: el MCP de Spline no tiene herramienta para publicar o exportar una escena 3D a una URL de runtime, así que no podía incrustarse sin un paso manual. Hice la escena con **three.js** (copiado de `edooly/node_modules`, sin instalar nada), lo que además da control total del rendimiento.
- Los reflejos se calculan **una sola vez** (PMREM de una escena de paneles de luz); cada fotograma solo renderiza 1 esfera, 3 satélites, 3 líneas y unas 420 estrellas.
- DPR limitado a 1.5; si los primeros 90 fotogramas promedian más de 24 ms, la resolución baja sola.
- El render se **pausa** cuando el hero sale de pantalla o la pestaña está oculta.
- `prefers-reduced-motion`: se dibuja un solo fotograma estático.
- Sin WebGL: aparece una esfera hecha con CSS.
- Imágenes convertidas a WebP: ~180 KB en total (antes ~4,5 MB en PNG).
- Peso total medido: ~1,3 MB sin comprimir, de los cuales ~730 KB son three.js (~180 KB con gzip en GitHub Pages).

## Validaciones con Playwright

| Comprobación | Resultado |
|---|---|
| Consola | 0 errores, 0 advertencias (se quitó una advertencia del compilador de shaders de ANGLE y otra del blur de PMREM) |
| Escena 3D | Se activa (`is-3d`) en escritorio, tablet y móvil |
| Escritorio 1440×900 | Revisión visual de todas las secciones |
| Tablet 820×1180 | Sin scroll horizontal; esfera arriba y nombre abajo |
| Móvil 390×844 | Sin elementos desbordados; menú hamburguesa, anclas y cierre del menú correctos |
| Idioma | ES→EN cambia todos los textos (0 claves faltantes), `lang`, alt de imágenes y queda guardado |
| Barra de navegación | Cambia de tono según la sección clara u oscura de debajo |
| Imágenes | Las 7 cargan (lazy) al desplazarse |
| Carga local | DOMContentLoaded ~330 ms |

Corregido durante la revisión: reflejos demasiado negros y duros, respaldo CSS que se veía mientras cargaba el 3D, esfera que en móvil rozaba la barra, barra transparente con el menú abierto, línea del footer más ancha que el contenido, párrafos de "Sobre mí" estirados y "2024 – hoy" sin traducir.

Las capturas de validación están en `C:\Code\.playwright-mcp\` (se pueden borrar).

## Pendiente o mejorable

1. **Revisión visual tuya**, sobre todo la escena 3D en tu propia GPU (Chrome/Edge) y en tu teléfono.
2. **Verifica el enlace de Google Play** (`com.edooly.app`): lo saqué del `appId` del proyecto.
3. **HVACKEROS** no tiene URL pública todavía; cuando la tenga, añade el enlace.
4. **Política Abierta**: si tus aportes crecen (más PRs, features concretas), conviene describirlos con más detalle.
5. **Imagen para redes (og:image)**: ahora usa tu retrato; una imagen 1200×630 del hero quedaría mejor.
6. **Fuentes**: se cargan de Google Fonts. Alojarlas localmente mejoraría la privacidad y el primer pintado.
7. **Cifras de la ficha técnica**: están escritas a mano; habrá que actualizarlas con el tiempo.
8. **Escena en Spline**: si prefieres diseñarla en Spline, expórtala desde el editor ("Export → Code") y sustituye `js/orbit.js` por el visor; hoy no se puede automatizar desde el MCP.
9. **Despliegue**: no se publicó ni se creó repositorio git. Basta con subir la carpeta a GitHub Pages.

## Suspensión de la PC

Me pediste suspender la PC al terminar. Lo intento justo después de entregar el resumen en el chat. Si el equipo tiene la hibernación activada, Windows puede hibernar en lugar de suspender.
