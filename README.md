# Local Locks

Low-fidelity prototype for IS 551. Find a stylist you trust, see their real work, and book a hair appointment in a few minutes.

**Happy path:** Home → Find a stylist → pick a service → tap an open time (or open a stylist's profile and tap Book) → pick a day and time → Continue → name and phone → Confirm booking → You're booked.

## 1. Need, Persona, Capability, Value

Need: People looking for a new stylist often don't trust someone they haven't used before to cut or color their hair well, and can't easily find someone trustworthy with availability that fits their schedule, so they put off getting it done, leaving their hair to go too long without any treatment.

Persona: Mom of 3 young kids, juggling school drop-offs/pickups for the older ones. Youngest isn't in school yet, so she only gets a window to think about this during nap time. Won't book with someone she does not trust.

Capability: Compare local stylists, view a stylist's portfolio and reviews, then book an available time slot that works for her.

Fundamental Value: Calm. She can book without the usual anxiety of gambling on a stylist she's never seen work, freeing up the small window of time she has to actually think about herself instead of worrying.

## 2. The Screens

Home: Its job is to show what the site is for right away: a photo, the name "Local Locks," which says "hair, near me" at a glance, one line saying what it does ("See real work from stylists near you, then book a time that fits your day"), and one "Find a stylist" button. The only other element is a small top nav. This answers the question: can someone tell what this is for in one glance, before reading anything?

Stylists: Its job is to get her from "I need a haircut" to a stylist who can actually fit her in. Step 1 is picking what she needs. Day and time are optional and visually quieter. Step 2 is the results: each stylist card shows their rating, a few photos of their work, the price for what she picked, and their next open times as big filled buttons she can tap to book right away. This answers the question: can she find someone trustworthy with a time that works, fast?

Stylist profile: Its job is to build trust before she books. It opens on the Portfolio tab with real photos of the stylist's work, with Services and Reviews one tap away. A "Book with London" bar stays pinned to the bottom so the next step is always in reach. This answers the question: does this screen actually build trust before she books?

Book: Its job is to let her pick services, a day, and a time, then confirm. It's three short steps on one page: choose (services, day, time), your details (just name and phone), and a "You're booked" confirmation with an Add to calendar button. Anything she already picked on the Stylists screen comes in filled out. This answers the question: is booking quick and clear once she's ready?

## 3. Low-Fidelity Approach

Per Prof. Twyman, low fidelity doesn't mean no styling. It means a visual hierarchy so stark that every tester naturally takes the same happy path, plus telling testers up front that this is just a prototype.

- **Prototype notice.** A dark bar at the top of the first screen a tester lands on says this is just a prototype, it isn't supposed to look polished, we're testing the idea and not the visual design, and asks them to try booking an appointment. It only shows on that first screen (and has a "Got it" button), so it isn't a distraction later on.
- **One loud action per screen.** Home: "Find a stylist." Stylists: numbered Step 1 and Step 2, with the open times as filled buttons. Profile: the pinned "Book with London" bar (it replaced three smaller Book buttons). Book: a pinned Continue, then Confirm booking.
- **Nothing ancillary.** Social media icons and other links that weren't part of the core value were removed.

## 4. Feedback Questions & Predictions

Need: "What did you do the last time you needed a haircut or recoloring?"
Prediction: She'll say nothing worked with her timeline, so she gave up and started wearing her hair in a bun more. This tests whether the open-time buttons on the Stylists screen and the day/time picker on Book actually let her find and grab a workable time quickly.

Value: "If you walked into an appointment already trusting the stylist, what's the one word for how that would feel?"
Prediction: "Calm." This tests whether the portfolio photos and reviews on the stylist profile build that trust, and whether the site's calm color palette reinforces the feeling.

Persona: "When during your day would you actually have a few free minutes to look something like this up?"
Prediction: Nap time, or sometime after the kids are in bed. This tests whether the site is simple and clear enough for her to move through it quickly and stress-free in a short window.

Capability (5-second test): "I'm going to show you this for five seconds, then hide it. What do you think this is for?"
Prediction: "I think this is a site where you can find a stylist and book a haircut." This tests whether the photo of the woman with scissors, the name, the one-line tagline, and the "Find a stylist" button communicate the site's purpose instantly.

## 5. Design Justification and First Read

Opening the live site fresh:

Does the landing screen signal the primary capability and fundamental value at first glance, before reading?
Yes. The photo, the name, the one-line tagline, and the "Find a stylist" button are the main content on the screen.

Does every element on the landing screen earn its place, or does anything compete with the primary job?
No, nothing competes. The social media icons were removed, so the only other thing on the screen is a small nav with Home and Stylists.

What information and actions belong together on each screen, and which Gestalt grouping principle communicates that?
On the Stylists screen, each stylist's info, photos, price, and open times live inside one card, which is common region, so it's clear which times belong to which stylist. The filter chips in each group share the same pill style, which is similarity.

On the profile, the photo grid uses proximity, the photos sit close together so they read as one connected portfolio. The reviews live inside their own bordered card, which is common region.

On the Book screen, the service, day, and time sections are separated using proximity and spacing, so each decision stays distinct from the others. Within each section, the individual options (each service row, each day chip, each time slot) share the same visual style, that's similarity, showing they're all the same type of choice within that group.

Do the screens stay on mission, and can you return to the landing screen from everywhere?
Yes. Stylists helps her find someone who can fit her in, the profile builds trust, and Book handles the actual appointment, so nothing drifts into unrelated content. You can return to the landing screen from every screen: the scissors logo and the Home link are in the top nav on Home, Stylists, and profiles, and the booking header has the scissors logo too (it asks before leaving if she's picked anything). The confirmation screen also has a "Back to home" link.

What did the AI initially get wrong, skip, or oversimplify, and what did you change?
The first version of the site relied on a small home link in the header text for navigation, but it wasn't obvious. I pointed this out, and we added a top nav visible on every screen, so navigating between screens is easy and clear.

## 6. Design Library

All the components (prototype notice, nav, hero, filter chips, stylist card, profile header, book bar, service rows, day and time picker, confirm bar, details form, confirmation, buttons) are documented with previews in [`local-locks-design-system/`](local-locks-design-system/README.md). Colors, type, spacing, and radii come from the tokens at the top of `style.css`, and the same pieces are reused across screens (the day chip on Stylists and Book, the avatar and rating line on cards, profiles, and the booking header, the recap card on details and confirmation).

## Files

- `index.html` Home
- `stylists.html` Find a stylist (filters and results)
- `stylist.html` Stylist profile (`?id=london`)
- `booking.html` Book (choose, details, done)
- `data.js` Stylists, services, prices, sample availability, shared helpers
- `prototype-notice.js` The first-screen prototype notice
- `style.css` All styles and design tokens
- `portfolio.html`, `services.html` Redirects so old links still work
