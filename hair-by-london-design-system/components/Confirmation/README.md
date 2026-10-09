# Confirmation

Step 3 of booking: the clear "you're done" moment, so she can close the tab and get back to her day.

A centered 3.5rem `gold-deep` circle with a white check, "You're booked" in Cormorant Garamond italic, and one line saying what happens next ("A reminder text will go to (801) 555-1234 the day before."). Then the same Recap card as DetailsForm with her name added, an outline pill "Add to calendar", and a quiet "Back to home" text link.

- "Add to calendar" downloads a real `.ics` file with the right start and end time, so it works with any phone calendar.
- Focus moves to the "You're booked" heading so screen readers announce it.
- After this screen, browser back leaves normally instead of reopening the form.
- In the prototype nothing is saved; the PrototypeNotice tells testers that up front.
