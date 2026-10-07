/**
 * Builds the web-sized photos in app/public/images from the originals in assets/originals.
 *
 *   npm run images
 *
 * The originals are 1.2 MB to 2.7 MB each. Each photo is written at three widths so the browser
 * can pick (srcset, see photoSrcSet in app/config.ts): `name-640.jpg` for phones, `name.jpg`
 * (900px, the one the data refers to) and `name-1160.jpg` for wide desktop screens. The
 * originals are only about 1170px wide, so 1160 is as sharp as they get; going larger would
 * just be a blurry enlargement. JPEG, because that is what a phone on a nap-time connection
 * should be downloading.
 */
import { mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, parse, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'assets', 'originals');
const target = join(root, 'app', 'public', 'images');
/** Keep in step with PHOTO_WIDTHS in app/config.ts. The empty suffix is the base file. */
const VARIANTS = [
  { suffix: '-640', width: 640 },
  { suffix: '', width: 900 },
  { suffix: '-1160', width: 1160 },
] as const;
const QUALITY = 80;

mkdirSync(target, { recursive: true });

let before = 0;
let after = 0;

for (const file of readdirSync(source).sort()) {
  if (!['.jpg', '.jpeg', '.png'].includes(extname(file).toLowerCase())) continue;
  const input = join(source, file);
  const inSize = statSync(input).size;
  before += inSize;
  const sizes: string[] = [];
  for (const { suffix, width } of VARIANTS) {
    const output = join(target, `${parse(file).name}${suffix}.jpg`);
    await sharp(input)
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toFile(output);
    const outSize = statSync(output).size;
    after += outSize;
    sizes.push(`${width}px ${(outSize / 1024).toFixed(0)} KB`);
  }
  console.log(`${file}: ${(inSize / 1024).toFixed(0)} KB -> ${sizes.join(', ')}`);
}

console.log(
  `total: ${(before / 1024 / 1024).toFixed(1)} MB -> ${(after / 1024 / 1024).toFixed(2)} MB`,
);
