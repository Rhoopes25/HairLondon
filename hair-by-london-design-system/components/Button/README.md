# Button

The one place an action is named: a pill in `gold-deep` for most screens, white on a photo, and a small one for the header.

**Filled** is a full-width pill, `gold-deep` with `white` text, 0.95rem at weight 500, letter-spacing 0.02em, 0.95rem padding; on hover or focus it turns `ink`. It closes My Work ("Book Now") and Book ("Continue"). **Hero** is a white pill with `ink` text at 0.85rem that lifts 1px on hover and fills `gold-soft`; it sits on the landing photo only. **Header Book** is a small `gold-deep` pill (0.8rem) for the sticky header. **Disabled** is added: `cream-deep` fill with `ink-soft` text, so a not-yet-ready Continue is visibly different (style.css sets the disabled attribute but no style).

- Use one filled button per screen. The focus ring is 2px `gold-deep` with a 2px offset.
- Contrast: white on `gold-deep` is 3.6:1. Where the label must pass AA, use the added `gold-ink` fill (6.3:1) in place of `gold-deep`.
- Labels are plain verbs with no urgency: "Book Now", "Continue".
- The consumer provides the label and click handler and explains a disabled state in nearby text.
