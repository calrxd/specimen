# @specimen.systems/tokens

## 0.1.1

The package author now reads Callum Radmilovic. No token changes.

## 0.1.0

First release. 162 tokens: 83 primitives, 26 colour roles in a dark and a light theme, and
53 scale roles (spacing, border, radius, type, tracking, leading, motion, breakpoints,
measures). Every role aliases a primitive; nothing in the semantic layer holds a literal.

- `tokens.css`: plain custom properties for any stack.
- `tailwind.css`: the same values as a Tailwind v4 theme.
- `tokens.json`: the DTCG source the other three files are generated from.
- `figma-variables.json`: the manifest the Figma library is built from.

Dark is the default theme. `data-theme="light"` or `data-theme="dark"` on the html element
picks one; with no attribute the page follows `prefers-color-scheme`.
