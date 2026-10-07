import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTokensCss } from '../app/ui/tokens/build-tokens-css';
import type { TokensJson } from '../app/ui/tokens/build-tokens-css';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'hair-by-london-design-system', 'tokens.json');
const target = join(root, 'app', 'ui', 'tokens', 'tokens.css');

const tokens = JSON.parse(readFileSync(source, 'utf8')) as TokensJson;
writeFileSync(target, buildTokensCss(tokens), 'utf8');
console.log(`tokens: wrote ${target}`);
