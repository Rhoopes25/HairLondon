# Refactor Plan: Static HTML to React + TypeScript

Status: **built.** Phases 0 to 7 are implemented on branch `refactor`; see "As built" below for what shipped and where it differs from the plan. The rest of this document is the original plan and rationale, kept for the record. `CLAUDE.md` is the current source of truth for rules and structure.

## As built (read this first)

**Done and verified** (typecheck, lint, 269 tests across `src`, tooling, and `app`, all passing; production builds for `pages` and `browser` modes; real-Chrome checks listed in `docs/usability-audit.md`):

- Phase 0: Vite + React 19 + TypeScript 6, root tooling, `app/config.ts`, router factory with both modes, `deploy/` host files, CI and Pages workflows, `docs/deployment.md`.
- Phase 1: tokens generated from `tokens.json` with a drift test; 22 families of UI components in `app/ui`; the hidden `/#/design-library` page.
- Phase 2: typed domain and data layers in `src/`, with golden tests against the legacy availability hash.
- Phase 3: shell, layouts, route-based code splitting, the early-prototype notice and strip.
- Phase 4: every legacy behavior in the section 7 parity checklist, each covered by an integration test.
- Phase 5: all inventory screens, plus `AppointmentAwareAvailability` (booked slots become unavailable; cancel and reschedule free them).
- Phase 6: `docs/usability-audit.md`, axe tests on every screen, contrast tests on the tokens.
- Phase 7: legacy pages deleted, photos right-sized (9.3 MB to 0.91 MB), `docs/submission-notes.md` drafted.

**Not done, or not verifiable from here:**

- **The live GitHub Pages deploy.** The workflows parse and the Pages build was served and fetched locally under `/HairLondon/`, but Pages has to be enabled by the repo owner and the first run watched. Until then there is no public URL, which the rubric treats as a zero.
- **Nothing was committed or pushed.** All work is in the working tree for you to review.
- **No human or screen-reader testing, and no visual review by screenshot** (the browser tool could not capture the screen). See the audit's last section.

**Where the build differs from the plan above:**

- Screens: 18 pages, 7 overlays, and 4 empty states, not the 26 in the inventory. The "About the studio" page, the day filter, and the review step were built; "Reminder text preview" and "Add to calendar" are overlays.
- Pattern table (3.3): **Factory (function) test builders** were not built (tests use the seed data and small inline objects) and **Import on Interaction** was not built (the photo viewer is a lazy route). **Prefetch** is done in `MainLayout`, not from the profile page. `SlotPicker` is a composed pair, not a context-based compound; `Tabs` is.
- The booking wizard's state machine lives in `src/domain/booking/booking-state.ts` (pure, tested in Node), not in `app/`.
- Repositories are concrete classes; the only interface in `src/data` is `StorageAdapter`.
- New domain code the plan did not list: `stylists/filter.ts` (filter by service and day), `booking/booking-state.ts`, `reviews.ts`.
- `app/services/` (Context, store hooks, facade hooks) was added as its own layer between `ui` and `features`.
- Two real bugs were found by the end-to-end tests and fixed (redirect races after confirming a booking and after posting a review). See the audit.

## 1. Goals

1. Rebuild the current site (Home, Stylists, Stylist profile, Booking) as a React + TypeScript app with clean, layered architecture.
2. Reach **behavioral parity** with the legacy pages first, then expand to the rubric's 20-30+ screens.
3. Make the design library real: the design-system folder becomes tokens plus reusable React components.
4. Ship a **public prototype** with a plain-English early-stage modal, a stated goal, and non-linear navigation, using the existing design tokens and real photos.

Non-goals: a real backend, auth, payments, SMS. The code is still split into `app/` (frontend) and `src/` (backend-shaped logic with no React or DOM), so a server could adopt `src/` later. Today `src/` is bundled into the client and persists through a `StorageAdapter` backed by `localStorage`.

## 2. What exists today, and what is wrong with it

Smell names below are the ones in the refactoring.guru catalog (Bloaters, Object-Orientation Abusers, Change Preventers, Dispensables, Couplers). Where an item is a real problem but **not** a catalog smell, it says so rather than forcing a label.

| Observation | refactoring.guru smell | Fix (technique) |
| --- | --- | --- |
| Header, nav, footer, social SVGs copy-pasted into 4 HTML files | **Duplicate Code** | Extract Method, applied at component level: `Layout`, `Header`, `Footer`, `Icon` |
| `booking.html` is ~360 lines of script: state, formatting, availability, DOM, validation, `.ics` export | **Long Method**, **Large Class** (the script plays that role), **Divergent Change** (changes for unrelated reasons land in one place) | Extract Method / Extract Class: domain modules, a reducer, hooks, components |
| Fake availability (hash) and formatting live in view code | **Divergent Change** (not Feature Envy) | Move Method into `src/domain/scheduling`, behind a Strategy |
| Minutes as bare ints, ids as bare strings, phone as raw string, `services` as an `{id: price}` bag | **Primitive Obsession** | Literal-union and branded types (`ServiceId`, `Minutes`) plus small value helpers. Not classes: TypeScript types give the benefit without the ceremony |
| `state.name`/`state.phone` are assigned only at the last step and never declared | **Temporary Field** (loosely: fields that exist only in some flows) | Typed `BookingDraft` with explicit optional fields |
| `data.js` globals mix data with helper functions (`SERVICES`, `getStylist`, `avgRating`...) | Not a catalog smell ("Global Data" is from Fowler's 2nd edition). Closest: **Data Class** | Typed seed data, helpers in `src/domain/`, access through repositories |
| Magic numbers (`OPEN = 9*60`, `20`, `+ 60`, `DAYS_AHEAD`) | Not a smell in the catalog; the *technique* is **Replace Magic Number with Symbolic Constant** | Named constants in a `SalonHours` config |
| One 1,286-line `style.css` with global selectors | Not a code smell; analogous to **Large Class** | CSS Modules per component plus shared `tokens.css` |
| `portfolio.html` is a redirect stub | **Dead Code** | Delete |
| HTML built by string concatenation and `innerHTML` | Not a catalog smell; a security/readability problem (XSS) | JSX escapes by default |
| `window.confirm` on exit | Not a smell; a testability/UX problem | `ConfirmDialog` component |
| `startingPrice` returns `Infinity` for a stylist with no services | Defect, not a smell | Return `number \| null`, covered by a test |
| README still describes "three screens" | Stale docs | Update at the end |

Smells to **avoid introducing** with the new architecture (they are in the same catalog): **Speculative Generality** (abstractions with one implementation and no second use), **Middle Man** (hooks or repositories that only forward calls), and **Lazy Class** (files that do almost nothing). Section 3.3 states how each abstraction is justified.

Good things to **preserve**: the design tokens, the calm copy, `aria-pressed` on chips and slots, the `.ics` export, query-param deep links (`?service=`), the default-tab logic, and the real-button semantics the design system already asks for.

## 3. Target architecture

### 3.1 Tooling

| Concern | Choice | Why |
| --- | --- | --- |
| Build | Vite + `@vitejs/plugin-react` | Fast, static output, trivial to host publicly |
| Language | TypeScript `strict` + `noUncheckedIndexedAccess` | Catches the undeclared-state class of bug |
| Routing | React Router, `createHashRouter` | Works on any static host (GitHub Pages) with no rewrite rules, so a public link can't 404 on refresh |
| State | `useReducer` + Context for the booking draft; repository-backed hooks for persisted data | No state library needed at this size |
| Styling | CSS Modules + `tokens.css` custom properties | Keeps the existing CSS-variable system; scoped styles |
| Project shape | One root `package.json`, one `vite.config.ts` (`root: 'app'`), path aliases `@app/*` and `@src/*` | Simplest for a student team; no workspaces |
| Tests | Vitest + React Testing Library + `user-event` | `src/` tests run in a Node environment (proving it needs no DOM); `app/` tests run in jsdom |
| Quality | ESLint (`typescript-eslint`, `react-hooks`, `jsx-a11y`), Prettier, boundary rules via `no-restricted-imports` | Enforces the layers and accessibility rules in CLAUDE.md |
| Boundary check | Separate `tsconfig.src.json` with no DOM lib, so `src/` fails to compile if it touches `window`, `document`, or `localStorage` | Makes "backend-shaped" a compiler-enforced fact |
| CI / deploy | GitHub Actions: CI (typecheck, lint, test, build) and a separate Pages deploy; host-specific details isolated per section 3.5 | The team already uses GitHub; produces the required public URL; moving hosts later is a config change |

Versions are pinned at scaffold time (Phase 0), not decided here.

### 3.2 Folder layout

`app/` holds all frontend code. `src/` holds the backend-shaped code: pure TypeScript with no React and no DOM. Tooling lives at the repo root.

```
HairLondon/
  package.json  tsconfig.json  tsconfig.src.json  vite.config.ts  eslint.config.js
  CLAUDE.md
  docs/  refactor-plan.md  deployment.md
  hair-by-london-design-system/     # spec (unchanged; kept in sync)
  .github/workflows/                # ci.yml, deploy-pages.yml
  deploy/                           # host-specific files: pages/ netlify/ vercel/ static/
  scripts/                          # postbuild.ts, generate-tokens.ts

  app/                              # FRONTEND
    index.html
    public/images/                  # home.jpg, work-1..6
    config.ts                       # only reader of import.meta.env; exports typed config + assetUrl()
    main.tsx
    shell/                          # composition root
      App.tsx  router.tsx  providers.tsx
      layout/ AppShell.tsx  Header.tsx  Footer.tsx
    adapters/                       # browser implementations of src interfaces
      local-storage-adapter.ts
    ui/                             # design-system implementation
      tokens/    tokens.css  (generated from tokens.json)
      Button/ Chip/ Tabs/ Avatar/ Stars/ Icon/ Modal/ Sheet/ ConfirmDialog/
      ServiceOption/ ServiceRow/ SlotPicker/ StylistCard/ PortfolioGrid/ Reviews/
      ProfileHeader/ ConfirmBar/ Hero/ NavBar/ FormField/ Recap/
    features/
      home/  stylists/  stylist-profile/  booking/  appointments/  saved/  prototype-notice/  help/
    hooks/  lib/  test/

  src/                              # BACKEND-SHAPED (no React, no DOM)
    domain/
      models/    service.ts stylist.ts review.ts appointment.ts booking-draft.ts
      scheduling/ availability.ts  seeded-availability.ts  slots.ts  salon-hours.ts
      pricing/   totals.ts
      format/    time.ts date.ts duration.ts phone.ts rating.ts
      calendar/  ics.ts
      clock.ts
    data/
      storage/   storage-adapter.ts (interface)  memory-storage-adapter.ts
      repositories/ stylist-repository.ts  appointment-repository.ts  saved-repository.ts  review-repository.ts
      seed/      services.ts  stylists.ts
```

Dependency direction: `app -> src`, never the reverse. Inside `app/`, `shell` sits on top, then `features`, then `ui`. Inside `src/`, `data` may use `domain`.

Repositories are **concrete classes** that take a `StorageAdapter`. The adapter is the swap seam, and it already has two implementations (memory for tests, `localStorage` for the browser). A repository interface is extracted only if a second implementation (for example an HTTP one) shows up.

Legacy files stay at the repo root, untouched, until parity.

### 3.3 Patterns and where they earn their place

Each row names its **source** honestly. GoF patterns are classified by refactoring.guru's catalog; React and performance patterns are from patterns.dev. Some items are good practice that belongs to neither, and are labeled that way. A pattern appears here only if it removes a concrete problem in this codebase.

| Pattern | Source | Applied to | Problem it solves / justification |
| --- | --- | --- | --- |
| **Strategy** | GoF (behavioral) | `AvailabilityStrategy`: `SeededAvailability` (the legacy hash) | Isolates the fake availability from the UI. Tests need a fixed, deterministic implementation as well, so there are already two |
| **Decorator** | GoF (structural) | `AppointmentAwareAvailability(base, appointments)` wraps any availability strategy | Real near-term need the legacy site lacks: once a user books a slot it must become unavailable, and rescheduling must free it. Adds this behavior without changing the base strategy |
| **Adapter** | GoF (structural) | `StorageAdapter` interface in `src/data/storage`; `MemoryStorageAdapter` in `src`, `LocalStorageAdapter` in `app/adapters` | `src/` stays free of browser APIs; tests run without a DOM store; a remote store could replace `localStorage` later |
| **Facade** | GoF (structural), realized as a custom hook (patterns.dev: **Hooks Pattern**) | `useBooking`, `useStylist(id)`, `useAppointments` | One simple interface over repositories, domain rules, and the clock. A hook must do real composition (several sources, derived values); a hook that only forwards one call is a Middle Man and should not exist |
| **Observer** | GoF (behavioral) and patterns.dev **Observer Pattern** | Repositories expose `subscribe(listener)`; React reads them via `useSyncExternalStore` | Saved stylists and appointments update everywhere without prop drilling. Repositories (plain TypeScript in `src/`) implement `subscribe`; the `useSyncExternalStore` bridge lives in `app/` |
| **Compound** | patterns.dev **Compound Pattern** | `Tabs` (context-based). *As built:* `SlotPicker.Days` + `.Times` is a composed pair, and `ServiceList` was not built | Flexible composition without a prop explosion |
| **Factory (function)** | patterns.dev **Factory Pattern** (a function that creates objects). Not GoF Factory Method or Abstract Factory | *Planned, not built:* `makeStylist`, `makeAppointment` test-data builders | Readable tests with sensible defaults |
| **Route-based splitting**, **Dynamic Import** | patterns.dev performance patterns | `React.lazy` per route | Smaller first load on a phone |
| **Import on Interaction** | patterns.dev | *Planned, not built.* The photo viewer is a lazy route instead | Keeps the main bundle small |
| **Prefetch** | patterns.dev | *As built:* `MainLayout` prefetches the booking chunk when the browser is idle | Booking feels instant |
| **Client-side Rendering** | patterns.dev rendering patterns | The whole app is a CSR single-page app | Matches static hosting; no server rendering needed for a prototype |
| **Module Pattern** | patterns.dev | ES modules with `index.ts` public APIs per feature | Encapsulation; features expose only what others may use |

Not GoF or patterns.dev, but used on purpose and attributed correctly:

| Practice | Origin | Applied to |
| --- | --- | --- |
| **Repository** | Fowler, *Patterns of Enterprise Application Architecture* / DDD. **Not a GoF pattern** | Concrete classes in `src/data/repositories` (`StylistRepository`, `AppointmentRepository`...) over a `StorageAdapter`. Components stop knowing where data comes from. Create one only for data that is actually persisted or looked up; extract an interface when a second implementation exists |
| **Finite state machine via reducer** | Redux/React idiom. It has the *intent* of GoF **State** (behavior depends on the current state) but not its class structure, which is not idiomatic in React | Booking wizard `choose -> details -> done` as a discriminated union plus `useReducer`; illegal transitions are unrepresentable |
| **Dependency injection via React Context** | React's built-in mechanism. patterns.dev's current React list does not include a "Provider" page | Repositories, clock, prototype-notice state; tests swap in fakes |
| **Layered / feature-sliced structure, ports and adapters** | Clean/hexagonal architecture and feature-sliced conventions. **Not from GoF, patterns.dev, or refactoring.guru** | The `app/` vs `src/` split and the layering inside each (`shell`, `features`, `ui` / `domain`, `data`), with the import rules |

Considered and **deliberately not used**:

- **Singleton** (GoF; patterns.dev discusses its downsides in JS): module-level mutable instances hurt testing. Context supplies one instance per app instead.
- **HOC** and **Render Props** (patterns.dev): hooks replace them here.
- **Container/Presentational** (patterns.dev): superseded by hooks. Components stay presentational and hooks hold the logic, without a separate "container" layer.
- **Builder** (GoF): `.ics` generation is a serializer (a pure function from an appointment to text), not stepwise construction of a complex object.
- **Command, Memento, Mediator, Chain of Responsibility, Visitor, Flyweight, Proxy, Bridge, Composite, Template Method, Iterator, Prototype**: no problem in this app needs them. Using them would be Speculative Generality.
- **Server/streaming rendering, List Virtualization, PRPL**: not relevant at this size and hosting model.

Guard rails from refactoring.guru's own advice: an interface with exactly one implementation and no test double is Speculative Generality. `StorageAdapter` has two (memory and `localStorage`), so it qualifies; repositories stay concrete classes until a second implementation exists. `ServiceId` and `Weekday` are literal unions, not classes. Apply Replace Conditional with Polymorphism only when a switch grows a third real case.

### 3.4 Domain model (sketch)

```ts
type ServiceId = 'haircut' | 'color' | 'highlights' | 'root-touch-up' | 'blowout' | 'deep-conditioning';
interface Service { id: ServiceId; name: string; durationMin: number; description: string }
interface Stylist {
  id: string; name: string; studio: string; city: string; photo: string | null; bio: string;
  workDays: readonly Weekday[]; prices: Partial<Record<ServiceId, number>>;
  portfolio: readonly PortfolioPhoto[]; reviews: readonly Review[];
}
interface BookingDraft { stylistId: string; serviceIds: ServiceId[]; date: Date | null; startMin: number | null; name?: string; phone?: string }
interface Appointment { id: string; stylistId: string; serviceIds: ServiceId[]; date: string /* ISO yyyy-mm-dd */; startMin: number; durationMin: number; total: number; name: string; phone: string; status: 'upcoming' | 'cancelled' | 'completed' }
```

`Partial<Record<ServiceId, number>>` replaces `services: {id: price}` and makes "stylist doesn't offer this service" a type-level fact.

### 3.5 Deployment and host portability

**Now:** GitHub Pages at `https://rhoopes25.github.io/HairLondon/` (repo `Rhoopes25/HairLondon`), hash routing. **Later:** any host, by changing configuration only. Nothing in `app/` or `src/` may hard-code a host, a base path, or a router mode.

Everything host-specific lives in four places:

| Concern | Where | How it stays swappable |
| --- | --- | --- |
| Base path | `VITE_BASE` env var read by `vite.config.ts` (`/HairLondon/` on Pages, `/` elsewhere) | Never typed into source. Images and links go through `assetUrl()` / the router `basename`, both derived from `import.meta.env.BASE_URL` |
| Router mode | `VITE_ROUTER_MODE` = `hash` or `browser`, read once in `app/config.ts`; `shell/router.tsx` builds `createHashRouter` or `createBrowserRouter` from it | Routes are defined once as data; only the factory call changes. A unit test covers both modes |
| SPA fallback / rewrites | `deploy/<target>/` files copied into `dist/` by `scripts/postbuild.ts` for `DEPLOY_TARGET` = `pages`, `netlify`, `vercel`, or `static` | `pages`: copy `index.html` to `404.html` (needed only in `browser` mode). `netlify`: `_redirects`. `vercel`: `vercel.json`. `static`: documented `try_files` / rewrite snippet for nginx or any server |
| Pipeline | `.github/workflows/ci.yml` (host-neutral: typecheck, lint, test, both build modes) is reused by `deploy-pages.yml`, which builds with `npm run build:pages` and deploys. The base path is baked in at build time, so each host's workflow runs its own build script rather than sharing one artifact | Switching host means replacing or adding one deploy workflow. CI, tests, and app code do not change |

`app/config.ts` is the only file that reads `import.meta.env`. It validates values and exports a typed `config` object (`routerMode`, `base`, and `apiUrl`, which is unused until a real backend exists). Hosting needs no code changes, because `src/` already has no browser dependencies and persistence is behind `StorageAdapter`.

**Switching hosts (documented in `docs/deployment.md`):**
1. Set `VITE_BASE=/` and `VITE_ROUTER_MODE=browser` (optional but gives clean URLs) and `DEPLOY_TARGET` for the new host.
2. Add the host's deploy step (or connect its Git integration, pointing at the CI build).
3. Run the deep-link check: open `/stylists/london` directly in a fresh tab and refresh.

Two Pages constraints to plan around:
- **Repo admin is required.** The repo is owned by `Rhoopes25`, so that account (or someone they grant admin) must enable Pages and set the source to "GitHub Actions". Do this in Phase 0, not on submission day.
- **Pages is public for public repos only** on free accounts; confirm the repo's visibility, since an inaccessible link scores zero.

### 3.6 "Low fidelity": the decision

The rubric's criterion is: *"The prototype looks low fidelity from the perspective of the user, and the user is explicitly told the prototype is in early stages (e.g. with a modal)."* The assignment text also asks for *"a natural and familiar feel."*

**Decision (yours):** do not build a separate low-fidelity theme. The app uses the existing design tokens (`tokens.json` / `style.css` values) and the real portfolio and hero photos as they are. We do not spend effort making it look rougher.

What we do build, because it is cheap and covers the explicit half of the criterion:

1. **Plain-English notice.** A first-visit modal says in everyday words that this is an early draft, what is pretend (no real texts, no real payments, sample reviews), and what the user's goal is. It is dismissible and re-openable from the footer.
2. **Always-visible label.** A small "Early prototype" label on every screen, so the notice is not a one-time event.
3. **Natural and familiar.** Standard controls and layouts throughout.

**Known risk, accepted:** the "looks low fidelity" half of the 20-point criterion is judged on appearance, and a polished cream-and-gold UI may read as hi-fi to a grader. The notice and label are the mitigation. If feedback says it looks too finished, the cheapest fix is a handful of token overrides (a `[data-fidelity]` block in `tokens.css`), and nothing in the architecture needs to change for that.

## 4. Screen inventory (target: 26)

The rubric asks for roughly 20-30+ screens and a lo-fi prototype that **stays on the core features** (portfolio, reviews, booking) and avoids tangents. Every screen below is tagged **Core** (directly serves portfolio, reviews, or booking) or **Support** (makes the core usable or recoverable). If cut for scope, cut Support first.

| # | Screen | Route | Type | New or ported |
| --- | --- | --- | --- | --- |
| 1 | Home (entry) | `/` | Core | Ported |
| 2 | Early-stage prototype + goal modal | overlay | Support (required) | New |
| 3 | Stylists list | `/stylists` | Core | Ported |
| 4 | Service filter sheet | overlay | Support | New (today: inline chips) |
| 5 | Stylist profile: Portfolio tab | `/stylists/:id` | Core | Ported |
| 6 | Stylist profile: Services tab | `/stylists/:id/services` | Core | Ported |
| 7 | Stylist profile: Reviews tab | `/stylists/:id/reviews` | Core | Ported |
| 8 | Photo viewer (next/prev) | `/stylists/:id/photos/:n` | Core | New |
| 9 | Service detail sheet | overlay | Core | New |
| 10 | About the studio (hours, location) | `/stylists/:id/about` | Support | New |
| 11 | Booking: choose services, day, time | `/book/:id` | Core | Ported |
| 12 | Booking: your details | `/book/:id/details` | Core | Ported |
| 13 | Booking: review and confirm | `/book/:id/review` | Core | New (split from details) |
| 14 | Booking: confirmed | `/book/:id/done` | Core | Ported |
| 15 | Leave-booking confirm | overlay | Support | Ported (`window.confirm`) |
| 16 | My appointments | `/appointments` | Support | New |
| 17 | Appointment detail | `/appointments/:id` | Support | New |
| 18 | Reschedule | `/appointments/:id/reschedule` | Support | New (reuses `SlotPicker`) |
| 19 | Cancel confirm | overlay | Support | New |
| 20 | Leave a review | `/appointments/:id/review` | Core (trust loop) | New |
| 21 | Saved stylists | `/saved` | Support | New |
| 22 | How booking works / help | `/help` | Support | New |
| 23 | Reminder text preview | overlay | Support | New |
| 24 | Add to calendar (confirm) | overlay | Support | Ported |
| 25 | Empty states (no stylists / no times / no appointments) | inline | Support | Ported + new |
| 26 | Not found | `*` | Support | New |

**Settled:** overlays and sheets count as screens. 17 of the 26 are full routes and 9 are overlays or states, which satisfies the rubric's 20-30+. Each overlay must still be a distinct, fully designed state with its own purpose, listed in the dev gallery, and reachable in the running app (an overlay that cannot be triggered does not count). Keep this count honest in the submission write-up. If scope is cut, cut Support rows first but stay at or above 20.

Non-linearity (rubric): booking can start from Home service shortcuts, the stylist list, a stylist's Services tab (preselects the service), a portfolio photo, an appointment's Reschedule, or the persistent Book button in the profile header. Nothing requires visiting a screen in a fixed order.

## 5. Phased plan

Each phase ends with a working, committed app. Phases 0-2 have no visible UI change; that is intentional.

### Phase 0: Scaffold and tooling
- Create the root tooling (`package.json`, `vite.config.ts` with `root: 'app'`, `tsconfig.json`, `tsconfig.src.json` without the DOM lib), the `app/` and `src/` folders, and path aliases `@app/*` and `@src/*`. Set `strict` and `noUncheckedIndexedAccess`.
- ESLint (incl. `jsx-a11y`, `react-hooks`, layer boundary rules), Prettier, Vitest + Testing Library; `npm run` scripts per CLAUDE.md.
- Move images to `app/public/images/` with `git mv` (copy first if the legacy pages still need them; see risks).
- Host-portability infrastructure from section 3.5: `app/config.ts`, router factory with both modes, `assetUrl()` helper, `scripts/postbuild.ts`, `deploy/` host files, `docs/deployment.md`.
- GitHub Actions: a CI workflow (typecheck, lint, test, build) and a separate Pages deploy workflow that consumes the CI build artifact.
- **Done when:** `npm run build` and `npm test` pass on a placeholder page, CI is green, the placeholder is live on GitHub Pages, and a local build in `browser` router mode serves a deep link correctly (proves the switch works before there is anything to lose).

### Phase 1: Design tokens and UI primitives
- Port `:root` variables from `style.css` into `app/ui/tokens/tokens.css`. Add `scripts/generate-tokens.ts` to emit it from `hair-by-london-design-system/tokens.json` plus a test that fails if they drift (one source of truth for the design library).
- Build the primitives in dependency order: `Icon`, `Button`, `Avatar`, `Stars`, `Chip`, `Tabs`, `FormField`, `Modal`/`Sheet`, `ConfirmDialog`.
- Port each component's CSS into its CSS Module from the matching `style.css` section; use the design-system `preview.html` and README as the acceptance reference. Apply the documented a11y fixes (real buttons, `gold-ink`, disabled state).
- A dev-only `/__gallery` route renders every component (doubles as the "design library" evidence for grading).
- **Done when:** every primitive has a render + interaction test and appears in the gallery.

### Phase 2: Domain and data layers (the real refactor)
Port logic out of `booking.html`/`data.js` into typed, tested pure modules:
- `format/time.ts`: `formatTime`, `formatRange`, `formatDuration` (port as-is, then test the noon-crossing case).
- `scheduling/`: `salon-hours.ts` (named constants), `slots.ts` (`isStartAvailable` using an injected `Clock`), `seeded-availability.ts` (the FNV hash strategy, behind the `AvailabilityStrategy` interface).
- `pricing/totals.ts`: total price and duration; `startingPrice` and `priceRange` return `null` when nothing matches.
- `format/phone.ts`, `calendar/ics.ts`.
- `models/`: literal-union and branded types (`ServiceId`, `Weekday`, `Minutes`) instead of bare strings and numbers (Primitive Obsession).
- Typed `seed/` data from `data.js`. Repositories are concrete classes over `StorageAdapter` and implement `subscribe` (Observer). `MemoryStorageAdapter` lives in `src/`; `LocalStorageAdapter` lives in `app/adapters`. `src/` tests run in a Node environment.
- **Done when:** domain coverage is high (aim at every branch of availability, pricing, formatting), all tests pass, `tsconfig.src.json` compiles `src/` with no DOM lib, and nothing in `src/` imports React or `app/`.

### Phase 3: App shell and global prototype UX
- Router, `AppShell` (`Header`, `Footer`, persistent nav that exists on every screen), route-based code splitting with `React.lazy`, 404.
- Performance patterns (patterns.dev): prefetch the booking chunk from the profile page; import the photo viewer and sheets on first interaction; keep `loading="lazy"` on portfolio images.
- `prototype-notice` feature: first-visit modal that says in plain English that this is an early, unfinished prototype (what is pretend, what is real) and states the user's goal; dismissible, re-openable from the footer, state remembered in `localStorage`. A small "Early prototype" label is visible on every screen (section 3.6).
- **Done when:** every route renders in the shell and the modal behaves correctly on first and repeat visits.

### Phase 4: Feature parity with the legacy site
Port in this order, comparing each to its legacy page side by side:
1. **Home**: hero, "What are you booking?" shortcuts (deep-link to `/stylists?service=`).
2. **Stylists**: filter chips synced to the URL, cards, empty state.
3. **Stylist profile**: header, tabs (URL-synced), portfolio, services (rows link to booking with the service preselected), reviews, bottom CTA.
4. **Booking wizard**: reducer-driven; services -> day/time -> details -> done; summary bar and "done by" note; validation messages; `ConfirmDialog` on exit; `.ics` download.
- **Done when** the parity checklist in section 7 passes by hand and in component tests.

### Phase 5: Expand to the rubric's screens
- Add the **New** rows of the inventory, each as its own small PR from the teammate who owns that section.
- Appointments feature: create on booking confirm, list, detail, reschedule (reuses `SlotPicker`), cancel, leave a review (feeds the stylist's reviews so the trust loop is real).
- `AppointmentAwareAvailability` (Decorator over the seeded strategy): a slot the user booked becomes unavailable, and cancelling or rescheduling frees it. Legacy does not do this; it is the second real behavior that justifies the Strategy seam.
- Saved stylists, photo viewer, service detail sheet, help.
- **Done when:** all inventory rows exist and are reachable by at least two distinct paths where applicable.

### Phase 6: Usability audit and early-stage messaging
- Confirm the notice modal and the "Early prototype" label (section 3.6) appear correctly on every screen. No separate lo-fi theme is built.
- Review every screen as a first-time user would: is it instantly understandable, and is the early-stage message clear?
- Audit the whole app once per principle taught in class (conventions, signifiers, attention, grouping, feedback, error prevention, flexibility, consistency, visibility). Log findings in `docs/usability-audit.md` and fix.
- Verify the entry screen: capability first and most prominent, secondary actions clearly secondary.
- **Done when:** a fresh user can state what the app is for within five seconds and complete the goal by at least two routes.

### Phase 7: Deploy, clean up, document
- Confirm the Pages URL loads on a phone, deep links and refresh work (hash routing), and the modal appears.
- Delete legacy root files in one commit; remove `portfolio.html`; update `README.md`, `CLAUDE.md` Status, and the design-system README open items.
- Draft the submission text: public URL plus the paragraph on how the prototype emphasizes the core features and avoids tangential ones (rubric requirement).

## 6. Team ownership

The rubric requires every member to own a section. Suggested split by feature folder so PRs rarely collide (names to be filled in by the team):

| Owner | Feature folders |
| --- | --- |
| _TBD_ | `home`, `prototype-notice`, `help`, app shell |
| _TBD_ | `stylists`, `stylist-profile` (portfolio, reviews, photo viewer) |
| _TBD_ | `booking`, `appointments` |
| Shared | `app/ui/` (changes via small PRs reviewed by all), `src/domain/`, `src/data/` |

Phases 0-3 should be done by one person (or paired) so the foundation does not fork; Phases 4-6 parallelize.

## 7. Parity checklist (legacy behavior that must survive)

- [ ] Home shortcut shows the price range across stylists (e.g. Blowout `$35–45`) per service and links to `/stylists?service=<id>`.
- [ ] Stylists list: chip filter updates URL without reload; "From $X" vs "<Service> $X"; empty message when none match; selected chip scrolls into view.
- [ ] Profile: default tab is Portfolio, except Services when arriving with `?service=` or when the stylist has no photos; arrow keys move between tabs; initials avatar when no photo; "New" when no reviews; per-stylist "hasn't added photos yet" note.
- [ ] Booking: unknown stylist redirects to the list; `?service=` preselects; days limited to the stylist's work days across the next 21 days; slots every 30 min from 9:00 AM to 6:00 PM; a slot is disabled if the service run would pass closing or overlap a "booked" block; today requires >= 60 min lead time; changing services clears a time that no longer fits; picking a new day clears the time; summary line, total, and "You'll be done by..." note update live; Continue disabled until services, day, and time are set.
- [ ] Details: name required, 10-digit phone (leading `1` tolerated), inline errors with `aria-invalid`, focus moves to the first invalid field, phone shown as `(555) 123-4567`.
- [ ] Done: recap rows, reminder note, `.ics` download with correct start/end/location.
- [ ] Exit during an in-progress booking asks for confirmation; exit after completion does not.
- [ ] Focus moves to the new step's heading on each step change; scroll resets to top.
- [ ] Availability is stable: the same stylist, day, and time always yields the same result (golden test against the legacy hash).

## 8. Decisions needed from you

I assumed the defaults in **bold**; say so if any should change.

1. **Layout (settled):** `app/` is all frontend, `src/` is all backend-shaped code (confirmed by you). Tooling is at the repo root, with one `package.json`. Legacy stays at the repo root until Phase 7. (Alternative: move legacy into `legacy/` immediately.)
2. **Hosting (settled):** GitHub Pages with hash routing now, with host-portability infrastructure in place (section 3.5) so switching is configuration. Open dependency: the repo owner `Rhoopes25` must enable Pages with the "GitHub Actions" source.
3. **Low fidelity (settled):** no separate lo-fi theme. Existing design tokens and real photos are used as they are; the plain-English notice modal and an "Early prototype" label carry the early-stage message (section 3.6). Accepted risk is noted there.
4. **Screen count (settled):** overlays count as screens (section 4).
5. **Rubric file:** `md/` is gitignored, so teammates cannot see the rubric. CLAUDE.md summarizes it. Consider un-ignoring `md/` or moving the rubric to `docs/`.

## 9. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Scope creep toward a "real" booking product and tangential features | Every screen tagged Core or Support; cut Support first; the submission text must defend the focus |
| Over-engineering with patterns (Speculative Generality, Middle Man, Lazy Class) | CLAUDE.md rule: a pattern needs a concrete problem and an interface needs a real second implementation; hooks must compose real logic; reviewers can push back |
| Refactor regresses subtle booking behavior | Phase 2 golden tests against legacy logic; section 7 checklist; keep legacy runnable side by side until Phase 7 |
| Teammates collide in `app/ui/` and `src/domain/` | Small PRs, shared-ownership rule, CI gating |
| `src/` quietly picks up a browser dependency | `tsconfig.src.json` has no DOM lib, plus a lint rule forbidding imports from `app/`; both run in CI |
| Images move breaks legacy pages | Copy images in Phase 0, delete legacy copies in Phase 7 |
| App reads as high-fidelity to graders | Notice modal and "Early prototype" label on every screen; if feedback says too polished, a small token-override block is the cheapest fix (section 3.6) |
| Hosted link breaks on grading day | Hash routing, CI deploy, test the URL in a private window and on a phone before submitting |
| Pages cannot be enabled (repo owned by `Rhoopes25`, needs admin) | Ask for admin or Pages access in Phase 0; the host-portable build means Netlify or Vercel is a fallback within an hour |
| Host config leaks into source (hard-coded base path, router mode) | Single `app/config.ts`, `assetUrl()` helper, lint rule against `import.meta.env` elsewhere; Phase 0 proves `browser` mode works locally |
