import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { TokensJson } from '../app/ui/tokens/build-tokens-css';

const tokens = JSON.parse(
  readFileSync(new URL('../hair-by-london-design-system/tokens.json', import.meta.url), 'utf8'),
) as TokensJson;
const color = (name: string): string => {
  const found = tokens.color.tokens.find((token) => token.name === name);
  if (!found) throw new Error(`Missing color token ${name}`);
  return found.value;
};

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r = 0, g = 0, b = 0] = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio. */
function contrast(foreground: string, background: string): number {
  const a = luminance(color(foreground));
  const b = luminance(color(background));
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** Every foreground/background pair the components use for TEXT. Small text needs 4.5:1 (WCAG AA). */
const TEXT_PAIRS: [string, string, string][] = [
  ['white', 'gold-ink', 'primary button, selected day chip'],
  ['ink', 'cream', 'body text'],
  ['ink-soft', 'cream', 'secondary text on the page'],
  ['ink-soft', 'white', 'secondary text on cards'],
  ['gold-ink', 'cream', 'links and the active nav link'],
  ['gold-ink', 'white', 'outline button'],
  ['ink', 'gold-soft', 'prototype strip, selected time slot'],
  ['gold-ink', 'gold-soft', 'prototype strip button'],
  ['danger', 'white', 'form error text'],
  ['danger', 'cream', 'form error text on the page'],
  ['ink-soft', 'cream-deep', 'disabled button'],
];

describe('color contrast (WCAG AA)', () => {
  it.each(TEXT_PAIRS)('%s on %s is at least 4.5:1 (%s)', (foreground, background) => {
    expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps gold-deep out of text: it is for icons and stars, which need 3:1', () => {
    expect(contrast('gold-deep', 'white')).toBeGreaterThanOrEqual(3);
    expect(contrast('gold-deep', 'cream')).toBeGreaterThanOrEqual(3);
    // white-on-gold-deep is below 4.5:1, which is why buttons use gold-ink
    expect(contrast('white', 'gold-deep')).toBeLessThan(4.5);
  });

  it('unavailable time slots are disabled and struck through, so color alone is not the signal', () => {
    // Disabled controls are exempt from the contrast requirement; the strike-through carries the meaning.
    expect(contrast('unavailable', 'cream-deep')).toBeLessThan(3);
  });
});
