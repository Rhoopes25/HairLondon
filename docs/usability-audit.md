# Usability audit (Phase 6)

What was checked, what was found, what was fixed, and what has **not** been checked. Read the last section before submitting.

## How this was checked

| Method | Coverage | Where |
| --- | --- | --- |
| Automated accessibility (axe-core) | 16 screens, the 4 booking steps, 5 overlays. Zero violations | `app/shell/app.a11y.test.tsx` |
| Color contrast against the real tokens | Every text pair the components use, at WCAG AA (4.5:1), plus 3:1 for icons and stars | `scripts/contrast.test.ts` |
| Integration tests of the real routes | Every flow and screen in the inventory, including each legacy booking rule | `app/shell/app.*.test.tsx` |
| Real Chrome, via DOM measurement | Console errors, horizontal overflow at 360px, tap-target heights, one `h1` per screen, broken images, a complete booking, and persistence across a reload | manual run during Phase 6 |
| Header fit | Navigation fits at 360px and at 320px | manual run |

The principles below are the ones the project's own documents name (signifiers, Gestalt grouping, conventions, guiding attention) plus Nielsen's ten heuristics. **The exact list taught in IS 551 was not available to this audit**, so check this table against your class notes and add anything that is missing.

## Principle by principle

| Principle | How the app applies it | Where |
| --- | --- | --- |
| **Entry screen signifies the overarching capability** | The first and biggest thing on Home is the photo, the name, one line saying what it is for ("See real client work and reviews, then book a time that fits your day"), and a single "Find a stylist" button. Service shortcuts are smaller and below. "Already booked?" is quieter still | `features/home`, `ui/Hero` |
| **Signifiers and affordances** | Real buttons and links with visible shape (pills, bordered cards, chevrons on rows). Chosen states are exposed with `aria-pressed`/`aria-selected`/`aria-current` and drawn (fill, check, underline), never color alone. Unavailable times are disabled **and** struck through | `ui/*` |
| **Conventions, external** | Standard patterns people already know: tabs for profile sections, a day strip then a time grid, checkbox services, a sticky top nav with the current page marked, hearts to save, star ratings, a confirm-before-commit review step, `.ics` calendar export | throughout |
| **Conventions, internal** | One button style per role (filled = primary, outline = secondary, underlined text = quiet). Labels match titles (Appointments opens "My appointments"). The same day-and-time picker is used for booking and rescheduling. The same Recap for details, review, and confirmation | `ui/Button`, `ui/SlotPicker`, `ui/Recap` |
| **Guiding attention** | One primary action per screen. Booking removes the main navigation (focus layout) so attention stays on the task. The confirm bar is the only filled panel on its step, and Continue stays disabled-looking until the choices are complete. Focus moves to the new step's heading | `shell/layout`, `features/booking` |
| **Grouping (Gestalt)** | Proximity: each decision (services, day, time) has its own heading and spacing. Common region: reviews and recaps sit in bordered cards. Similarity: every service row, day chip, and time slot in a group looks alike | `ui/Layout`, `ui/Reviews`, `ui/Recap` |
| **Visibility of system status** | The summary and total update as you choose, with "You'll be done by...". A "Calendar file saved" sheet confirms a download. Saving a stylist changes the button to "Saved". The "Early prototype" strip is on every screen | `features/booking`, `features/appointments`, `features/prototype-notice` |
| **Error prevention** | Continue is disabled until a service, day, and time exist. Times a visit cannot fit are disabled. A chosen time is dropped if a longer service no longer fits it. A separate review step comes before anything is booked. Cancelling asks first. Leaving a started booking asks first. A booked slot becomes unavailable to the next booking | `src/domain/booking`, `ui/Modal` |
| **Error recovery** | Form errors say what is wrong in plain words ("Enter your name so London knows who's coming"), appear next to the field, are announced (`role="alert"`), and focus goes to the first bad field. Every dead end offers a way back (404, missing appointment, no results) | `ui/TextField`, `shell/pages` |
| **Recognition over recall** | The booking summary stays visible. Recaps repeat the choices at each step. Services show duration and price in the list, so no one has to remember or tap to find out | `ui/ServiceOption`, `ui/Recap` |
| **User control and non-linearity** | Booking can start from Home shortcuts, the stylist list, a stylist's Services tab (service preselected), a portfolio photo, the About page, or Book again on a past visit. Every top-level place is one tap from every screen. No onboarding is forced: the notice is dismissible with a button, the X, or Escape | `shell/layout`, `features/*` |
| **Flexibility** | Filter by service or by the day she works, both in the URL so they can be shared and survive refresh. Reschedule and cancel from the appointment | `features/stylists`, `features/appointments` |
| **Minimalism, and staying on the core** | The core is portfolio, reviews, and booking. Everything else is support for those: appointments (change/cancel/review, which closes the trust loop), saved stylists, help. No marketplace pressure (no "spots left", countdowns, deals) | see `docs/submission-notes.md` |
| **Accessibility** | Landmarks, one `h1` per screen, labelled fields, focus ring, focus trapped in overlays and returned on close, 44px tap targets, reduced-motion respected, page titles per screen | `ui/*`, `shell/layout` |

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

## Not checked: be honest about these when you submit

1. **No human tested it.** Nothing here replaces the five-second test and the nap-time walkthrough from your README. Do them with at least three people, and note the results.
2. **No screenshot review.** The browser tool could not capture the screen in this environment, so the visual design (spacing, hierarchy, how the photos crop) was verified by measurement and by tests, **not by eye**. Open every screen on a phone and look.
3. **No screen reader pass** (VoiceOver, TalkBack, NVDA). axe catches a lot but not everything, such as whether the reading order makes sense.
4. **It may read as high-fidelity.** By team decision there is no rough-looking theme. The notice and the label carry the "early prototype" message. If graders say it looks finished, see `docs/refactor-plan.md` section 3.6 for the cheap fix.
5. **Real devices** (iOS Safari especially, for `localStorage` in private mode and the `.ics` download).
6. **Sample data.** Most stylists and every review are invented, and the one sample past visit is stored on first load. The notice says so; keep it that way.
7. **Google Fonts** loads from the network, so offline the app falls back to system serif and sans fonts.
