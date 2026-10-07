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
      '--container-max',
      '--container-narrow',
      '--dialog-width',
      '--header-height',
      '--gutter',
      '--font-display',
    ]) {
      expect(css).toContain(`${name}:`);
    }
  });

  it('emits every responsive override inside its breakpoint', () => {
    const css = buildTokensCss(tokens);
    for (const { minWidth, fontSize, name } of tokens.responsive.type) {
      const block = css.slice(css.indexOf(`@media (min-width: ${minWidth})`));
      expect(block).toContain(`--fs-${name}: ${fontSize};`);
    }
    for (const { name, minWidth } of tokens.responsive.breakpoints) {
      expect(css).toContain(`${name} ${minWidth}`);
    }
  });

  it('keeps the phone value of a responsive size as the base', () => {
    const css = buildTokensCss(tokens);
    const base = css.slice(0, css.indexOf('@media ('));
    expect(base).toContain('--fs-display-lg: 1.7rem;');
    expect(base).toContain('--gutter: 0;');
  });
});
