# NavBar

A sticky header that keeps Home, Portfolio and Book one tap away on every screen.

It is 1.1rem by 1.25rem of padding on `cream` at 92% opacity with a 6px backdrop blur and a 1px `gold-soft` rule below. The scissors logo mark (`gold-deep`, 1.4rem) links Home at the left; three links sit at the right in `nav` style, `ink-soft`, with 1.35rem between them. The current page's link is `gold-deep` at weight 500. A small header Book pill exists in style.css (`.book-btn`) for a variant that swaps a link for the action.

- Mark the current page with `aria-current="page"`.
- Contrast: `gold-deep` on `cream` is 3.4:1, below 4.5:1 for small text. Use `gold-ink` for the active link if it has to pass AA, and keep the weight change too, so the state is not color alone.
- The project README describes a bottom tab bar (Home / Work / Book). It is not in style.css or the HTML, so it is not part of this system until someone decides to build it.
- Name destinations the same everywhere: the header says "Portfolio" while the page says "My Work".
