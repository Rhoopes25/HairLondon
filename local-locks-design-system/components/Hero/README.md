# Hero

The landing screen: a photo on top, then the name, one short line, and one button below it on plain cream. Readable in a glance.

The photo (`home.jpg`, a stylist holding her shears) fills the 460px column at roughly 4:4.3 with `radius-xl` corners, no overlay and no text on it. Below, centered on `cream`: the name in Cormorant Garamond italic, 3rem, weight 600, `ink`; the tagline "Local stylists you can trust." at 1rem in `ink-soft`; then the filled hero pill, "Find a stylist" (0.85rem, weight 500, `gold-ink` with white text, `ink` on hover), the only button on the screen.

- Text lives under the photo, not on it, so nothing clashes with the picture and contrast is never a problem.
- The photo is what says "hair" in the 5-second test. The name ("Local Locks") says near you, and the tagline adds trust, the core value.
- Only the photo, name, tagline, button, and header belong on this screen. No footer links, no extra claims.
- The photo has `role="img"` and an `aria-label` ("A stylist holding her shears").
