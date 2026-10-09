# BookBar

The one Book action on a stylist profile, pinned to the bottom of the screen so it's always in reach while she looks at the work and reviews.

A `white` bar with a 1px `gold-soft` rule above and a soft upward shadow, sticky at the bottom, with safe-area padding for phones. Left: what she's booking (0.9rem, weight 500) over a `ink-soft` meta line. Right: a filled `gold-ink` pill, 1rem weight 600, "Book with London".

- **Always shown.** With services already picked on the Stylists screen: "Haircut + Highlights" / "$215+ · about 3 hr 30 min", plus the held time in `gold-ink` if she tapped one. With nothing picked: "Services from $45+" / "Pick services, a day, and a time next".
- It replaces the old small Book pill in the tab row and the Book Now button under the photos. One Book button per screen, never three.
- Tapping a service row in the Services tab also goes to Book with that service added; that's a shortcut, not a second primary button.
