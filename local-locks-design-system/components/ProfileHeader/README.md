# ProfileHeader

The top of a stylist's profile: avatar, name, studio, a one-line rating, a short bio, and a tab row for Portfolio, Services, and Reviews.

The name is `display-lg` in Cormorant Garamond next to a large Avatar. Studio and city in `ink-soft`, then the rating line (`gold-deep` stars, "4.7 · 3 reviews"), then the bio at 0.9rem. Tabs use `nav` style; the current tab is `ink` at weight 500 with a 2px `gold-deep` underline over a 1px `gold-soft` rule. A "Back to stylists" link sits above it all and returns to her last search.

- Opens on **Portfolio**, because seeing the work is what builds trust. If a stylist has no photos yet, it opens on **Reviews** instead and Portfolio says so plainly.
- Real ARIA tabs: `role="tablist"`, arrow keys move between tabs.
- Book is not in this header anymore. It lives in the BookBar at the bottom, so there's exactly one Book button on the screen.
- With no reviews, the rating line says "New".
