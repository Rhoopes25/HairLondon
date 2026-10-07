# Hair by London

A calm booking design system for one stylist. It keeps HairLondon's own look (cream and gold, italic serif headlines, round check marks, pill buttons, real client photos) and borrows the structure clients already know from booking marketplaces such as Vagaro: a profile with tabs and a persistent Book action, service rows with prices, day and time pickers, and a compact rating line. It leaves out the pressure that marketplaces add.

## Sources

| Source | Used for |
| --- | --- |
| `style.css` from the HairLondon repo | Every color, font, size, radius, shadow and spacing value. Tokens marked "From style.css" are exact |
| `index.html`, `portfolio.html`, `booking.html` | Screen anatomy, copy, prices, icon drawing |
| HairLondon project README | Persona and the value "Calm" |
| vagaro.com homepage | Page structure and component vocabulary only. Its colors, fonts and logo are not used |

Two kinds of addition are marked "Added": the `gold-ink` color (an AA-safe darker gold) and two components that do not exist on the site yet (ProfileHeader and the disabled button state). Everything else in the system is in the stylesheet.

## The brand in one line

**Calm.** A mother with a small window of time should be able to see the work, trust the stylist and book a time without feeling rushed or gambling on a stranger.

## Content fundamentals

- **Voice.** Plain and first person from the stylist. Screen titles read like a person: "My Work", "Book Now". Reviews talk about ease and trust more than transformation.
- **One verb per screen.** "Book Now" on Home and My Work, "Continue" on Book. Never "Hurry", "Grab" or "Claim".
- **No pressure devices.** Marketplaces show "9 spots left", "Up to 30% off" badges and countdowns. Hair by London does not. Availability is plain: open or unavailable.
- **Metadata** is one quiet line, for example `Haircut · $65`, `Thu 16 · 2:30`.
- **Times** should carry AM or PM. The current booking page lists `1:00` and `2:30` without it.
- **Real examples:** "Choose your services", "Choose a day", "Choose a time", "Select a day to see available times", "Finally found someone I trust with my hair."

## Visual foundations

- **Color.** The page is `cream`; rows and cards are `white` with a thin border, not a heavy shadow. `gold-deep` is the only action color: every filled button, the selected day chip, the checked service circle, the stars and the active nav link. `gold` and `gold-soft` are warmth and quiet borders. Text is `ink` or `ink-soft`.
- **Type.** Cormorant Garamond (display) for names, screen titles and section headings, with the landing name set in italic. Jost (text) for everything else. Ten styles in all (see Typography).
- **Spacing.** Rem-based. Screen side margins are 1.5rem (`space-5`); chips and slots sit 0.6rem (`space-1`) apart; portfolio tiles 1rem (`space-3`).
- **Shape.** Buttons are pills; service rows and day chips are 14px; slots 10px; the reviews card 18px; photo tiles 20px; the check and social icons are circles. Controls carry a 1.5px border in `cream-deep`, turning `gold-deep` when chosen.
- **Elevation.** Almost flat. Only photo tiles have a soft shadow (`shadow-card`), and nothing else casts a shadow.
- **Layout.** Mobile first, then a real website. On a phone it is one column with a sticky header that has a `gold-soft` rule, and booking reads top to bottom: services, day, time, then the confirm panel. Three breakpoints (`responsive.breakpoints` in `tokens.json`): `sm` 640px, `md` 900px, `lg` 1200px. The header, prototype strip and footer are full-width bands; page content sits in a centered container up to `container-max` (1200px) with a `gutter` at `md`, and single-purpose screens (forms, recaps, help) in `container-narrow` (640px). From `sm`, sheets become centered dialogs (`dialog-width`) and grids gain columns. At `md`, booking is two columns with the summary panel sticky under the header (`header-height`), the hero splits into text and portrait, and display type grows (`responsive.type`). The component previews in `components/` are phone-width specimens on purpose.
- **Hero.** On a phone, a full-width 4:5 photo with a warm glow (white at top left, gold at bottom right) and an ink scrim rising from the bottom that carries the italic name and a white pill button. From `md` the text moves beside the portrait (no overlay) and the button becomes the filled `gold-ink` action.
- **Imagery.** Real client work in warm light. While a photo loads, tiles show a 145deg gradient from `photo-light` to `photo-deep`.
- **Motion.** Short 0.15 to 0.2 second fades on color, plus a 1px lift on the hero button. All of it is turned off under `prefers-reduced-motion`.

## What we take from Vagaro, and how it changes

| Vagaro pattern (from its pages) | In Hair by London | Component |
| --- | --- | --- |
| Business profile with a tab row (Services, Classes, Gift Cards, Memberships, Products, Reviews) and a persistent Book Now | Three tabs (Services, Portfolio, Reviews) with a Book pill that stays in the row. New to the site | ProfileHeader |
| Service rows with name at left and price at right | Already the site's pattern, kept as is | ServiceOption |
| Rating line such as "5.0 (45 Reviews)" | Gold-deep stars plus a plain count above the reviews | Reviews |
| Rating breakdown (Overall, Punctuality, Value, Service) | Optional, only when real data exists | Reviews |
| Date strip, time slots, then a book action | Already the site's pattern | SlotPicker, ConfirmBar |
| Filters, sort chips, deal badges, "spots left" | Not adopted: one stylist, nothing to filter, nothing to rush | none |
| Horizontal carousels with "See all" | Not adopted; the portfolio is a plain two-column grid | PortfolioGrid |

## Iconography

Line icons on a 24px grid, stroke 1.6, `currentColor`, no fills. The logo mark is a scissors drawing in `gold-deep`, 1.4rem, which links Home. Social icons sit in 2.1rem `gold-soft` ringed circles that fill `gold-deep` on hover. Icons never replace a text label for an action.

## Accessibility: known gaps and the rules

These are in the current stylesheet. Keep them visible rather than hiding them.

- **Gold-deep carries text below 4.5:1.** White on `gold-deep` is 3.6:1 (buttons, selected day chip, check mark) and `gold-deep` text on `cream` is 3.4:1 (active nav link, text links). Use `gold-ink` for small text and for button fills when contrast must pass; keep `gold-deep` for large text, icons and stars.
- **Control borders are faint.** `cream-deep` around unchosen service rows, chips and slots is well under 3:1. Keep the 1.5px border but do not rely on it alone to mark an option as interactive; the white fill, shape and label carry that.
- **Unavailable slots** use `unavailable` text on `cream-deep`, about 1.6:1. The stylesheet has no disabled styling beyond that. Always add a strike-through.
- **Picker controls are divs.** In the prototype the day chips and time slots are clickable divs. Build them as real buttons with `aria-pressed` (chosen) and `disabled` (unavailable), with the existing 2px `gold-deep` focus ring and 2px offset.
- **The confirm button has no disabled style.** It is disabled in the script but looks the same as when it is ready. See Button for the added state.
- Touch targets are at least 44px high; the chips and slots already come close.

## Status in the React app

The React implementation lives in `app/ui`. `tokens.json` is the source of truth and `app/ui/tokens/tokens.css` is generated from it (`npm run tokens`; a test fails if they drift). Where the sections above describe known gaps, the app now does this:

- **Contrast.** Filled buttons and small text use `gold-ink`; `gold-deep` is for icons, stars, borders, and the focus ring. `scripts/contrast.test.ts` checks every text pair against WCAG AA.
- **Picker controls** are real buttons with `aria-pressed` and `disabled`. Unavailable slots are struck through.
- **Disabled button state** exists (`cream-deep` fill, `ink-soft` text).
- **Error color** `danger` was added to the tokens (it was hard-coded in the old stylesheet).
- **Times** carry AM or PM.
- **Navigation** is a header with Home, Stylists, Appointments, Saved. The bottom tab bar was not built.
- Marketplace pressure (spots left, deal badges, countdowns) is deliberately absent.

Components added beyond the original list: Modal, Sheet, ConfirmDialog, TextField, TextAreaField, StarInput, BackLink, Chip, Tabs, Recap, StylistCard, ServiceRow, Avatar, Stars, and Icon. All of them are shown together at `/#/design-library` in the running app.

## Open items

1. Replace the sample reviews and most sample stylists with real ones before any real launch.
2. Add real availability from a calendar, in place of the seeded sample openings.
3. Re-check the visual design by eye on real phones; the automated checks do not judge how it looks.
