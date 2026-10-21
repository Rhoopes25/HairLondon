# StepGuide

A short row of icon steps that says what to do, in order, and how far along she is. It answers "how long is this going to take?" before she has to ask, which keeps booking calm.

Each step is a 2.25rem circle with a line icon in `gold-deep` on `white`, joined to the next by a 1.5px `gold-soft` line, with a short label under it in `ink-soft` at the caption size. The current step gets a 2px `gold-ink` ring and an `ink`, weight-600 label. Finished steps fill `gold-ink` with a white check.

- **Book page:** Pick services (scissors), Pick a day (calendar), Tap a stylist's time (clock). The current step follows what she has done.
- **Inside a booking:** Pick a time (calendar), Your details (person), Review (list), Booked (check). On the confirmation screen every step shows done.
- It is an `<ol>` with `aria-current="step"` on the current item, and done steps say "(done)" to screen readers. The steps are not links: going back uses the screen's own Back or Edit.
