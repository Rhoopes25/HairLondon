import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildTokensCss } from '../app/ui/tokens/build-tokens-css';
import type { TokensJson } from '../app/ui/tokens/build-tokens-css';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const tokens = JSON.parse(read('../hair-by-london-design-system/tokens.json')) as TokensJson;

describe('design tokens', () => {
  it('tokens.css matches tokens.json (run `npm run tokens` if this fails)', () => {
    expect(read('../app/ui/tokens/tokens.css')).toBe(buildTokensCss(tokens));
  });

  it('exposes the tokens the components rely on', () => {
    const css = buildTokensCss(tokens);
    for (const name of [
      '--cream',
      '--gold-ink',
      '--gold-deep',
      '--danger',
      '--space-5',
      '--radius-pill',
      '--app-width',
      '--font-display',
    ]) {
      expect(css).toContain(`${name}:`);
    }
  });
});
