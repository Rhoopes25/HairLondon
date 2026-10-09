# FilterChip

The pill chips on the Stylists screen for picking services, a day, and a time of day, plus the numbered step labels that order the screen.

**Service and time chips** are pills in `white` with a 1.5px `cream-deep` border, 0.85rem text. Chosen fills `gold-ink` with `white` text. Service chips allow many; time chips (Any time, Morning, Afternoon, Evening) allow one. **Day chips** reuse the day chip from SlotPicker, with an "Any day" chip first.

**Step labels** put a 1.6rem `ink` circle with a white number before the heading: "1 What do you need?" and "2 Tap a time to book". Day and time headings are smaller, `ink-soft`, and tagged "optional", so the eye goes 1 then 2.

- Real `<button>`s with `aria-pressed`. Re-rendering keeps keyboard focus on the chip she just pressed.
- A "Clear filters (n)" text button shows only when something is picked.
- Picking services shows one estimate line in `gold-ink`: "Together these take about 3 hr 30 min."
- Filters never dead-end. If nobody is open then, a `gold-soft` notice says so and shows the soonest other times.
