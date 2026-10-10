/**
 * Applies host-specific files to dist/ after `vite build`.
 *
 *   tsx scripts/postbuild.ts [mode]
 *
 * DEPLOY_TARGET (env or .env.<mode>) is one of: pages | netlify | vercel | static.
 * See docs/deployment.md.
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const mode = process.argv[2] ?? 'production';
const env = { ...loadEnv(mode, root, ''), ...process.env };

const target = env.DEPLOY_TARGET ?? 'static';
const routerMode = env.VITE_ROUTER_MODE ?? 'hash';

function copyInto(from: string, toName: string) {
  const source = join(root, 'deploy', from);
  if (!existsSync(source)) throw new Error(`Missing deploy file: deploy/${from}`);
  mkdirSync(dist, { recursive: true });
  copyFileSync(source, join(dist, toName));
  console.log(`postbuild: copied deploy/${from} -> dist/${toName}`);
}

if (!existsSync(join(dist, 'index.html'))) {
  throw new Error('dist/index.html not found. Run `vite build` first.');
}

switch (target) {
  case 'pages':
    // Hash routing needs no fallback. Browser routing on Pages needs 404.html to be the SPA shell.
    if (routerMode === 'browser') {
      copyFileSync(join(dist, 'index.html'), join(dist, '404.html'));
      console.log('postbuild: copied dist/index.html -> dist/404.html (browser routing on Pages)');
    }
    copyInto('pages/.nojekyll', '.nojekyll');
    break;
  case 'netlify':
    copyInto('netlify/_redirects', '_redirects');
    break;
  case 'vercel':
    copyInto('vercel/vercel.json', 'vercel.json');
    break;
  case 'static':
    console.log(
      'postbuild: static target. Serve dist/ with an SPA fallback (see docs/deployment.md).',
    );
    break;
  default:
    throw new Error(`Unknown DEPLOY_TARGET "${target}". Use pages | netlify | vercel | static.`);
}
