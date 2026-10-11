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

**Current state (checked 2026-10-10, after PR #5 merged):** `https://rhoopes25.github.io/HairLondon/` serves this React app. The `Deploy to GitHub Pages` workflow succeeded on the merge, and a real-browser check of the live URL at 390px and 1280px found the first-visit modal, Home, a booking from Book to the booking page, and a profile with no console errors or broken images. One thing to confirm by eye: the GitHub API still reports the Pages build type as `legacy`, so open **Settings -> Pages** and check that **Source** says **GitHub Actions**. If it says "Deploy from a branch", a later redeploy could publish the repository root (which has no `index.html`) and the link would break.

If you ever have to set this up again, the order matters:

1. The repository must be **public** (it is).
2. A repository admin (the repo is owned by `Rhoopes25`) opens **Settings -> Pages** and sets **Source** to **GitHub Actions** *before* merging anything to `main`. In "Deploy from a branch" mode the repository root is published, and the root has no `index.html`.
3. Merge to `main` with a pull request (CI runs on it). The merge triggers `Deploy to GitHub Pages`, which builds with `npm run build:pages` and publishes. Watch the **Actions** tab until it is green.
4. Verify the live URL in a private window and on a phone: the first visit must show the "This is just a prototype" modal, the page title should say Local Locks, and Home should show "Book Now" and "Explore Stylists". Open a deep link such as `.../HairLondon/#/stylists/london` in a fresh tab and refresh.

A manual run (`workflow_dispatch`) only works for workflows that exist on the default branch. To preview before merging, run `npm run build:pages` and serve `dist/` under `/HairLondon/`.

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
