# Deployment

The app is a static single-page site. **Current host: GitHub Pages**, at
`https://rhoopes25.github.io/HairLondon/`, using hash routing (URLs look like `/#/stylists`).

Nothing in `app/` or `src/` knows which host serves it. Everything host-specific is in the places below.

## Where host details live

| Concern | File | Notes |
| --- | --- | --- |
| Base path (`/HairLondon/` on Pages, `/` elsewhere) | `VITE_BASE`, read by `vite.config.ts` and `app/config.ts` | Public assets use `assetUrl()`; the router uses `routerBasename()` |
| Router mode | `VITE_ROUTER_MODE` = `hash` or `browser`, read only by `app/config.ts` | Routes are defined once; `app/shell/router.tsx` picks the router factory |
| SPA fallback / rewrites | `deploy/<target>/` | Applied to `dist/` by `scripts/postbuild.ts` for `DEPLOY_TARGET` |
| Pipeline | `.github/workflows/` | `ci.yml` is host-neutral; `deploy-pages.yml` is the only Pages-specific workflow |
| Per-host env presets | `.env.pages`, `.env.browser`, `.env.example` | Used by `npm run build:pages` and `npm run build:browser` |

Only `app/config.ts` may read `import.meta.env` (lint enforces this).

## Build scripts

| Script | Mode | Base | Router | Target |
| --- | --- | --- | --- | --- |
| `npm run build` | production | `/` | hash | static |
| `npm run build:pages` | `pages` | `/HairLondon/` | hash | pages |
| `npm run build:browser` | `browser` | `/` | browser | static |

## One-time GitHub Pages setup

1. The repository must be **public** (Pages on a free account requires it).
2. A repository admin (the repo is owned by `Rhoopes25`) opens **Settings -> Pages** and sets **Source** to **GitHub Actions**.
3. Pushing to `main` runs `Deploy to GitHub Pages`. You can also run it by hand from the Actions tab (`workflow_dispatch`), which is how to deploy from the `refactor` branch before it is merged: choose the branch in the "Run workflow" menu.
4. Verify the live URL in a private window and on a phone. Open a deep link such as `.../HairLondon/#/stylists/london` in a fresh tab and refresh.

## Switching hosts

The steps are the same for every host: choose a router mode, set the base, add the host's rewrite file if needed, and add a deploy step.

### Netlify

1. Build command `npm run build`, with env `VITE_ROUTER_MODE=browser`, `VITE_BASE=/`, `DEPLOY_TARGET=netlify`. (Hash routing also works and needs no rewrite.)
2. Publish directory `dist`. `postbuild` copies `deploy/netlify/_redirects` into `dist/`, which sends unknown paths to `index.html`.

### Vercel

1. Build command `npm run build` with `VITE_ROUTER_MODE=browser`, `VITE_BASE=/`, `DEPLOY_TARGET=vercel`. Output directory `dist`.
2. `postbuild` copies `deploy/vercel/vercel.json` into `dist/`. If your Vercel project reads configuration from the repository root instead, copy that file to the root.

### Any static server (nginx, S3 + CDN, Docker)

1. `npm run build:browser` for clean URLs, or `npm run build` for hash routing.
2. Serve `dist/`. For browser routing, configure an SPA fallback to `index.html`; `deploy/static/nginx.conf` is a working example. Hash routing needs no server configuration.

### Pages with clean URLs

Set `VITE_ROUTER_MODE=browser` in `.env.pages`. `postbuild` then copies `index.html` to `404.html`, which Pages serves for unknown paths. Pages returns HTTP 404 for those loads, so hash routing remains the safer default.

## Checking a switch before it matters

```
npm run build:browser
npm run preview
```

Open `http://localhost:4173/stylists` directly in a fresh tab and refresh. It should render, not 404. (Vite's preview server falls back to `index.html`, so this verifies the router mode and base path but not your real host's rewrite rule. Re-check on the host itself.)

## When a real backend arrives

`src/` has no browser dependencies and persists through a `StorageAdapter`. A server can adopt `src/domain` and `src/data` directly. Set `VITE_API_URL` and add an HTTP-backed implementation of the repositories; `app/` keeps working unchanged.
