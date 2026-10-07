# Hair by London

A mobile-first hair stylist booking prototype for IS 551. See a stylist's real work and reviews, then book a time that fits your day. It is an **early prototype**: the stylists and reviews are samples, nothing is sent, and your appointments live only in your browser.

**Live:** `https://rhoopes25.github.io/HairLondon/` (once GitHub Pages is enabled; see `docs/deployment.md`)

## Run it

Needs Node 20 or newer.

```
npm install
npm run dev          # http://localhost:5173
npm test             # unit, integration, and accessibility tests
npm run lint
npm run build:pages  # the GitHub Pages build
```

## Where things are

| Path | What |
| --- | --- |
| `app/` | The React frontend: `ui/` (design library), `features/` (screens), `shell/` (routes, layouts), `services/` |
| `src/` | Pure TypeScript with no React or DOM: domain rules (scheduling, pricing, formatting) and the data layer |
| `hair-by-london-design-system/` | The design system spec; `tokens.json` is the source of truth for the look |
| `docs/` | `refactor-plan.md` (architecture and what was built), `usability-audit.md`, `deployment.md`, `submission-notes.md` |
| `CLAUDE.md` | Rules for working in this repo, for people and for Claude Code |

The sections below are the original discovery write-up. They describe the first three-screen concept (Home, Work, Book); the app has since grown to more screens, listed in `docs/submission-notes.md`.

---

## 1. Need, Persona, Capability, Value

Need: People looking for a new stylist often don't trust someone they haven't used before to cut or color their hair well, and can't easily find someone trustworthy with availability that fits their schedule, so they put off getting it done, leaving their hair to go too long without any treatment.

Persona: Mom of 3 young kids, juggling school drop-offs/pickups for the older ones. Youngest isn't in school yet, so she only gets a window to think about this during nap time. Won't book with someone she does not trust.

Capability: View a stylist's portfolio and reviews, then book an available time slot that works for her.

Fundamental Value: Calm. She can book without the usual anxiety of gambling on a stylist she's never seen work, freeing up the small window of time she has to actually think about herself instead of worrying.
## 2. The Three Screens

Home: Its job is to show what the site is for right away: a photo, the name "Hair by London," and one "Book Now" button. The only other element on the screen, the top nav bar, is small and secondary, so it doesn't compete with that main message. This answers the question: can someone tell what this is for in one glance, before reading anything?

Work: Its job is to let her see real photos of the stylist's work and read reviews before booking. This earned its spot because the whole idea behind the site is trust: she won't book with someone she doesn't already trust, and this screen is what builds that trust. This answers the question: does this screen actually build trust before she books?

Book: Its job is to let her pick a service, day, and time and confirm the appointment. This earned its spot because it's here to show that booking an appointment is simple and easy. This answers the question: is booking quick and clear once she's ready?
## 3. Feedback Questions & Predictions

Need: "What did you do the last time you needed a haircut or recoloring?"
Prediction: She'll say nothing worked with her timeline, so she gave up and started wearing her hair in a bun more. This tests whether the Book screen's day/time picker actually lets her find and grab a workable time quickly.

Value: "If you walked into an appointment already trusting the stylist, what's the one word for how that would feel?"
Prediction: "Calm." This tests whether the portfolio photos on the Work screen build that trust, and whether the site's calm color palette reinforces the feeling.

Persona: "When during your day would you actually have a few free minutes to look something like this up?"
Prediction: Nap time, or sometime after the kids are in bed. This tests whether the site is simple and clear enough for her to move through it quickly and stress-free in a short window.

Capability (5-second test): "I'm going to show you this for five seconds, then hide it. What do you think this is for?"
Prediction: "I think this is a site where you can book haircuts." This tests whether the photo of the woman with scissors, plus the name "Hair by London," communicate the site's purpose instantly.
## 4. Design Justification and First Read

Opening the live site fresh:

Does the landing screen signal the primary capability and fundamental value at first glance, before reading?
Yes. The photo, the name, and the "Book Now" button are the main content on the screen. There's nothing to read to understand what it's for.

Does every element on the landing screen earn its place, or does anything compete with the primary job? 

No, nothing competes. The other content, the social media icons, is small and minimal, so it doesn't take attention away from the main message.

What information and actions belong together on each screen, and which Gestalt grouping principle communicates that?
On the Work screen, the photo grid uses proximity, the cards sit close together so they read as one connected portfolio. The reviews live inside their own bordered card, which is common region, a shared boundary that visually separates them from the photos above.

On the Book screen, the service, day, and time sections are separated using proximity and spacing, so each decision stays distinct from the others. Within each section, the individual options (each service card, each day chip, each time slot) share the same visual style, that's similarity, showing they're all the same type of choice within that group.

Do screens 2 and 3 stay on mission, and can you return to the landing screen from everywhere?
Yes. Both screens stay on mission, Work builds trust, Book handles the actual appointment, so nothing drifts into unrelated content. And yes, you can return to the landing screen from both, the top nav's Home link is visible on every screen.

What did the AI initially get wrong, skip, or oversimplify, and what did you change?
The first version of the site relied on a small home link in the header text for navigation, but it wasn't obvious. I pointed this out, and we added a top nav (Home / Work / Book) visible on every screen, so navigating between screens is easy and clear.
