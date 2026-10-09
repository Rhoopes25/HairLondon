# Local Locks

A calm booking design system for a small set of local stylists. A busy mom picks what she needs, sees who can fit her in, looks at their real work, and books a time, all in a nap-time window.

It keeps HairLondon's own look (cream and gold, italic serif headlines, round check marks, pill buttons, real client photos) and borrows the structure clients already know from booking marketplaces such as Vagaro: search filters, stylist cards with next open times, a profile with tabs, service rows with prices, day and time pickers, and a compact rating line. It leaves out the pressure that marketplaces add.

## Sources

| Source | Used for |
| --- | --- |
| `style.css` from the HairLondon repo | Every color, font, size, radius, shadow and spacing value |
| `index.html`, `stylists.html`, `stylist.html`, `booking.html`, `data.js` | Screen anatomy, copy, prices, durations, icon drawing |
| HairLondon project README | Persona and the value "Calm" |
| Prof. Twyman's lo-fi guidance (IS 551 Slack) | The prototype notice and the stark visual hierarchy |
| vagaro.com | Page structure and component vocabulary only. Its colors, fonts and logo are not used |

## The brand in one line

**Calm.** A mother with a small window of time should be able to see the work, trust the stylist and book a time without feeling rushed or gambling on a stranger.

## Lo-fi prototype rules

This is a low-fidelity prototype for concept testing. Low fidelity here doesn't mean no styling. It means:

- **A stark visual hierarchy.** Every screen has one loud action and everything else steps back, so testers all naturally go down the same happy path: Find a stylist → pick a service → tap a time → Continue → Confirm booking. It's allowed to look a little ridiculous.
- **A prototype notice, only at the start.** The PrototypeNotice bar tells testers it isn't meant to look polished and we're testing the idea, not the visuals. It shows on the first screen of a visit and never again, so it isn't a distraction later.
- **No ancillary stuff.** No social links, no extra pages, no promos. Anything that isn't the unique value (trust, then an easy booking) is left out.

The happy path, and the one loud thing on each screen:

| Screen | The one loud thing | Everything else |
| --- | --- | --- |
| Home | "Find a stylist" button | Logo, two nav links |
| Stylists | Numbered Step 1 (services) and Step 2 (tap a time on a card) | Day and time filters, marked optional and smaller |
| Profile | "Book with London" in the sticky BookBar | Tabs, back link |
| Book: day and time | Sticky "Continue" | Change services, price note |
| Book: details | Sticky "Confirm booking" | Recap card |
| Done | "You're booked" | Add to calendar, back to home |

## Content fundamentals

- **Voice.** Plain and friendly. Headings read like a person: "Find a stylist", "What do you need?", "Tap a time to book", "You're booked". Reviews talk about ease and trust more than transformation.
- **One verb per screen.** "Find a stylist" on Home, "Book with London" on a profile, "Continue" then "Confirm booking" on Book. Never "Hurry", "Grab" or "Claim".
- **No pressure devices.** No "9 spots left", no deal badges, no countdowns. Availability is plain: open or unavailable.
- **Prices are starting prices** and always show with a plus: "$65+". The booking screen says the stylist confirms the final price.
- **Durations add up.** Haircut + Highlights shows as one appointment, "about 3 hr 30 min", and only times with room for all of it show as open.
- **Times** always carry AM or PM. Ranges read "1:00 to 2:30 PM".
- **Metadata** is one quiet line, for example `1 hr · $65+`, `Sat, Oct 10 at 1:00 PM`.

## Visual foundations

- **Color.** The page is `cream`; rows and cards are `white` with a thin border. `gold-ink` is the action color for filled buttons and time chips (passes AA with white). `gold-deep` is for selected states, check marks, stars, and icons. `ink` is used for step numbers and the prototype notice. Text is `ink` or `ink-soft`.
- **Type.** Cormorant Garamond (display) for names, screen titles and section headings, with the landing name and "You're booked" in italic. Jost (text) for everything else.
- **Spacing.** Rem-based. Screen side margins are 1.5rem (`space-5`); chips sit about 0.5rem apart; portfolio tiles 1rem (`space-3`).
- **Shape.** Buttons and chips are pills; service rows, day chips, and cards are 14px; slots 10px; the reviews and recap cards 18px; photo tiles 20px; checks, avatars, and step numbers are circles. Controls carry a 1.5px border in `cream-deep`, turning `gold-deep` when chosen.
- **Elevation.** Almost flat. Photo tiles have `shadow-card`; the two sticky bottom bars (BookBar, ConfirmBar) have a soft upward shadow.
- **Layout.** One centered column, at most 460px, phone first. Sticky header on top; on Profile and Book, a sticky action bar on the bottom.
- **Imagery.** Real client work in warm light, JPGs around 900px wide. While a photo loads, tiles show a 145deg gradient from `photo-light` to `photo-deep`. Stylists without a photo get gradient initials.
- **Motion.** Short 0.15 to 0.2 second fades on color. All of it is turned off under `prefers-reduced-motion`.

## Components

| Group | Component | Where it's used |
| --- | --- | --- |
| Prototype | PrototypeNotice | First screen of a visit, any page |
| Navigation | NavBar (main and booking headers) | Every screen |
| Navigation | ProfileHeader | Profile |
| Trust | Hero | Home |
| Trust | PortfolioGrid | Profile, Portfolio tab (and thumbs on StylistCard) |
| Trust | Reviews | Profile, Reviews tab |
| Search | FilterChip (plus step labels) | Stylists |
| Search | StylistCard (plus SlotChip) | Stylists |
| Booking | BookBar | Profile |
| Booking | ServiceOption (plus service row and summary row) | Book, Profile Services tab |
| Booking | SlotPicker | Book |
| Booking | ConfirmBar | Book, both steps |
| Booking | DetailsForm | Book, step 2 |
| Booking | Confirmation | Book, step 3 |
| Actions | Button | Everywhere |

Reuse is the rule: the day chip is the same on Stylists and Book, the Avatar and rating line are the same on cards, profiles, and the booking header, the recap card is the same on details and done, and the sticky bar pattern is shared by BookBar and ConfirmBar.

## What we take from Vagaro, and how it changes

| Vagaro pattern | In Local Locks | Component |
| --- | --- | --- |
| Search by service, date, and time | Three filter groups, with day and time marked optional | FilterChip |
| Results list with next open times | Each card shows up to three open times as the main tap | StylistCard |
| Business profile with tabs and a persistent Book Now | Portfolio, Services, Reviews tabs; Book lives in a sticky bottom bar | ProfileHeader, BookBar |
| Service rows with name at left and price at right | Same, plus a one-line description and duration | ServiceOption |
| Rating line such as "5.0 (45 Reviews)" | Stars plus a plain count; "New" with no reviews | Reviews, StylistCard |
| Date strip, time slots, then a book action | Same, with durations adding up | SlotPicker, ConfirmBar |
| Deal badges, "spots left", sort menus | Not adopted: nothing to rush | none |
| Horizontal carousels with "See all" | Not adopted; the portfolio is a plain two-column grid | PortfolioGrid |

## Iconography

Line icons on a 24px grid, stroke 1.6, `currentColor`, no fills: scissors (logo and home), X (exit booking), chevrons (back, service rows), and a check (done). Icons never replace a text label for an action, except the logo and X, which have `aria-label`s.

## Accessibility

- **Contrast.** Filled buttons and time chips use `gold-ink` (6.3:1 with white). `gold-deep` stays for selected chips, icons, and stars, where a second cue (fill, weight, check mark) also shows the state.
- **Real controls.** Chips, slots, and tabs are `<button>`s with `aria-pressed` or ARIA tab roles, and keyboard focus survives re-renders.
- **Unavailable slots** are `disabled` and struck through, not just grayed.
- **Forms** use real labels, `autocomplete`, `aria-invalid`, and errors that say how to fix the problem.
- **Faint borders.** `cream-deep` around unchosen controls is under 3:1, so the white fill, shape, and label carry the affordance too.
- Touch targets are about 44px high.

## Open items

1. Replace the sample reviews and made-up availability with real data before launch.
2. Sadie, Kai, and Brooke have two portfolio photos each (free stock for the prototype); add more, and real headshots for their avatars, before launch.
3. After the first round of lo-fi testing, decide which of the warm visual styling to keep.
