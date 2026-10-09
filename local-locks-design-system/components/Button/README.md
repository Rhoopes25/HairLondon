# Button

The one place an action is named. One filled button per screen, so the happy path is never in question.

**Filled** is a full-width pill in `gold-ink` (white on it is 6.3:1, passes AA) with `white` text at 1.05rem weight 600 and 0.95rem padding; on hover or focus it turns `ink`. It's Continue and Confirm booking on Book, and the "Book with London" pill in the BookBar. **Disabled** is `cream-deep` with `ink-soft` text, so a not-ready Continue looks different from a ready one. **Hero** is the landing button ("Find a stylist"): a `gold-ink` pill with white text at 0.85rem weight 500 that turns `ink` on hover, centered under the name. **Outline** is a `gold-ink` bordered pill for secondary actions like "Add to calendar".

- The old small header Book pill is retired; the BookBar replaced it.
- The focus ring is 2px `gold-deep` with a 2px offset.
- Labels are plain verbs with no urgency: "Find a stylist", "Book with London", "Continue", "Confirm booking". Never "Hurry" or "Grab".
- A disabled button explains itself in nearby text ("Select services, day & time").
