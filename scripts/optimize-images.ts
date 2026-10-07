/**
 * Builds the web-sized photos in app/public/images from the originals in assets/originals.
 *
 *   npm run images
 *
 * The originals are 1.2 MB to 2.7 MB each. The app shows them under 500px wide, so this
 * resizes to 900px (sharp at 2x density) and re-encodes as JPEG, which is what a phone
 * on a nap-time connection should be downloading.
 */
import { mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, parse, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'assets', 'originals');
const target = join(root, 'app', 'public', 'images');
const WIDTH = 900;
const QUALITY = 80;

mkdirSync(target, { recursive: true });

let before = 0;
let after = 0;

for (const file of readdirSync(source).sort()) {
  if (!['.jpg', '.jpeg', '.png'].includes(extname(file).toLowerCase())) continue;
  const input = join(source, file);
  const output = join(target, `${parse(file).name}.jpg`);
  await sharp(input)
    .resize({ width: WIDTH, withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(output);
  const inSize = statSync(input).size;
  const outSize = statSync(output).size;
  before += inSize;
  after += outSize;
  console.log(`${file}: ${(inSize / 1024).toFixed(0)} KB -> ${(outSize / 1024).toFixed(0)} KB`);
}

console.log(
  `total: ${(before / 1024 / 1024).toFixed(1)} MB -> ${(after / 1024 / 1024).toFixed(2)} MB`,
);
