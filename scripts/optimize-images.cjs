// One-off: converts source screenshots to WebP. Uses the sharp copy already present in ../edooly.
const path = require('path');
const sharp = require(process.env.SHARP_PATH || 'C:/Code/edooly/node_modules/sharp');

const out = path.join(__dirname, '..', 'assets', 'img');
const jobs = [
  ['C:/Code/cv-angel-sampayo/assets/img/edooly-concept.png', 'edooly-app.webp', 720],
  ['C:/Code/edooly/public/images/about/practica-mundo.jpg', 'edooly-worlds.webp', 1000],
  ['C:/Code/edooly/public/images/about/practica-leccion.png', 'edooly-lesson.webp', 1200],
  ['C:/Code/edooly/public/images/edooly-app.png', 'edoo.webp', 320],
  ['C:/Code/cv-angel-sampayo/assets/img/runode-concept.png', 'runode.webp', 1427],
  ['C:/Code/cv-angel-sampayo/assets/img/hvackeros-concept.png', 'hvackeros.webp', 1600],
  ['C:/Code/cv-angel-sampayo/assets/img/me.jpg', 'me.webp', 443],
];

(async () => {
  for (const [src, name, width] of jobs) {
    const info = await sharp(src).resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(out, name));
    console.log(name, info.width + 'x' + info.height, info.size);
  }
})();
