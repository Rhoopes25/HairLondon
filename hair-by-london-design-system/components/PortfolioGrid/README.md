# PortfolioGrid

A two-column grid of client-work photos on the profile's Portfolio tab, so a first-time visitor can judge the stylist before anything else.

Tiles are cropped 4:5 with `radius-xl` (20px), 1rem apart inside 1.5rem side margins, with the soft `shadow-card`. Until a photo loads, or if it fails, each tile shows a 145deg gradient from `photo-light` to `photo-deep`. The same photos appear as three small 1:1 thumbs on the StylistCard.

- Photos are real client work in warm light, saved as JPGs around 900px wide (100 to 220 KB) so they load fast on a phone.
- Every image has specific alt text describing the work ("Ash blonde balayage with curtain bangs").
- Images lazy-load.
- A stylist with no photos gets a plain note pointing to her reviews instead of empty tiles.
- The BookBar sits under the grid; the grid itself has no button.
