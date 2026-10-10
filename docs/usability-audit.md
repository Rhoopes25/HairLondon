# Usability audit (Phase 6)

What was checked, what was found, what was fixed, and what has **not** been checked. Read the last section before submitting.

## How this was checked

| Method | Coverage | Where |
| --- | --- | --- |
| Automated accessibility (axe-core) | 19 screens (including Book and its no-match state, and a held-time booking), the booking steps, and the overlays. Zero violations | `app/shell/app.a11y.test.tsx` |
| Color contrast against the real tokens | Every text pair the components use, at WCAG AA (4.5:1), plus 3:1 for icons and stars | `scripts/contrast.test.ts` |
| Integration tests of the real routes | Every flow and screen in the inventory, including each legacy booking rule | `app/shell/app.*.test.tsx` |
| Real Chrome, via DOM measurement | Console errors, horizontal overflow at 360px, tap-target heights, one `h1` per screen, broken images, a complete booking, and persistence across a reload | manual run during Phase 6 |
| Header fit | Navigation fits at 360px and at 320px | manual run |

## The eight class principles

The rubric lists the principles taught in class: **Signify Capability, Easy Wayfinding, Guide Attention, Follow Convention, Timely Feedback, Recognition Not Recall, Useful Aesthetics, No Dead Ends.** After the teammates' changes were merged into the React app, every screen was reviewed once per principle, in that order. Each row says how the app applies it, then what that pass found and fixed.

### 1. Signify Capability

- **Home** leads with the photo, the name "Local Locks", one line ("Local stylists you can trust."), and two filled buttons: **Book Now** and **Explore Stylists**. Nothing else on the screen competes. Appointments and Saved are only in the nav, as small text links, so they read as secondary.
- **Other first entries** (a shared link to Book, Stylists, or a profile): the first-visit modal states the goal on whatever screen she lands on, the "Early prototype" strip is on every screen, and each page opens with a plain title and one sentence on what it is for ("Pick what you want done and when. We'll show who can fit you in.").
- **Things that can be tapped look tappable:** time chips are pills with the time on them, the third photo on a card is a darker "See all work →" tile, the profile has one pinned Book bar.
- *Found and fixed:* "Find a stylist" buttons on the empty Appointments list, Saved, Help, and the 404 page still pointed at the browse list although Home now promotes **Book**. They go to the Book page.

### 2. Easy Wayfinding

- A persistent nav (Home, Book, Stylists, Appointments, Saved) on every screen except booking, with the current place marked by an underline and `aria-current`. The logo always goes home. It fits at 360px.
- Back links say where they go: "Back to your search" (returns to the exact filters), "Back to saved stylists", "Back to stylists", "Back to appointment". The X and the logo in the booking header ask before leaving once she has chosen something, then go back to where she came from (`?back=`, limited to paths inside the app).
- Every screen sets its browser tab title; booking steps move focus to the new heading.
- *Found and fixed:* a profile opened from Saved said "Back to stylists" while going to Saved.

### 3. Guide Attention

- **One loud thing per screen.** Home: Book Now. Book: step 1 is numbered and filled; day and time are marked "optional" and smaller; step 2 is numbered. Profile: the pinned Book bar replaced three smaller Book buttons. Booking: Continue, disabled until services, a day, and a time exist, with a progress bar above it (Pick your services, Add your day, Choose a time, Ready to continue).
- Booking removes the main navigation so attention stays on the task.
- No pressure devices: no "spots left", countdowns, deals, or sort-by-price.
- *Checked:* the filled gold buttons appear only where an action should be taken; chips, cards, and links use quieter outlines.

### 4. Follow Convention

- **External:** tabs for profile sections, a day strip then a time grid, filter chips, checkbox services with a price on the right, star ratings, a heart to save, a sticky bottom action bar, a back arrow, `.ics` calendar export, a first-visit modal.
- **Internal:** the same StylistCard on Book, Stylists, and Saved; the same day-and-time picker for booking and rescheduling; the same Recap for details, review, and confirmation; one button style per role; labels match titles; **prices are starting prices, always with a plus ("$65+"), and every total says "Estimated total"**.
- *Found and fixed:* the booking recap, the confirmation, and the appointment page each labeled the total differently ("Total", "$65 · 1 hr"). They now all read "Estimated total" with `$65+, about 1 hr`.

### 5. Timely Feedback

- On Book, the result count updates as filters change (`aria-live`: "3 stylists can fit you in"), and the filters are in the URL, so refresh and Back keep them.
- In booking, the summary, the estimated total, "You'll be done by about 11:00 AM", and the progress bar change on every choice. If a longer service means a chosen time no longer fits, she is told ("9:00 AM doesn't leave enough time for everything you picked. Choose another time.") instead of the time quietly disappearing.
- A booked time stops being offered immediately (on Book, on the cards, and in booking), and comes back if the visit is cancelled. Saving a stylist changes the heart to "Saved". Downloading a calendar file opens a "Calendar file saved" sheet. Cancelling moves the visit to a "Cancelled" section.
- *Checked in the browser:* held-time bookings arrive with the day and time already chosen and Continue enabled.

### 6. Recognition Not Recall

- The Book bar on a profile says what her booking will start with ("Haircut + Color · $185+ · about 3 hr", and the time held if she tapped one). In booking, services she arrived with show as one line ("Change" opens the list), and the header always says who she is booking with.
- Filters stay visible as pressed chips with a "Clear filters (2)" count. The recap repeats her choices at every step. Services show duration and starting price in the list, so nobody has to remember or tap to find out.
- Each time chip's accessible name carries everything it needs: "Book Sadie Morgan, Thu, Oct 8 at 1:00 PM".

### 7. Useful Aesthetics

- Real photos of real work lead every screen that asks for trust (home, cards, portfolio), and the palette and type come from one token file. The look is calm on purpose: cream, gold, a serif for names, generous space.
- Decoration is limited to what carries meaning: the avatar, the stars, the photo tiles. No pressure badges.
- All text pairs pass contrast at WCAG AA against the real tokens (`scripts/contrast.test.ts`).
- *Accepted risk:* it does not look rough. By team decision the "early prototype" message is carried by the notice modal and the label, not a rough theme (`docs/refactor-plan.md` section 3.6).

### 8. No Dead Ends

| Where she might get stuck | What she sees |
| --- | --- |
| Nobody has an opening on the day or time she chose | A calm notice, "Other times", and the soonest times they do have |
| Nobody offers the services together | "Try removing one service", and Clear filters is right above |
| No upcoming appointments | "Find a stylist", which opens Book |
| Nobody saved yet | "Find a stylist", which opens Book |
| A page or an appointment that does not exist | Three ways back in (Book, Home, My appointments) |
| A screen that fails to load | A message and "Back to home" |
| A stylist with no photos | The profile opens on Reviews, and the Portfolio tab says so |
| A past or cancelled appointment | "Book again" or "Book a new time" with the services chosen |
| Typing a booking step's address directly | Sent back to the step that comes first |
| The confirmation | View appointment, Add to calendar, Back to home, Browse more stylists |

*Found and fixed:* see principle 1 (empty-state buttons went to the browse list rather than Book).

## Also applied

| Principle | How the app applies it | Where |
| --- | --- | --- |
| **Error prevention** | Continue is disabled until a service, day, and time exist. Times a visit cannot fit are disabled and struck through. A separate review step comes before anything is booked. Cancelling and leaving a started booking ask first. A booked slot becomes unavailable to the next booking | `src/domain/booking`, `ui/Modal` |
| **Error recovery** | Form errors say what is wrong in plain words ("Enter your name so London knows who's coming"), appear next to the field, are announced, and focus goes to the first bad field | `ui/TextField` |
| **Non-linearity** | Booking can start from Home, a time chip on Book or Stylists, a profile's Book bar, a service row, a portfolio photo, the About page, or "Book again". Every top-level place is one tap from every screen. The notice can be dismissed with a button, the X, or Escape | `shell/layout`, `features/*` |
| **Minimalism** | The core is portfolio, reviews, and booking. Everything else supports those: appointments (change, cancel, review, which closes the trust loop), saved stylists, help | `docs/submission-notes.md` |
| **Accessibility** | Landmarks, one `h1` per screen, labelled fields, a focus ring, focus trapped in overlays and returned on close, 44px tap targets, reduced motion respected, a named region for the search results | `ui/*`, `shell/layout` |

## Responsive layout (phone to desktop)

The app was a 460px column on every screen. It is now responsive: three breakpoints (`sm` 640, `md` 900, `lg` 1200), a full-width header, footer and prototype strip, a centered 1200px content container, and a desktop composition for each screen (split hero, grids, two-column booking with a sticky summary, side-by-side photo viewer).

After the merge with the teammates' work it was re-run (33 scenarios, 360 / 768 / 1280 / 1920px, no problems). The original run was: `npm run layout` (Playwright, Chromium), which opened 28 scenarios (21 page states, including every booking step, and 7 overlays that need clicking open) at 360, 768, 1280 and 1920px, and again at 320, 639, 640, 899, 900, 1199, 1200 and 2560px (336 screenshots in all). Every combination passes:

- no horizontal scroll;
- every interactive element at least 44px tall at 900px and below (a radio or checkbox inside a label counts as the label; links inside running text are exempt, per WCAG 2.5.8);
- page content no wider than 1200px and centered at 1280px and above.

Also checked by script: the booking summary stays in view under the header while the page scrolls (Continue stayed at the same screen position from scrollY 300 to the end), keyboard order on the two-column booking page follows reading order (services, days, then the panel), the Pages build serves every `srcset` variant under `/HairLondon/`, and the existing axe tests still report zero violations. Screenshots were reviewed by eye for home (360 and 1280px), and, mostly at 1280px, the stylist list, profile, photo viewer, booking, appointment, reschedule, and help, plus booking at 320, 768, 900 and 1920px. After the merge the Book page (including the no-match notice), the stylist list, the profile with a selection, and the held-time booking were looked at at 360, 768, and 1280px. A "before" set from the old code (`npm run layout -- --out=.layout-shots/before`) showed the 460px column with empty space on both sides.

Found and fixed along the way: the stylist name link in the appointment recap was default blue and 20px tall (now `gold-ink`, 44px hit area); the design library image used a `.png` that no longer exists.

Not covered by this check: a real phone or tablet (touch feel, iOS Safari), landscape orientation, browser zoom set from the browser menu (reflow was checked by width, not by zoom), and a human opinion of how it looks. Not every overlay and empty state was looked at by eye at every width; the script proves they render without overflow.

## Findings fixed during this audit

| Finding | How it was found | Fix |
| --- | --- | --- |
| After "Confirm booking" the page bounced back to the start instead of showing the confirmation | End-to-end test | The review step no longer clears the draft; the confirmation screen does, so Back cannot book twice |
| After "Post review" the page bounced to the appointment instead of the stylist's reviews | End-to-end test | The review page ignores its "already reviewed" guard once it has posted |
| The "Early prototype" strip was outside every landmark, on every screen | axe | It is now a labelled `aside` |
| The photo viewer had no page heading | axe | A visually hidden `h1` ("London's work, photo 3 of 6") |
| Quiet links, small buttons, and the strip button were 20 to 41px tall | Real-browser measurement | All are now 44px tall hit areas |
| Four appointment screens left a stale tab title | Real-browser check | Every screen sets its title |
| Nav said "Visits" but the screen said "My appointments" | Writing this audit | Nav now says "Appointments" |
| Form error red was hard-coded in the CSS and missing from the tokens | Porting the stylesheet | Added `danger` to `tokens.json` |
| Photos were 9.3 MB in total (2.7 MB each) | Reviewing page weight | Right-sized to 0.91 MB; originals kept in `assets/originals` |
| The list of services on the booking page never collapsed behind "Change" (CSS `display: flex` beat the `hidden` attribute; jsdom cannot see it) | Looking at the screenshot of a held-time booking | A `[hidden]` rule on the list |
| The stylist's name link on every card measured 24px tall | `npm run layout` | The link's own box is 44px, with a negative margin so the card is no taller |
| Chips in a wrapping row were indented twice (the row's padding plus the section's) | Looking at the Book screenshots | No side padding on a wrapping row |
| "Optional" in a heading read as "Which day?optional" | A test on the heading name | An explicit space before the tag |
| Empty-state buttons and a profile's back link sent people to the wrong place | The eight-principle review (see above) | They go to Book, and the back link names its destination |

## Not checked: be honest about these when you submit

1. **No human tested it.** Nothing here replaces the five-second test and the nap-time walkthrough from your README. Do them with at least three people, and note the results.
2. **Limited screenshot review.** The in-browser tool could not capture the screen, so the original design was verified by measurement. The responsive pass added Playwright screenshots (see above) and the main screens were looked at, but not every screen at every width, and not on a real device. Open every screen on a phone and on a desktop and look.
3. **No screen reader pass** (VoiceOver, TalkBack, NVDA). axe catches a lot but not everything, such as whether the reading order makes sense.
4. **It may read as high-fidelity.** By team decision there is no rough-looking theme. The notice and the label carry the "early prototype" message. If graders say it looks finished, see `docs/refactor-plan.md` section 3.6 for the cheap fix.
5. **Real devices** (iOS Safari especially, for `localStorage` in private mode and the `.ics` download).
6. **Sample data.** Most stylists and every review are invented, and the one sample past visit is stored on first load. The notice says so; keep it that way.
7. **Google Fonts** loads from the network, so offline the app falls back to system serif and sans fonts.
