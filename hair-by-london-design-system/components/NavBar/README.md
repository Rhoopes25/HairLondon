# NavBar

A sticky header with two versions: the main one on Home, Stylists, and profiles, and a focused one during booking.

**Main header.** 1.1rem by 1.25rem of padding on `cream` at 92% opacity with a 6px backdrop blur and a 1px `gold-soft` rule below. The scissors logo mark (`gold-deep`, 1.4rem) links Home at the left; "Home" and "Stylists" sit at the right in `nav` style, `ink-soft`, 1.35rem apart. The current page is `gold-deep` at weight 500 with `aria-current="page"`. On a profile, Stylists stays active and returns her to the same search filters she had.

**Booking header.** Drops the links so nothing pulls her out of booking: an X at the left (back to where she came from), "Booking with London" with a small avatar in the middle, and the scissors logo at the right as the way home. The X and the logo both ask "Leave booking?" if she's picked anything. On the details step the X becomes a back arrow to day and time.

- Two destinations only. There is no separate Book link; booking always starts from a stylist.
- Contrast: `gold-deep` on `cream` is 3.4:1, so the active state also uses the weight change, not color alone.
