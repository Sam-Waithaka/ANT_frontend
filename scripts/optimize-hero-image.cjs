const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

const source = process.argv[2];
const outputDir = path.resolve(process.cwd(), 'public/images');
const widths = [640, 960, 1440, 1920];

const writeHeroImages = async () => {
  if (!source) {
    throw new Error('Usage: npm run optimize:hero -- "C:/path/to/church-photo.jpg"');
  }

  await fs.mkdir(outputDir, { recursive: true });

  for (const width of widths) {
    const base = path.join(outputDir, `church-front-left-${width}`);

    await sharp(source)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .avif({ quality: 50, effort: 6 })
      .toFile(`${base}.avif`);

    await sharp(source)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 72, effort: 6 })
      .toFile(`${base}.webp`);
  }

  await sharp(source)
    .rotate()
    .resize({ width: 1920, withoutEnlargement: true })
    .jpeg({ quality: 78, progressive: true, mozjpeg: true })
    .toFile(path.join(outputDir, 'church-front-left-1920.jpg'));
};

writeHeroImages().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
