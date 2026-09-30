# ServiceOption

A full-width white row where a client taps a service to add it, seeing the price without opening anything.

Order is fixed: a 24px round check (`radius-round`), the service name (`label`, weight 500, fills the row), then the price (0.8rem, `ink-soft`) at the right. The row is `white` with a 1.5px `cream-deep` border and `radius-md`, 0.9rem by 1.1rem padding, with 0.65rem between rows. When chosen, the border turns `gold-deep` and the circle fills `gold-deep` with a white check mark.

- It is a real label around a real (visually hidden) checkbox, so the whole row is the target and assistive tech announces it. Focus shows a 2px `gold-deep` ring, 2px offset, around the circle.
- State shows by border, fill and a check mark, never color alone.
- The unchosen border (`cream-deep`) is faint. The white card and the open circle carry the affordance.
- Prices in the preview are the site's (Haircut $65, Color $120, Highlights $150, Root Touch-Up $80). Adding duration is optional and belongs in the same line as the price, for example `1 hr · $65`.
- The consumer provides the list and the running total (see ConfirmBar).
