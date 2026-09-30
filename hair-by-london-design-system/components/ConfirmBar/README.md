# ConfirmBar

The panel at the end of the booking screen: what is chosen, the total, and the one next step.

It is a full-width `white` panel with a 1px `gold-soft` rule above and 1.5rem padding. It sits in the page flow after the time grid (it is not sticky in style.css). Top to bottom: a summary line (`body-sm`, `ink-soft`: services joined with `+`, then day and time joined with a middle dot) over a `cream-deep` rule; a Total row (label in `ink` at weight 500, amount at 0.95rem); and a full-width filled Button. Until services, a day and a time are all chosen, the summary reads "Select services, day & time", the total shows an em dash and the button is disabled.

- Style the disabled button: style.css does not, so a disabled Continue currently looks the same as a ready one. The added disabled state uses `cream-deep` with `ink-soft` text.
- The prototype's button says "Continue →" and then changes to "Added ✓" without saving anything. Use "Continue" only when it leads to a next step, and a confirmation screen when the booking is final.
- No timers or "holding your slot" language.
- If it should stay reachable on a long page, pinning it to the bottom is a change to the current site; keep the same panel and add a soft shadow.
- The consumer provides the selections, the total and the action.
