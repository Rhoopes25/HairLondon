# Submission notes (draft)

A starting point for the submission comment. Edit it, check every claim against the live site, and replace the placeholders. **Do not submit anything you have not verified on the public URL.**

## Public link

`https://rhoopes25.github.io/HairLondon/` (placeholder until Pages is enabled and the first deploy has finished)

Before submitting: open it in a private window and on a phone, and open a deep link such as `.../HairLondon/#/stylists/london` in a fresh tab. Details in `docs/deployment.md`.

## The goal a new user is given

On first load a plain-English notice says this is an early draft, lists what is pretend, and states the goal: **find a stylist whose work you trust, then book a time that fits your day.** It can be dismissed with a button, the X, or Escape, and reopened any time from the "Early prototype" strip or the footer.

## How the prototype emphasizes the core features and avoids tangents

*(Edit this to match what your discovery research actually found.)*

Our discovery research found that the person we are designing for will not book a stylist she does not already trust, and that she has only short, interrupted windows to do it. So the prototype is built around three things, in this order: **seeing the work, reading what clients say, and booking a time that fits.**

- **Seeing the work.** The home screen leads with a real photo and one action, "Find a stylist". A stylist's profile opens on her portfolio, and any photo opens larger with next and previous.
- **Reading what clients say.** Ratings appear on every stylist card, and the Reviews tab is one tap from the profile. After a visit a client can add a review, which then appears on that stylist's profile, so the trust loop is real.
- **Booking a time that fits.** Choosing services, a day, and a time happens on one screen with the running total and finish time in view. A narrow window is respected: you can filter stylists by the day of the week they work.

What we left out on purpose, and why:

- No "spots left", countdown timers, discount badges, or sort-by-price. They add pressure, and the value we are designing for is **calm**.
- No accounts, messaging, gift cards, memberships, or product shopping. None of them helps someone decide whether to trust a stylist.
- Supporting screens (My appointments, Saved, Help) exist only to make the core usable and recoverable: change or cancel a booking, come back to a stylist, understand what happens next.

## Screens

The rubric asks for roughly 20 to 30+ screens, and overlays count. Counted from the running app:

| Kind | Screens | Count |
| --- | --- | --- |
| Pages | Home; Stylists; Profile (Portfolio, Services, Reviews tabs); Photo viewer; About the studio; Booking (choose, details, review, confirmation); My appointments; Appointment detail; Reschedule; Leave a review; Saved stylists; How booking works; Not found | 18 |
| Overlays | Early-prototype notice; Day filter sheet; Service detail sheet; Leave-booking confirmation; Sample reminder text; Calendar file saved; Cancel confirmation | 7 |
| Empty states | No stylists match; No upcoming appointments; Nobody saved yet; No openings that day | 4 |

That is **25 distinct screens, or 29 counting empty states**. The hidden design-library page (`/#/design-library`) is not counted.

## Desktop and mobile

The design is mobile first, since the person we are designing for is on her phone at nap time, and it is responsive up to a full website: on a laptop or monitor the same screens become a full-width layout with a wide header, a split home screen, grids of stylists and photos, and a two-column booking screen with a summary that stays in view. Nothing about the flow changes between sizes.

## Design library and reuse

The design library is the design system in `hair-by-london-design-system/`, implemented as 22 families of React components in `app/ui` (buttons, tabs, slot picker, modal, and so on) with design tokens generated from `tokens.json` (a test fails if the two drift apart). Every screen is assembled from them: for example the same day-and-time picker serves booking and rescheduling, and the same recap serves details, review, and confirmation. All components are on one page at `/#/design-library` for anyone who wants to see them together.

## Non-linear, goal-driven

There is no single path. Booking can start from Home, the stylist list, a service row, a portfolio photo, the About page, or "Book again" on a past visit. Every top-level place is one tap from every screen, and nothing forces onboarding.

## What is fully functional, and what is not

Functional: browsing, filtering, saving, booking (with availability that updates when you book, move, or cancel), changing and cancelling appointments, leaving reviews, calendar export. Data lives in the browser, so it survives a reload on the same device.

Pretend (and the notice says so): the stylists and reviews are samples, no text message is sent, and there is no payment. These need a backend that cannot reasonably be built for a prototype.
