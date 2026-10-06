# @specimen.systems/tokens

Design tokens for [specimen_](https://specimen.systems), an open-source design system for
B2B SaaS product teams.

One DTCG file is the source. A generator turns it into the CSS below and into the manifest
the Figma library is built from, and a checker fails the build when the Figma library stops
matching the code. What you install here is the same output that check verified.

```bash
npm install @specimen.systems/tokens
```

## Tailwind v4

```css
@import "tailwindcss";
@import "@specimen.systems/tokens/tailwind.css";
```

Every role becomes a utility: `bg-canvas`, `text-ink`, `border-line`, `p-md`, `text-body`,
`tracking-tag`, `duration-fast`.

## Plain CSS

```css
@import "@specimen.systems/tokens/tokens.css";

.panel {
  background: var(--color-surface);
  border: var(--border-hairline) solid var(--color-line);
  padding: var(--spacing-lg);
}
```

## Themes

Dark is the default. Set `data-theme="light"` or `data-theme="dark"` on the html element to
choose one; leave it off and the page follows `prefers-color-scheme`.

## What is in it

| File | Holds |
|---|---|
| `tokens.css` | Primitives (`--p-*`), 26 colour roles per theme (`--color-*`), and the scale roles |
| `tailwind.css` | The same values as Tailwind v4 `@theme` blocks |
| `tokens.json` | The DTCG source, with a description on every token |
| `figma-variables.json` | The variable manifest for the Figma library |

Two layers. Primitives hold the raw values and are never used directly. Every role aliases
exactly one primitive, so a theme is a different set of aliases, never a different set of
names. Use the roles.

## Licence

MIT
