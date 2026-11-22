import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { STYLISTS } from '../src/data/seed/stylists';

const root = fileURLToPath(new URL('..', import.meta.url));
const photos = STYLISTS.flatMap((stylist) => stylist.portfolio.map((photo) => photo.src));

/** A portfolio photo with no file behind it shows as a blank tile, so catch it here. */
describe('portfolio photos', () => {
  it('finds the photos it is meant to guard', () => {
    expect(new Set(photos).size).toBeGreaterThan(15);
  });

  it('has the original and all three web sizes for every photo (run `npm run images`)', () => {
    const missing: string[] = [];
    for (const src of new Set(photos)) {
      const name = src.replace(/^images\//, '').replace(/\.jpg$/, '');
      if (!existsSync(join(root, 'assets', 'originals', `${name}.jpg`)))
        missing.push(`original ${name}`);
      for (const suffix of ['', '-640', '-1160']) {
        if (!existsSync(join(root, 'app', 'public', 'images', `${name}${suffix}.jpg`))) {
          missing.push(`${name}${suffix}.jpg`);
        }
      }
    }
    expect(missing).toEqual([]);
  });
});
