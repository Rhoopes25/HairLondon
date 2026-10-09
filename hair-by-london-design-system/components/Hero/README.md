# Hero

The landing screen's single statement: a photo, the name, one line on what this is, and one big button, readable in a glance.

A 4:5 photo fills the width of the 460px column. A warm glow sits over it and an ink scrim (72% at the bottom to transparent) carries the text. The name is `display-xl`: Cormorant Garamond, italic, 2.5rem, white, centered. Under it, the tagline at 1rem: "See real work from local stylists, then book a time that fits your day." Then the white hero pill, "Find a stylist", at 1.05rem weight 600 with a soft drop shadow so it's the obvious next tap.

- The tagline is there because "Hair by London" alone reads like one stylist's salon, but the site lets you compare several. It answers "what is this for" in the 5-second test.
- Only the name, tagline, button, and header belong on this screen. No footer links, no extra claims.
- White text on the photo must stay above 4.5:1 through the scrim; strengthen the scrim rather than darkening the photo.
- The section has an `aria-label` describing the photo ("A stylist holding her shears").
