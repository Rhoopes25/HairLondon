# Notice

A calm "nothing matched, here is what we can do instead" box. Used on the Book page when nobody has an opening on the day or time she asked for, so she is never left at a dead end.

A `gold-soft` box with a 1.5px `gold` border and `radius-md`. A title in Cormorant Garamond ("No openings Sat, Oct 17 in the morning") and one plain sentence under it in `ink`. It is announced politely (`role="status"`), so a screen reader hears the change without focus being pulled away.

- It never blames her or hurries her: "Nobody has a long enough opening then. Here are the soonest times these stylists do have."
- Under it, an "Other times" label and the same StylistCards, with "Other open times" over the chips, so the next step is one tap.
- Used only for a result she can act on. A true dead end (nobody offers the combination) is a plain empty note that says how to fix it: "Try removing one service."

Code: `app/ui/Notice`.
