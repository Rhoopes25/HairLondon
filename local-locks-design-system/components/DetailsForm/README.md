# DetailsForm

Step 2 of booking: a recap of what she picked, then just name and phone. Two fields, nothing else, so it fits in a nap-time window.

**Recap** is a `white` card, `radius-lg`, 1px `gold-soft` border, rows split by `cream-deep` rules: label in `ink-soft` at left, value at right (Stylist, Services, When, Estimated total). **Fields** stack a 0.85rem label (weight 500) over a full-width input: `white`, 1.5px `cream-deep` border, `radius-md`, 16px text so phones don't zoom. Focus turns the border `gold-deep`. A hint line in `ink-soft` explains why we ask ("For a reminder text the day before.").

- Errors show under the field in plain words that say how to fix it ("Enter a 10-digit phone number."), set `aria-invalid`, and move focus to the first bad field.
- Phone accepts any format and is shown back as (801) 555-1234.
- The header's X turns into a back arrow on this step and goes back to day and time. Browser back does the same.
- The Confirm booking button sits in the sticky ConfirmBar.
