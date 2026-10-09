# Reviews

One white card holding a heading, a rating line and a short list of client reviews: the part of the site that earns trust.

The card is `white` with a 1px `gold-soft` border, `radius-lg` (18px) and 1.25rem by 1.3rem padding. The heading uses Cormorant Garamond at 1.2rem, weight 600. Each review is a row separated by a 1px `cream-deep` rule: the client's name (weight 500, `ink`) with `gold-deep` stars at the right (0.8rem, letter-spacing 1px), then the text at 0.85rem in `ink-soft`. The first row has no rule. The rating line above the list ("4.7 · 3 reviews") is added, borrowed from the compact "5.0 (45 Reviews)" line on marketplace listings.

- Stars carry an `aria-label` ("4 out of 5 stars"), and the score is written out in the rating line.
- Keep reviews short and in the client's voice. No photos or badges here; the portfolio does that job.
- The review text is sample copy from the repo, written to match the persona. Replace it with real reviews before launch; the whole promise of the site is trust.
- Marketplaces also show a rating breakdown (Overall, Punctuality, Value, Service). Add one only if real data exists, as quiet 0.85rem rows.
