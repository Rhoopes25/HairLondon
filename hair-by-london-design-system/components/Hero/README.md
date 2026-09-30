# Hero

The landing screen's single statement: a photo, the name and one button, readable in a glance.

A 4:5 photo fills the width of the 460px column inside 1.75rem by 1.25rem of padding. A warm glow sits over it (white at the top left, `gold-deep` at 35% at the lower right), and an ink scrim (`scrim`, rising from 72% at the bottom to transparent) carries the text. The name is `display-xl`: Cormorant Garamond, italic, 2.5rem, white and centered. Below it, the white hero pill button ("Book Now", `ink` text).

- Only the name, the button and the header belong above the fold. Extra links or claims compete with the job of the screen.
- White text on the photo must stay above 4.5:1 through the scrim; check against each new photo, and strengthen the scrim rather than darkening the photo.
- The button keeps the white-and-`gold-soft` hover with its 1px lift, and is still reachable by keyboard: give it a white 2px focus ring when on the photo.
- Alt text or a visually hidden description for the photo should describe the stylist at work, not repeat the name.
- The consumer provides the photo (`home.jpg`) and the link target.
