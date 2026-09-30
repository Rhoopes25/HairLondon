# SlotPicker

Two steps in one component: choose a day from a scrolling strip of chips, then a time from a three-column grid.

**Day chips** are `white` with a 1.5px `cream-deep` border and `radius-md`; the weekday is `caption` in `ink-soft` and the date is `numeral` in Cormorant Garamond. Chosen fills and borders in `gold-deep` with `white` text. **Time slots** are `white` with the same border at `radius-sm`, text at 0.82rem. Chosen takes a `gold-deep` border and a `gold-soft` fill at weight 500. **Unavailable** slots use `unavailable` text on a `cream-deep` fill; the preview adds a strike-through so the state does not rely on color.

- Build chips and slots as real `<button>`s with `aria-pressed` and `disabled`. The prototype uses clickable divs, which keyboards cannot reach.
- Picking a new day clears the chosen time, and the grid shows "Select a day to see available times" (`body-sm`, `ink-soft`) until one is chosen.
- The prototype's times have no AM or PM (`1:00`, `2:30`). Add it.
- Days and availability are sample values in the site; the consumer should generate real ones.
- No scarcity wording ("only 2 left"). Availability is open or unavailable.
