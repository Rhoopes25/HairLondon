# PortfolioGrid

A two-column grid of client-work photos that lets a first-time visitor judge the stylist before anything else.

Tiles are cropped 4:5 with `radius-xl` (20px), sit 1rem apart inside 1.5rem side margins, and carry the only real shadow in the system (`shadow-card`). Until a photo loads, or if it fails, each tile shows a 145deg gradient, by default from `photo-light` to `photo-deep`. The site varies the gradient per tile; the preview does the same from tokens (the page uses a few extra inline hex values such as `#F0E4CC` and `#96723C`, which should be folded into tokens).

- Photos are real client work in warm light. No stock images.
- Every image needs specific alt text describing the work ("Soft caramel highlights on shoulder-length hair"), not "Recent client work". The optional caption style is `caption` at 0.65rem in `ink-soft`, centered.
- Give images width and height and lazy-load those below the fold so the page stays fast on a phone.
- Close the section with the filled Button ("Book Now").
- The consumer provides the photos, the alt text and any per-tile gradient.
