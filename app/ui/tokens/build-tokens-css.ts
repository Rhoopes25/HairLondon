/**
 * Turns hair-by-london-design-system/tokens.json into tokens.css.
 * tokens.json is the single source of truth; tokens.css is generated
 * (`npm run tokens`) and a test fails if the two drift apart.
 */

interface NamedValue {
  name: string;
  value: string;
}

interface TypeStyle {
  name: string;
  fontSize: string;
}

export interface TokensJson {
  color: { tokens: NamedValue[] };
  type: {
    families: Record<string, string>;
    groups: { styles: TypeStyle[] }[];
  };
  spacing: { tokens: NamedValue[] };
  radius: { tokens: NamedValue[] };
  shadow: { tokens: NamedValue[] };
  layout: { tokens: NamedValue[] };
  responsive: {
    breakpoints: { name: string; minWidth: string }[];
    gutter: { value: string; minWidth: string }[];
    type: { name: string; minWidth: string; fontSize: string }[];
  };
}

function declarations(prefix: string, items: NamedValue[]): string[] {
  return items.map((item) => `  --${prefix}${item.name}: ${item.value};`);
}

const BASE_WIDTH = '0px';

/** `--gutter` is the one token that changes with the viewport; its 0px entry is the base value. */
function gutterBase(tokens: TokensJson): string[] {
  const base = tokens.responsive.gutter.find((entry) => entry.minWidth === BASE_WIDTH);
  return base ? [`  --gutter: ${base.value};`] : [];
}

/** One `@media (min-width)` block per breakpoint, holding every token that changes there. */
function responsiveOverrides(tokens: TokensJson): string[] {
  const byWidth = new Map<string, string[]>();
  const add = (minWidth: string, line: string) =>
    byWidth.set(minWidth, [...(byWidth.get(minWidth) ?? []), line]);

  for (const entry of tokens.responsive.gutter) {
    if (entry.minWidth !== BASE_WIDTH) add(entry.minWidth, `    --gutter: ${entry.value};`);
  }
  for (const entry of tokens.responsive.type) {
    add(entry.minWidth, `    --fs-${entry.name}: ${entry.fontSize};`);
  }

  return [...byWidth.entries()]
    .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
    .map(([minWidth, lines]) =>
      [`@media (min-width: ${minWidth}) {`, '  :root {', ...lines, '  }', '}'].join('\n'),
    );
}

/** Breakpoint widths are documented, not variables: custom properties do not work inside @media. */
function breakpointNote(tokens: TokensJson): string {
  const list = tokens.responsive.breakpoints.map((bp) => `${bp.name} ${bp.minWidth}`).join(', ');
  return `/* Breakpoints (min-width, mobile first): ${list}. Use these literally in @media. */`;
}

export function buildTokensCss(tokens: TokensJson): string {
  const families = Object.entries(tokens.type.families).map(
    ([name, value]) => `  --font-${name}: ${value};`,
  );
  const sizes = tokens.type.groups.flatMap((group) =>
    group.styles.map((style) => `  --fs-${style.name}: ${style.fontSize};`),
  );

  const sections: [string, string[]][] = [
    ['Color', declarations('', tokens.color.tokens)],
    ['Type families', families],
    ['Type sizes', sizes],
    ['Spacing', declarations('', tokens.spacing.tokens)],
    ['Radius', declarations('', tokens.radius.tokens)],
    ['Shadow', declarations('', tokens.shadow.tokens)],
    ['Layout', [...declarations('', tokens.layout.tokens), ...gutterBase(tokens)]],
  ];

  const body = sections
    .map(([title, lines]) => `  /* ${title} */\n${lines.join('\n')}`)
    .join('\n\n');

  return [
    '/* GENERATED from hair-by-london-design-system/tokens.json. Do not edit by hand.',
    '   Run `npm run tokens` after changing tokens.json. */',
    breakpointNote(tokens),
    ':root {',
    body,
    '}',
    '',
    ...responsiveOverrides(tokens).flatMap((block) => [block, '']),
  ].join('\n');
}
