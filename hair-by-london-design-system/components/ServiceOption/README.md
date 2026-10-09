# ServiceOption

A full-width white row where she taps a service to add it on the booking screen, seeing what it is, how long it takes, and the starting price without opening anything.

Order is fixed: a 24px round check, then the service name (weight 500) over a one-line description (0.8rem, `ink-soft`), then "1 hr · $65+" at the right. The row is `white` with a 1.5px `cream-deep` border and `radius-md`, 0.65rem between rows. When chosen, the border turns `gold-deep` and the circle fills `gold-deep` with a white check.

- A real label around a visually hidden checkbox, so the whole row is the target. Focus shows a 2px `gold-deep` ring around the circle.
- State shows by border, fill, and a check mark, never color alone.
- If she already picked services on the Stylists screen, the list collapses into one summary row ("Haircut + Highlights", "$215+ · about 3 hr 30 min") with a Change button.
- **Service row** is the profile's Services tab version: same look without the check, with an arrow; tapping it starts booking with that service.
- Only services this stylist offers are listed, at her prices.
