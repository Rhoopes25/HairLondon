# SlotPicker

Two steps in one component on the booking screen: choose a day from a scrolling strip, then a start time from a three-column grid.

**Day chips** are `white` with a 1.5px `cream-deep` border and `radius-md`: weekday as `caption` in `ink-soft`, the date as `numeral` in Cormorant Garamond, and the month below. Only days this stylist works are shown, three weeks out. Chosen fills `gold-deep` with `white` text. **Time slots** are `white` with the same border at `radius-sm`, every 30 minutes with AM or PM. Chosen takes a `gold-deep` border and `gold-soft` fill at weight 500. **Unavailable** slots use `unavailable` text on `cream-deep`, are `disabled`, and have a strike-through.

- Real `<button>`s with `aria-pressed` and `disabled`.
- A time only counts as open if the whole appointment fits. Pick Haircut + Highlights and a 5:30 PM start disappears because it would run past closing.
- If she changes services and her picked time no longer fits, it clears and a `gold-ink` note says why: "6:00 PM doesn't leave enough time for everything you picked. Choose another time."
- Under the grid: "You'll be done by about 4:30 PM."
- A day or time she tapped on the Stylists screen comes in already picked.
- No scarcity wording ("only 2 left").
