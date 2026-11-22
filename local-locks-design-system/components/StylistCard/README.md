# StylistCard

One stylist on the Book results, the Stylists list, and Saved: who they are, a peek at their work, the price for what she picked, and the next times she can book. Includes the **SlotChip**.

A `white` card, `radius-md`, 1.5px `cream-deep` border. Top row: the Avatar (photo circle, or `gold` gradient initials when there's no photo), name in Cormorant Garamond, studio and city in `ink-soft`, and the rating line. Price sits at the right: her total ("$185+" with "about 3 hr 30 min") once services are picked, otherwise her lowest price, "$45+" (no "from": the plus already says it is a starting price). Then three 1:1 photo spots (the third is See all work), then, on the Book results only, "Next open" and up to three SlotChips. The Stylists list is for browsing, so its cards stop at the photos.

**SlotChip** is a `cream` pill with a 1.5px `gold-soft` border and `gold-ink` text at 0.78rem (border turns `gold-deep` on hover), labeled "Today, 2:00 PM" / "Tomorrow, 9:30 AM" / "Sat 10, 1:00 PM". Tapping one goes straight to Book with the stylist, services, day, and time filled in.

- **See all work** is the obvious way into the profile: the third photo spot gets a dark overlay reading "See all work →". With fewer than three photos it's its own tile on the warm `photo-light` to `photo-deep` gradient, so every card has it in the same spot. It's where people already want to tap, and it sends them to the photos, services, and reviews that build trust before booking.
- The name link also stretches over the whole card, so a tap anywhere opens the profile. SlotChips and See all work sit above it and keep their own taps.
- Each SlotChip carries a full `aria-label` ("Book London, Sat, Oct 10 at 1:00 PM").
- Prices always show with a plus; they're starting prices.

## Round 2: reviews, distance, and a quick look

- **Rating and "Read reviews".** The rating line (stars, average, count) and a "Read reviews" link share one row under the name, studio, and distance, so neither is squeezed beside the price. The link goes straight to her Reviews tab and is named for her (`aria-label` "Read reviews for London").
- **Distance** ("2.1 mi away", `gold-ink`) is on every card, on its own line under the studio. Until she shares where she is, it is measured from downtown Provo and the page says so.
- **Quick look** is a quiet "Quick look" button at the bottom of the card (`aria-expanded`, rotating chevron). It opens in place with only what the card does not already show: years of experience, what she is known for as pills, and "View full profile". Her photos and rating are already on the card, so they are not repeated. Several cards can be open at once, to compare. Stylists page only.
- Text is larger than before (name 1.5rem, studio and distance 0.98rem), per user testing.
