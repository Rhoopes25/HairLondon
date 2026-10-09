# StylistCard

One stylist in the Stylists results: who they are, a peek at their work, the price for what she picked, and the next times she can book. Includes the **SlotChip**.

A `white` card, `radius-md`, 1.5px `cream-deep` border. Top row: the Avatar (photo circle, or `gold` gradient initials when there's no photo), name in Cormorant Garamond, studio and city in `ink-soft`, and the rating line. Price sits at the right: her total ("$185+" with "about 3 hr 30 min") once services are picked, otherwise "from $45+". Then up to three 1:1 portfolio thumbs, then "Next open" and up to three SlotChips.

**SlotChip** is a `cream` pill with a 1.5px `gold-soft` border and `gold-ink` text at 0.78rem (border turns `gold-deep` on hover), labeled "Today, 2:00 PM" / "Tomorrow, 9:30 AM" / "Sat 10, 1:00 PM". Tapping one goes straight to Book with the stylist, services, day, and time filled in.

- The name link stretches over the whole card, so a tap anywhere opens the profile. SlotChips sit above it and keep their own tap.
- Each SlotChip carries a full `aria-label` ("Book London, Sat, Oct 10 at 1:00 PM").
- Prices always show with a plus; they're starting prices.
- Stylists without photos skip the thumbs row rather than showing empty boxes.
