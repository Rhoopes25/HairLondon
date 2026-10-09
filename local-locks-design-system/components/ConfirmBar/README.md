# ConfirmBar

The bar at the bottom of the booking screen: what she's picked, the estimated total, and the one next step. Sticky, so Continue is always in reach on a phone.

A `white` panel stuck to the bottom with a 1px `gold-soft` rule above and a soft upward shadow. Top to bottom: a summary line (`ink-soft`: services joined with `+`, then the day, then the time range, split by middle dots), an "Estimated total" row ("$185+ · about 3 hr"), a one-line price note, and a full-width filled Button at 1.05rem weight 600.

- Until services, a day, and a time are all picked, the summary reads "Select services, day & time", the total shows an em dash, and Continue is disabled (`cream-deep` fill, `ink-soft` text).
- Continue goes to DetailsForm. There, the same bar holds "Confirm booking", which goes to Confirmation. No fake "Added" states.
- The price note says prices are starting prices and the stylist will confirm. No timers or "holding your slot" language.
