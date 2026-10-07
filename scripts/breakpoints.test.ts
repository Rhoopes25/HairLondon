import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import type { TokensJson } from '../app/ui/tokens/build-tokens-css';

const root = fileURLToPath(new URL('..', import.meta.url));
const tokens = JSON.parse(
  readFileSync(join(root, 'hair-by-london-design-system', 'tokens.json'), 'utf8'),
) as TokensJson;

/** The 380px query is the old narrow-phone tweak to the header; it is a max-width, not a breakpoint. */
const ALLOWED_MAX_WIDTHS = ['380px'];

function cssFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return entry === 'node_modules' ? [] : cssFiles(path);
    return path.endsWith('.css') ? [path] : [];
  });
}

describe('responsive breakpoints', () => {
  const allowed = tokens.responsive.breakpoints.map((bp) => bp.minWidth);
  const files = cssFiles(join(root, 'app'));

  it('finds the stylesheets it is meant to guard', () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it('only uses the three shared min-width values, so they cannot drift across files', () => {
    const offenders: string[] = [];
    for (const file of files) {
      const css = readFileSync(file, 'utf8');
      for (const match of css.matchAll(/@media[^{]*\(\s*min-width:\s*([^)\s]+)\s*\)/g)) {
        const width = match[1] ?? '';
        if (!allowed.includes(width)) offenders.push(`${file}: min-width ${width}`);
      }
      for (const match of css.matchAll(/@media[^{]*\(\s*max-width:\s*([^)\s]+)\s*\)/g)) {
        const width = match[1] ?? '';
        if (!ALLOWED_MAX_WIDTHS.includes(width)) offenders.push(`${file}: max-width ${width}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('defines the documented breakpoints in ascending order', () => {
    const widths = allowed.map(parseFloat);
    expect(widths).toEqual([...widths].sort((a, b) => a - b));
    expect(allowed).toEqual(['640px', '900px', '1200px']);
  });
});
