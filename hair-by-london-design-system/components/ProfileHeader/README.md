# ProfileHeader

Puts the stylist's name, a one-line rating and a tab row with a Book button at the top of a profile. Added: this does not exist on the current site.

It is the clearest borrow from marketplace booking profiles, where a tab row (Services, Classes, Reviews and so on) sits beside a Book Now action. The name is `display-lg` in Cormorant Garamond. The rating line is `body-sm` in `ink-soft` with `gold-deep` stars and a plain count: "4.7 · 3 reviews". Tabs use `nav` style; the current tab is `ink` at weight 500 with a 2px `gold-deep` underline over a 1px `gold-soft` rule (an underline, rather than gold text, avoids the 3.4:1 text contrast). Book is the small header pill, always in the row.

- Show a rating only from real reviews. With none, write "New" in `ink-soft`.
- Tabs scroll horizontally if more are added; Book does not.
- The consumer provides the name, rating, count and tab labels, and marks the current tab with `aria-current`.
