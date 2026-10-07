# CLAUDE.md

Guidance for Claude Code (and humans) working in this repo. Keep this file current; if a rule here stops being true, fix the rule.

## What this is

**Hair by London**: a mobile-first hair stylist booking app. It is the group midterm for IS 551 (a low-fidelity, public, working prototype graded against a rubric, summarized below).

- **Persona:** a mom of three young kids who gets a short window (nap time) to think about herself. She will not book a stylist she does not trust.
- **Core capability:** view a stylist's portfolio and reviews, then book an available time that works for her.
- **Fundamental value:** **Calm**. Booking without the anxiety of gambling on a stranger.
- **Core design features** (everything else is tangential; justify or cut it): portfolio, reviews, simple day/time booking.

### Rubric constraints (the original is in `md/`, which is gitignored and not on teammates' machines)

1. Follow every instruction in the assignment.
2. **Look low-fidelity** to users and tell them in plain English (modal) that the prototype is in an early stage. (Team decision: we satisfy this with the notice and an always-visible label, not a rough-looking theme.)
3. **Entry screens** make the overarching capability the first and most prominent thing.
4. Follow conventions (internal and external), guide attention, group well, apply all class usability principles.
5. Use a **design library** and reuse components. The library must fit the root user outcomes.
6. **Fully functional** except for real backend work, **non-linear** (multiple routes to a goal, no single path), goal given up front in a modal, and any onboarding must be skippable.
7. Roughly **20-30+ screens**. Each teammate owns at least one section.
8. The prototype must be at a **public URL**. If graders can't open it, the grade is zero.

## Status

The refactor from static HTML/CSS/JS to React + TypeScript is built (branch `refactor`) and the legacy pages are deleted. The plan is `docs/refactor-plan.md` (its section 3 is the architecture rationale; some rows describe intent, so where it disagrees with this file, this file wins). Also read `docs/usability-audit.md` (what was and was not verified) and `docs/deployment.md`.

- **Frontend:** `app/`. Everything React: UI, features, routing, browser adapters.
- **Backend-shaped logic:** `src/`. Domain rules, repositories, seed data. Written as if it ran on a server (no React, no DOM), though today it is bundled into the client and persists to `localStorage`.
- **Design system spec:** `hair-by-london-design-system/` (`tokens.json`, per-component READMEs and previews). It is the source of truth for look and component behavior; `app/ui` is its React implementation, and `app/ui/tokens/tokens.css` is **generated** from `tokens.json` (`npm run tokens`).
- **Photos:** originals in `assets/originals/`; the web-sized copies in `app/public/images/` are generated (`npm run images`) at three widths (`name-640.jpg`, `name.jpg` at 900px, `name-1160.jpg`). Use `photoSrcSet()` from `app/config.ts` with `srcSet`/`sizes` so each screen downloads the right one. Never commit a multi-megabyte photo to `app/public`.
- Tooling (`package.json`, `tsconfig*.json`, `vite.config.ts`, `vitest.config.ts`, ESLint config), `scripts/`, `deploy/`, and `.github/` live at the repo root.

## Commands

Run from the repo root.

```
npm run dev            # Vite dev server
npm run typecheck      # tsc for app+src, src alone (no DOM types), and tooling
npm run lint           # ESLint: jsx-a11y, react-hooks, layer boundaries, no import.meta.env outside config
npm test               # Vitest: src (node), tooling (node), app (jsdom, incl. integration + axe)
npm run build          # typecheck + production build (hash routing, base "/")
npm run build:pages    # GitHub Pages build (base /HairLondon/, hash routing)
npm run build:browser  # clean-URL build, to prove the host can be switched
npm run preview        # serve the last build
npm run tokens         # regenerate tokens.css from tokens.json
npm run images         # regenerate web-sized photos (640, 900, 1160px) from assets/originals
npm run layout         # Playwright screenshots + layout checks at 4 widths (needs `npm run build` first)
```

Before calling work done: `typecheck`, `lint`, `test` pass. UI work also needs to be looked at in a browser, ideally on a phone; the automated checks do not judge how it looks. `npm run layout` opens every route and overlay at 360, 768, 1280 and 1920px (or `-- --widths=899,900`), saves screenshots to the git-ignored `.layout-shots/`, and fails on sideways scroll, tap targets under 44px (900px and below) and content wider than the container. It needs a one-time `npx playwright install chromium` and is not part of `npm test` or CI. jsdom cannot test CSS, so look at the screenshots.

## Architecture

Two top-level folders, each layered. Dependencies point **down** only, and **`app/` may import `src/` but `src/` never imports `app/`**.

```
app/                 FRONTEND (React, DOM, browser)
  shell/             composition root: routes, router factory, providers, layouts, error pages,
                     design-library page; the integration tests (app.*.test.tsx) live here
  features/          one folder per user-facing capability (see below)
  services/          React side of the data layer: Context provider, store hooks, facade hooks
  ui/                design-system components + tokens (no business logic); tests in ui/__tests__
  adapters/          browser implementations of src interfaces (LocalStorageAdapter)
  hooks/ lib/ test/  shared hooks, tiny utilities, test helpers (renderApp, setup)
  config.ts          the only reader of import.meta.env; assetUrl(), routerBasename()
  index.html  public/  main.tsx

src/                 BACKEND-SHAPED (pure TypeScript, no React, no DOM)
  domain/            models, scheduling, pricing, formatting, calendar, clock
  data/              repositories, seed data, StorageAdapter interface + in-memory adapter
```

Path aliases: `@app/*` and `@src/*`.

Import rules (enforced by lint and tsconfig):

- `src/` imports nothing from `app/`, never imports React, and never touches browser globals (`window`, `document`, `localStorage`). `tsconfig` for `src/` omits the DOM lib so this fails to compile.
- Inside `src/`: `data` may import `domain`; `domain` imports nothing else.
- Inside `app/`: `ui` may import `@src/domain` formatters and types only (not `services`, `features`, `shell`, or `@src/data`). `features` may import `ui`, `services`, `@src/domain`, `@src/data`. **A feature never imports another feature's internals**; it uses that feature's `index.ts` public API (`@app/features/booking`), or a page composes the two. `shell` wires everything together; nothing imports from `shell`.

Each feature folder is flat: `*Page.tsx` or `*Step.tsx` screens, their components and `.module.css` files, and `index.ts` (the public API; only what other code may use). Features: `home`, `stylists`, `stylist-profile`, `booking`, `appointments`, `scheduling` (the shared day-and-time picker), `saved`, `prototype-notice`, `help`.

Components get data through hooks; hooks get it from repositories supplied by Context (`app/services`, wired in `app/shell`). Components never read `localStorage` or seed data directly. Repositories take a `StorageAdapter`; the shell supplies `LocalStorageAdapter` (tests use the in-memory one). That is the seam where a real backend would later plug in.

Routes live in `app/shell/routes.tsx`, one lazy import per screen. Add a screen there and to the inventory in `docs/submission-notes.md`.

## Design patterns: use them for a reason

Reference sources: Gang of Four (as catalogued on refactoring.guru), refactoring.guru's smells and techniques, and patterns.dev. Apply a pattern only when it removes a concrete problem in this codebase. Name the source accurately in code review and docs; do not label something a GoF pattern if it is not one. The full rationale and the list of patterns deliberately not used is in `docs/refactor-plan.md` section 3.3. Patterns this codebase uses:

| Pattern | Source | Where |
| --- | --- | --- |
| Strategy | GoF | `src/domain/scheduling`: `AvailabilityStrategy` (`SeededAvailability`; tests pass small fakes) |
| Decorator | GoF | `AppointmentAwareAvailability` wraps a strategy so booked slots become unavailable |
| Adapter | GoF | `StorageAdapter` interface in `src/data/storage`, with `MemoryStorageAdapter` (src, tests) and `LocalStorageAdapter` (`app/adapters`) |
| Facade | GoF, realized as a hook (patterns.dev Hooks Pattern) | `useStylist`/`useStylists` (stylist + client-written reviews), `useBooking` (draft + services + actions): they compose real logic, not just forward a call |
| Observer | GoF / patterns.dev | Repositories expose `subscribe`; React reads them via `useSyncExternalStore` (`app/services/hooks.ts`) |
| Compound | patterns.dev | `Tabs` (context-based: `Tabs.List/Tab/Panel`). `SlotPicker.Days` + `SlotPicker.Times` is a composed pair without shared context |
| Route-based splitting, Dynamic Import | patterns.dev | `lazy` per route in `app/shell/routes.tsx` |
| Prefetch | patterns.dev | `MainLayout` fetches the booking chunk when the browser is idle |
| Module Pattern | patterns.dev | Each feature's `index.ts` is its public API |

Used on purpose but **not** from those sources: **Repository** (Fowler/DDD, not GoF; concrete classes in `src/data` over a `StorageAdapter`, and you extract an interface only when a second implementation such as an HTTP one actually exists), a **reducer-driven state machine** for the booking wizard (`src/domain/booking/booking-state.ts`; React-idiom, GoF State's intent but not its class structure), **React Context** for dependency injection, and the **layered / feature-sliced** structure (clean/hexagonal architecture).

Avoid:
- Singletons and module-level mutable state (use Context).
- HOCs and render props where a hook works; a separate Container layer (hooks replace it).
- **Speculative Generality**: an interface needs a real second implementation (an in-memory one used by tests counts). `StorageAdapter` qualifies; a repository interface with one class behind it does not. **Middle Man**: a hook or repository that only forwards a call should be deleted. **Lazy Class**: files that do almost nothing.
- Prop drilling more than two levels (lift into a hook or compound component), and `useEffect` for anything derivable during render.

## Code conventions

- TypeScript `strict`, plus `noUncheckedIndexedAccess`. No `any`; use `unknown` and narrow. No non-null `!` without a comment.
- Model closed sets as string-literal unions or `as const` objects (`ServiceId`, `Weekday`). Derive types from data where possible.
- Function components only. Named exports. One main component per file; file name = component name; co-locate `X.module.css`. Tests: `src/` unit tests sit next to the code; `ui/` tests are grouped in `ui/__tests__`; whole-screen flows are integration tests in `app/shell/app.*.test.tsx` using `renderApp` (real routes, in-memory store, fixed clock). When you fix a bug found by a flow, add the test that would have caught it.
- Style with **CSS Modules + CSS custom properties from `app/ui/tokens/tokens.css`**. No hard-coded colors, radii, or spacing; use tokens. No inline `style` except for truly dynamic values.
- Render with JSX. Never build HTML by string concatenation or `dangerouslySetInnerHTML`.
- Pure logic goes in `src/domain/` with unit tests. Components stay thin.
- Time is injected (`Clock`), never read with `new Date()` in domain or components, so tests are deterministic.
- Keep functions small and name them for intent (refactoring.guru techniques: Extract Method, Replace Magic Number with Symbolic Constant, Replace Conditional with Polymorphism only when a third real case appears). Prefer literal unions and branded types over bare strings and numbers (Primitive Obsession).
- Comments explain *why*. Do not narrate what the code does.

## Design system and UX rules

Follow `hair-by-london-design-system/README.md`. The non-negotiables:

- **Calm voice.** Plain, first-person-from-the-stylist copy. One verb per screen. **No pressure devices**: no "spots left", countdowns, discount badges, "hurry". Availability is simply open or unavailable.
- **One action color family.** Filled buttons and small text use `gold-ink` (white on it is 6.3:1). `gold-deep` is for icons, stars, borders and the focus ring only (3.6:1). `scripts/contrast.test.ts` enforces this. Never rely on color alone: unavailable slots get a strike-through.
- **Real controls.** Day chips, time slots, filters, and tabs are `<button>` with `aria-pressed` / `aria-selected` / `disabled`. Clickable `div`s are a bug. Keep the 2px `gold-deep` focus ring. Touch targets are at least 44px.
- Times always show AM/PM. Metadata is one quiet line (`Haircut · $65`).
- **Mobile first, responsive up to a full website.** Write the phone layout (design at 390px) as the base and add `min-width` queries on top. The only breakpoints are `sm` 640px, `md` 900px and `lg` 1200px, held in `tokens.json` (`responsive.breakpoints`); a test fails on any other `@media` width. Phone: one column. `sm`: two- and three-column grids, sheets become centered dialogs, the wordmark appears. `md`: desktop compositions (two-column booking with a sticky summary, split hero). `lg`: three-column grids, content at its maximum.
- **Page width.** The header, prototype strip and footer are full-width bands; page content sits in `Container` (centered, `--container-max` 1200px, desktop gutters) and single-purpose screens (forms, recaps, help, confirmations) in `Narrow` (`--container-narrow` 640px). Two-column pages use `SplitLayout`. Components keep their own side padding (`space-5`); do not add another. Never set a fixed pixel width on a page.
- Reuse before building: if a pattern appears twice, it becomes a `ui/` component with a preview and a test. Update the design-system README/`tokens.json` when a token or component changes.

### Prototype requirements (these ship in the product, not just in docs)

- A first-visit **modal** states in plain English that this is an early, unfinished prototype and gives the user a concrete **goal** (e.g. "Book a haircut with a stylist you trust"). It must be dismissible and re-openable from the footer, and a small "Early prototype" label stays visible on every screen.
- **Low fidelity:** we deliberately do **not** build a separate lo-fi theme. Use the existing design tokens and the real photos as they are. The early-stage message is carried by the notice modal and the "Early prototype" label. Do not add roughness effects. Rationale and accepted risk: `docs/refactor-plan.md` section 3.6.
- **Overlays (modals, sheets) count as screens.** Every overlay in the inventory must be a distinct, designed, reachable state.
- Navigation is **non-linear**: every top-level place is in the persistent nav, and booking can start from Home, the stylist list, a stylist's Services tab, a portfolio photo, the About page, or "Book again". Never force a single path. Any onboarding is skippable.
- `/#/design-library` shows every component on one page. It is deliberately not linked from the app; keep it working when components change.
- The entry screen's first and most prominent signifier is the core capability (find a stylist you trust and book). Secondary functions are visibly secondary.
- Persistence is `localStorage` only. No servers, no real payments, no real SMS. Fake only what cannot be built client-side, and say so in the UI.

## Deployment

Current host: GitHub Pages (`https://rhoopes25.github.io/HairLondon/`), hash routing. The host must stay swappable by configuration alone:

- Never hard-code a base path, host, or router mode. Use `assetUrl()` for public assets and the router `basename`.
- Only `app/config.ts` reads `import.meta.env` (`VITE_BASE`, `VITE_ROUTER_MODE`, `VITE_API_URL`).
- Host-specific files live in `deploy/<target>/` and are applied by `scripts/postbuild.ts` (`DEPLOY_TARGET`). `.github/workflows/ci.yml` is host-neutral and each host's deploy workflow reuses it, then runs its own build script (the base path is baked in at build time). Steps for switching hosts are in `docs/deployment.md`.
- Pages must be enabled by a repo admin (the repo is owned by `Rhoopes25`); the first deploy has **not** been verified on the live host.

## Git workflow

- Group project: small, focused branches per teammate/feature; PR into `refactor` until it merges to `main`. Do not push directly to `main`. Do not force-push shared branches.
- Conventional-ish commit messages: `feat(booking): ...`, `refactor(domain): ...`, `test(...)`, `docs(...)`. One logical change per commit.
- Move files with `git mv` so history follows. Do not mix a move and a behavior change in one commit.
- `.gitignore` currently ignores `/md` (rubric). Do not rely on files there being available to teammates.

## Do not

- Add a second source of truth for design values: colors, spacing, radii, and type sizes come from `tokens.json`.
- Invent stylists, reviews, or prices outside `src/data/seed`.
- Add dependencies without a reason in the PR description; prefer the platform and what is already installed.
- Weaken a lint, type, or a11y rule to make something pass; fix the code.
