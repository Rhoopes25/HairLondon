# Local Locks

A mobile-first, responsive (phone to desktop) hair stylist booking prototype for IS 551. See a stylist's real work and reviews, then book a time that fits your day. It is an **early prototype**: the stylists and reviews are samples, nothing is sent, and your appointments live only in your browser.

**Live:** `https://rhoopes25.github.io/HairLondon/` (once GitHub Pages is enabled; see `docs/deployment.md`)

## Run it

Needs Node 20 or newer.

```
npm install
npm run dev          # http://localhost:5173
npm test             # unit, integration, and accessibility tests
npm run lint
npm run build:pages  # the GitHub Pages build
npm run layout       # screenshots and layout checks at 4 widths (after `npm run build`)
```

## Where things are

| Path | What |
| --- | --- |
| `app/` | The React frontend: `ui/` (design library), `features/` (screens), `shell/` (routes, layouts), `services/` |
| `src/` | Pure TypeScript with no React or DOM: domain rules (scheduling, pricing, formatting) and the data layer |
| `local-locks-design-system/` | The design system spec; `tokens.json` is the source of truth for the look |
| `docs/` | `refactor-plan.md` (architecture and what was built), `usability-audit.md`, `deployment.md`, `submission-notes.md` |
| `CLAUDE.md` | Rules for working in this repo, for people and for Claude Code |

The sections below are the team's discovery write-up and design justification, written by the whole group on the static HTML version. The app has since been rebuilt in React and TypeScript with every teammate's changes carried over (the Local Locks name, the Book search page, starting prices, the stylist cards, the appointments page, the new portfolio photos). Where the write-up names a screen or a button, it has been updated to match what is in the app today. The full screen list is in `docs/submission-notes.md`.

---

## 1. Need, Persona, Capability, Value

Need: People looking for a new stylist often don't trust someone they haven't used before to cut or color their hair well, and can't easily find someone trustworthy with availability that fits their schedule, so they put off getting it done, leaving their hair to go too long without any treatment.

Persona: Mom of 3 young kids, juggling school drop-offs/pickups for the older ones. Youngest isn't in school yet, so she only gets a window to think about this during nap time. Won't book with someone she does not trust.

Capability: Compare local stylists, view a stylist's portfolio and reviews, then book an available time slot that works for her.

Fundamental Value: Calm. She can book without the usual anxiety of gambling on a stylist she's never seen work, freeing up the small window of time she has to actually think about herself instead of worrying.

## 2. The Screens

Home: Its job is to show what the site is for right away: a photo of a stylist holding her shears on top, then the name "Local Locks," a short line ("Local stylists you can trust."), and two buttons underneath on a plain background: "Book Now" and "Explore Stylists." The text sits below the photo instead of on top of it so nothing clashes. The only other element is the top nav. This answers the question: can someone tell what this is for in one glance, before reading anything?

Book (search): Its job is to get her from "I need a haircut" to a stylist who can actually fit her in. Step 1 is picking what she needs (as many services as she likes, and the time adds up). Day and time of day are optional and visually quieter. Step 2 is the results: each stylist card shows their rating, a few photos of their work with a "See all work" tile, the starting price for what she picked, and their next three open times as chips she can tap to start booking with that time already held. If nobody fits the day or time she chose, a calm notice says so and shows the soonest times they do have. This answers the question: can she find someone trustworthy with a time that works, fast?

Stylists: Its job is to let her browse. Every stylist is one card with her rating, her work, her starting price, and her next open times, then "View profile." This answers the question: can she meet the people behind the work before choosing?

Stylist profile: Its job is to build trust before she books. It opens on the Portfolio tab with real photos of the stylist's work, with Services and Reviews one tap away. A "Book with London" bar stays pinned to the bottom, says what she has picked so far, and is the one Book action on the screen. This answers the question: does this screen actually build trust before she books?

Booking: Its job is to let her pick services, a day, and a time, then confirm. It's a few short steps: choose (services, day, time, with a progress bar and an estimated total), your details (just name and phone), a check-and-confirm step, and a "You're booked" confirmation with an Add to calendar button. Anything she already picked on the Book or profile screen comes in filled out, including a time she tapped. This answers the question: is booking quick and clear once she's ready?

Appointments: Its job is to let her see, move, or cancel what she booked, and review it afterward. Each visit shows the studio, date and time, services, contact, and estimated total.

## 3. Low-Fidelity Approach

Per Prof. Twyman, low fidelity doesn't mean no styling. It means a visual hierarchy so stark that every tester naturally takes the same happy path, plus telling testers up front that this is just a prototype.

- **Prototype notice.** The first time someone opens the app, a modal says this is just a prototype, it isn't supposed to look polished, we're testing the idea and not the visual design, lists what is pretend, and asks them to try booking an appointment (that is the goal they are given). It has a "Got it" button, closes with Escape, and can be reopened from the "Early prototype" strip on every screen and from the footer. (On the static site this was a dark bar on the first screen only; the course requires telling users in plain English, and a modal does that more reliably.)
- **One loud action per screen.** Home: "Book Now." Book: numbered Step 1 and Step 2, with the open times as chips on every card. Profile: the pinned "Book with London" bar (it replaced three smaller Book buttons). Booking: a pinned Continue, then Confirm booking.
- **Nothing ancillary.** Social media icons and other links that weren't part of the core value were removed.

## 4. Feedback Questions & Predictions

Need: "What did you do the last time you needed a haircut or recoloring?"
Prediction: She'll say nothing worked with her timeline, so she gave up and started wearing her hair in a bun more. This tests whether the open-time buttons on the Stylists screen and the day/time picker on Book actually let her find and grab a workable time quickly.

Value: "If you walked into an appointment already trusting the stylist, what's the one word for how that would feel?"
Prediction: "Calm." This tests whether the portfolio photos and reviews on the stylist profile build that trust, and whether the site's calm color palette reinforces the feeling.

Persona: "When during your day would you actually have a few free minutes to look something like this up?"
Prediction: Nap time, or sometime after the kids are in bed. This tests whether the site is simple and clear enough for her to move through it quickly and stress-free in a short window.

Capability (5-second test): "I'm going to show you this for five seconds, then hide it. What do you think this is for?"
Prediction: "I think this is a site where you can find a stylist and book a haircut." This tests whether the photo of the woman with scissors, the name, the short tagline, and the "Book Now" and "Explore Stylists" buttons communicate the site's purpose instantly.

## 5. Design Justification and First Read

Opening the live site fresh:

Does the landing screen signal the primary capability and fundamental value at first glance, before reading?
Yes. The photo, the name, the short tagline, and the "Book Now" and "Explore Stylists" buttons are the main content on the screen.

Does every element on the landing screen earn its place, or does anything compete with the primary job?
No, nothing competes. The social media icons were removed, so the only other things on the screen are the top nav (Home, Book, Stylists, Appointments, Saved) and the quiet footer.

What information and actions belong together on each screen, and which Gestalt grouping principle communicates that?
On the Book and Stylists screens, each stylist's info, photos, price, and open times live inside one card, which is common region, so it's clear which times belong to which stylist. The filter chips in each group share the same pill style, which is similarity.

On the profile, the photo grid uses proximity, the photos sit close together so they read as one connected portfolio. The reviews live inside their own bordered card, which is common region.

On the booking screen, the service, day, and time sections are separated using proximity and spacing, so each decision stays distinct from the others. Within each section, the individual options (each service row, each day chip, each time slot) share the same visual style, that's similarity, showing they're all the same type of choice within that group.

Do the screens stay on mission, and can you return to the landing screen from everywhere?
Yes. Book helps her find someone who can fit her in, Stylists lets her browse, the profile builds trust, and booking handles the actual appointment, so nothing drifts into unrelated content. You can return to the landing screen from every screen: the scissors logo and the Home link are in the top nav on every page, and the booking header has the scissors logo too (it asks before leaving if she's picked anything). The confirmation screen also has a "Back to home" link.

What did the AI initially get wrong, skip, or oversimplify, and what did you change?
The first version of the site relied on a small home link in the header text for navigation, but it wasn't obvious. I pointed this out, and we added a top nav visible on every screen, so navigating between screens is easy and clear.

## 6. Design Library

All the components (prototype notice, nav, hero, filter chips, stylist card, profile header, book bar, service rows, day and time picker, confirm bar, details form, confirmation, buttons) are documented with previews in [`local-locks-design-system/`](local-locks-design-system/README.md), and built as React components in `app/ui`. Colors, type, spacing, and radii come from `tokens.json`, which generates `app/ui/tokens/tokens.css`, and the same pieces are reused across screens (the day chip on Book and in booking, the stylist card on Book, Stylists, and Saved, the avatar and rating line on cards, profiles, and the booking header, the recap card on details, review, and confirmation). Every component is on one page at `/#/design-library`.

## Files

- `app/ui/` The design library: one folder per component, each with its styles
- `app/features/` One folder per screen group: `home`, `book-search` (Book), `stylists`, `stylist-profile`, `booking`, `appointments`, `saved`, `help`, `prototype-notice`, `scheduling`
- `app/shell/routes.tsx` Every route, one lazy import per screen
- `src/data/seed/` Stylists, services, prices, and reviews (the old `data.js`)
- `src/domain/` Scheduling, sample availability, pricing, and formatting (the old shared helpers)
- `app/public/images/` The photos, generated at three sizes from `assets/originals/`
