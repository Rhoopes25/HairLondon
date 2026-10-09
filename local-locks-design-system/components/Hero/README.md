# Hero

The landing screen's single statement: a photo, the name, one line on what this is, and one button, readable in a glance.

A 4:5 photo fills the width of the 460px column. A warm glow sits over it and an ink scrim (72% at the bottom to transparent) carries the text. The name is `display-xl`: Cormorant Garamond, italic, 2.5rem, white, centered. Under it, the tagline at 1rem: "See real work from stylists near you, then book a time that fits your day." Then the white hero pill, "Find a stylist" (0.85rem, weight 500), the only button on the screen.

- The name does most of the work: "Local Locks" says hair, near you, so it reads as a place to find a stylist, not one salon. The tagline backs that up for the 5-second test. (The site used to be called "Hair by London," which read like a single stylist's salon; London is now one of the stylists.)
- Only the name, tagline, button, and header belong on this screen. No footer links, no extra claims.
- White text on the photo must stay above 4.5:1 through the scrim; strengthen the scrim rather than darkening the photo.
- The section has an `aria-label` describing the photo ("A stylist holding her shears").
