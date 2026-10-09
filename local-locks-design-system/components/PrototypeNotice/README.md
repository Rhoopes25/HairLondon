# PrototypeNotice

A dark bar across the top of the first screen a tester lands on, telling them up front that this is a prototype and what we're testing.

It is the `ink` color with `white` text and 1rem by 1.5rem padding, so it reads as a note from us and not as part of the product. Title at 0.95rem weight 600 ("This is just a prototype"), one short paragraph at 0.82rem in white at 85%, and a white pill "Got it" button that removes it.

- Shows on the **first screen of a visit only**, whichever page that is. It marks itself seen in `sessionStorage` as soon as it appears, so the next screen never shows it. Per Prof. Twyman: up front, then out of the way.
- Copy says three things: it isn't meant to look polished, we're testing the idea and not the visual design, and the task ("Try booking a hair appointment"). It also says nothing booked is real.
- It sits in the page flow above the sticky header, not over content, so it never covers the primary action.
- Lives in `prototype-notice.js`, included on every page. No other markup needed.
