# Submission notes (draft)

A starting point for the submission comment. Edit it, check every claim against the live site, and replace the placeholders. **Do not submit anything you have not verified on the public URL.**

## What came from the teammates

The team built the first version as static pages on `main` while the React rebuild happened on a branch. Everything they added was carried into the React app: the **Local Locks** name; the photo-on-top Home with "Book Now" and "Explore Stylists"; the **Book** page (services, optional day and time, numbered steps, results with next open times, a "no exact matches" notice, Clear filters); starting prices shown as "$65+"; durations that add up across services; stylist cards with work thumbnails and a "See all work" tile; the one pinned Book bar on a profile; booking that arrives with services and a time already held, shows a progress bar, and says when a chosen time stops fitting; the Appointments page (studio, date and time, services, contact, estimated total, cancel); the portfolio photos for Sadie, Kai, and Brooke; sample availability (10% of half-hours taken, open 9 AM to 7 PM); and the prototype notice wording. The design-system documentation they wrote is in `local-locks-design-system/`.

## Public link

`https://rhoopes25.github.io/HairLondon/` (placeholder until Pages is enabled and the first deploy has finished)

Before submitting: open it in a private window and on a phone, and open a deep link such as `.../HairLondon/#/stylists/london` in a fresh tab. Details in `docs/deployment.md`.

## The goal a new user is given

On first load a plain-English notice says this is just an early prototype, that it isn't supposed to look polished, lists what is pretend, and states the goal: **find a stylist whose work you trust, then book a time that fits your day.** It can be dismissed with a button, the X, or Escape, and reopened any time from the "Early prototype" strip or the footer.

## How the prototype emphasizes the core features and avoids tangents

*(Edit this to match what your discovery research actually found.)*

Our discovery research found that the person we are designing for will not book a stylist she does not already trust, and that she has only short, interrupted windows to do it. So the prototype is built around three things, in this order: **seeing the work, reading what clients say, and booking a time that fits.**

- **Seeing the work.** The home screen leads with a real photo, the name, who it is for (women, men, and kids), and two large actions, "Book Now" (filled) and "Explore Stylists". A stylist's profile opens on her portfolio, and any photo opens larger with next and previous.
- **Reading what clients say.** Ratings appear on every stylist card, and the Reviews tab is one tap from the profile. After a visit a client can add a review, which then appears on that stylist's profile, so the trust loop is real.
- **Booking a time that fits.** The Book page comes in two parts so there is one decision at a time: first what she needs and (optionally) when, then the stylists who can fit her in, under a summary of her picks with an Edit link. Three icon steps at the top say how it works. Inside a booking, icon steps show how far along she is (Pick a time, Your details, Review, Booked), and the recap rows carry icons so they can be scanned at a glance.
- **Knowing who she's sitting down with.** Each profile has an About me tab: a few lines in the stylist's own voice, years doing hair, specialties, days and hours, and a simple map with a Get directions link.

What we left out on purpose, and why:

- No "spots left", countdown timers, discount badges, or sort-by-price. They add pressure, and the value we are designing for is **calm**.
- No messaging, gift cards, memberships, or product shopping. None of them helps someone decide whether to trust a stylist.
- Accounts are in, but only as far as they save time: a pretend sign-in (no password, kept on the device) fills in her name and phone when she books, and shows her next visit on Home. Being a guest is always one tap away, so it never blocks booking.
- Search and "Use my location" are on the Stylists page only, because a busy mom needs someone she can actually get to. Location is optional, stays on the device, and when a tester is far from Utah County the prototype says so and measures from a sample spot in Provo instead.
- The Stylists page no longer shows open times. It is for browsing and trust; finding a time is the Book page's job, so each page has one loud thing.
- Supporting screens (My appointments, Saved, Help) exist only to make the core usable and recoverable: change or cancel a booking, come back to a stylist, understand what happens next.

## Screens

The rubric asks for roughly 20 to 30+ screens, and overlays count. Counted from the running app:

| Kind | Screens | Count |
| --- | --- | --- |
| Pages | Home (signed out, and signed in with your next visit); Book part 1 (what and when); Book part 2 (who can fit you in); Stylists (with search and location); Profile (Portfolio, Services, Reviews, About me tabs); Photo viewer; About the studio; Booking (choose, details, review, confirmation); My appointments; Appointment detail; Reschedule; Leave a review; Saved stylists; Account (signed out); Your account (signed in); Sign in; Create an account; How booking works; Not found | 26 |
| Overlays | Early-prototype notice; Service detail sheet; Leave-booking confirmation; Calendar file saved; Cancel confirmation; Sign-in sheet (during booking); Create-account sheet (during booking); Sign-out confirmation | 8 |
| Empty states | Nobody offers that combination; No exact matches (with other times); No upcoming appointments; Nobody saved yet; No openings that day; No stylists match the search; Couldn't get your location | 7 |

That is **34 distinct screens, or 41 counting empty states**. The hidden design-library page (`/#/design-library`) is not counted.

## Desktop and mobile

The design is mobile first, since the person we are designing for is on her phone at nap time, and it is responsive up to a full website: on a laptop or monitor the same screens become a full-width layout with a wide header, a split home screen, grids of stylists and photos, and a two-column booking screen with a summary that stays in view. Nothing about the flow changes between sizes.

## Design library and reuse

The design library is the design system in `local-locks-design-system/`, implemented as 27 families of React components in `app/ui` (buttons, tabs, slot picker, modal, and so on) with design tokens generated from `tokens.json` (a test fails if the two drift apart). Every screen is assembled from them: for example the same day-and-time picker serves booking and rescheduling, the same recap serves details, review, confirmation, and the account page, the same icon step guide explains the Book page and tracks progress inside a booking, and the same map card is on the About me tab and the About the studio page. All components are on one page at `/#/design-library` for anyone who wants to see them together.

## Non-linear, goal-driven

There is no single path. Booking can start from Home ("Book Now"), a time chip on the Book page, a profile's Book bar, a service row, a portfolio photo, the About page, "Book again" right on a past visit in My appointments, or the past visit itself. Sign-in is reachable from Home, Saved, the footer, and the booking details step, and is always skippable. Every top-level place is one tap from every screen, and nothing forces onboarding.

## What is fully functional, and what is not

Functional: browsing, typo-friendly search, sorting by distance, filtering, saving, signing in and out, booking (with availability that updates when you book, move, or cancel), changing and cancelling appointments, leaving reviews, calendar export. Data lives in the browser, so it survives a reload on the same device.

Pretend (and the screens say so): the stylists, reviews, and studio addresses are samples, accounts have no password and never leave the device, no text message is sent, and there is no payment. These need a backend that cannot reasonably be built for a prototype.


## Round 2: revisions from the Vagaro user tests

Branch `revisions-round-2`. No screens were added or removed (the inventory above is unchanged); these are changes inside existing screens.

| Finding | What changed |
| --- | --- |
| Trust: too few reviews | Every stylist card shows stars, the average, and the count, plus a "Read reviews" link to the full list. Reviews moved up to the second tab on a profile, with a "Read reviews" link under her name. Each stylist has 50+ sample reviews (mostly 4 and 5 stars, a few 3s, names as first name and last initial, dated over two years), shown a page at a time. |
| Trust: thin galleries | Every stylist has at least six photos, each captioned with the hair and the service. Photos that are not really hers are marked `placeholder: true` in the seed. |
| Quickness: back and forth | "Quick look" on each Stylists card opens her years of experience and specialties in place. Her photos and rating are already on the card, so the preview does not repeat them. |
| Quickness: finding Book | A large Book Now leads Home and sits at the top of the other main pages. Text is larger on Home and the stylist pages. |
| Quickness: comparing | Distance on every card, sort by nearest or price, and filters for price, distance, and specialty. |
| Calm: small Book-page text | Larger helper text, headings, "optional" labels, chips, and day and time buttons (all at least 48px tall). |
| Calm: surprise totals | A running price and time while she picks services, the total repeated above Confirm, and a gentle notice over four hours. |
| Team: not for everyone | Men's haircut, beard trim, and kids' cut; two barbers; men's and kids' cut photos in some galleries; Home says it is for everyone. |
