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
}

function declarations(prefix: string, items: NamedValue[]): string[] {
  return items.map((item) => `  --${prefix}${item.name}: ${item.value};`);
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
    ['Layout', declarations('', tokens.layout.tokens)],
  ];

  const body = sections
    .map(([title, lines]) => `  /* ${title} */\n${lines.join('\n')}`)
    .join('\n\n');

  return [
    '/* GENERATED from hair-by-london-design-system/tokens.json. Do not edit by hand.',
    '   Run `npm run tokens` after changing tokens.json. */',
    ':root {',
    body,
    '}',
    '',
  ].join('\n');
}
