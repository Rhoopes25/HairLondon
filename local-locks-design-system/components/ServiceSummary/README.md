# ServiceSummary

Services she already picked, shown as one line instead of the whole list again, with a way to change them. It keeps the booking screen short when she arrives from the Book page or a profile that already chose services.

A `white` row with a 1.5px `gold-deep` border and `radius-md`. Left: the services joined with `+` (0.92rem, weight 500) over a quiet meta line ("$185+ · about 3 hr"). Right: an underlined "Change" text button.

- "Change" opens the full list of ServiceOptions under the row and the button reads "Done" (`aria-expanded` and `aria-controls` say so). Picking a different service updates the line and the total.
- If she un-picks everything, the list stays open, because a summary of nothing is no summary.
- Not shown when she arrives with nothing picked: then the list is the first thing, with the heading "Choose your services".

Code: `app/ui/ServiceSummary`.
