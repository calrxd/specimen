# specimen_ design system pipeline

Code is the source of truth. Figma is generated from it and kept in step by hand where
automation stops. This document describes the loop and the rules that keep both sides honest.

## The Figma file

`specimen_ Design System`: https://www.figma.com/design/48sAYLBAAByDizTB2gfsu6

Contents: 162 variables across three collections; 9 text styles; 19 components. Everything in
it was generated from the two files below.

| Collection | Modes | Count | Holds |
|---|---|---|---|
| `specimen_ primitives` | Value | 83 | every raw value in the system: colour, size, font size, family, tracking, line height, duration, easing, viewport, measure. Every scope empty, so they appear in no picker |
| `specimen_ color` | Light, Dark | 26 | colour roles, one alias per theme |
| `specimen_ scale` | Value | 53 | every other role: spacing, border, radius, type, tracking, leading, motion, breakpoints, measures |

**Every one of the 79 semantic variables is an alias. None holds a literal.** Nothing in code
or in a component points at a primitive.

Pages:

```
Cover
Getting Started   install, using the file, the rule, how a change flows
=== FOUNDATIONS ===
Color          25 colour roles in both modes, scrim included and every primitive ramp, grouped by role, each swatch bound to its variable
Typography     families, the 7 size steps, the 2 case treatments, tracking, line height
Spacing        the 10 named steps, bar widths bound to their variables
Radius         the 4 radii and where they come from (decided 6 Oct 2026)
Breakpoints    the 5 min-widths drawn to scale, marked by whether the code uses them
Border         hairline and focus, shown in place rather than as numbers
Motion         3 durations and the easing curve plotted against linear
Branding       the mark, its rules, the wordmark, and the colour ratio
=== COMPONENTS ===
SectionHeader
Mark
Wordmark
Button
Tag
Field
Checkbox
Radio
Switch
Select
Textarea
Tabs
Toast
Table
Tooltip
Dialog
Popover
Menu
CommandMenu
```

## Direction of travel

```
tokens/specimen.tokens.json
        |
        |  npm run tokens
        v
src/app/tokens.generated.css  ---->  Tailwind utilities  ---->  React components
tokens/figma-variables.json   ---->  Figma variables     ---->  Figma components
                                                                      ^
                                          Storybook stories ----------+
                                          (the spec each Figma component is built to)
```

Nothing is drawn in Figma first. A component exists in code with a story before it exists
in the library, and the story defines the variant matrix the Figma component set must match.

## Why Code Connect is not step one

Code Connect maps Figma components that already exist onto the code that implements them.
It generates nothing. It also requires an Organisation or Enterprise plan, and specimen_ is
on Figma Pro, so it is unavailable today. The substitutes are in "Linking without Code Connect"
below. If the plan changes, Code Connect drops into the last step of the loop without
disturbing anything above it.

## The token loop

`tokens/specimen.tokens.json` is the only file anyone edits. It is W3C DTCG format with a
`$extensions["com.figma"]` block on each token carrying the Figma scope list and the Dev Mode
code syntax.

`npm run tokens` regenerates two files. Neither is edited by hand:

| File | Consumer |
|---|---|
| `src/app/tokens.generated.css` | Tailwind v4 `@theme`, imported by `globals.css` |
| `tokens/figma-variables.json` | the Figma variable build, and the Foundations stories |

Rules:

1. A token that does not exist in the JSON does not exist. Arbitrary values in JSX
   (`text-[11px]`, `gap-[14px]`) are drift and get migrated to a named token.
2. Every token carries a Figma scope. A colour scoped to `TEXT_FILL` cannot be dropped on a
   frame background by accident in Figma.
3. Every token carries WEB code syntax as `var(--name)`. A designer inspecting the variable in
   Dev Mode reads the exact CSS variable a developer would type.
4. `Foundations/Tokens` in Storybook renders from the generated manifest, so a wrong token is
   visible before it reaches Figma.

## Two layers, all the way down

Colour is not a special case. Every token type has a primitive holding a raw value and a
semantic role pointing at it.

```
primitive/size/2          2          <- the value exists once
    ^                     ^
    |                     |
border/strong ------------+          <- a selected row, an active tab
border/focus  ------------+          <- the focus ring
```

That is the layer earning its keep. `border/strong` and `border/focus` are both 2px and both
point at `size/2`, which makes them provably the same value while staying separate names, so
changing the focus ring later cannot silently move every selection state.

The same ramp feeds spacing, border weight and radius, because they are all lengths. Type
sizes, families, tracking, line heights, durations, the easing curve, viewport widths and
line-length limits each have their own primitive family.

**One exception, and it is a real constraint.** Tailwind compiles `--breakpoint-*` into
`@media (min-width: ...)`, and a media query cannot read a custom property. Breakpoints
therefore inline their primitive's literal value in CSS while still aliasing in Figma, where
it costs nothing. The generator marks this explicitly rather than letting it be a surprise.

A second thing worth knowing: the semantic blocks are plain `@theme`, not `@theme inline`.
`inline` stops Tailwind emitting `--color-*` and `--spacing-*` as real custom properties,
which would break every `var(--spacing-2xs)` in `globals.css` and every inline style in the
components. The extra hop through `--c-*` is what makes a utility follow the theme at runtime.

## Light and dark

Colour is two layers. Primitives hold raw values under `--p-*` and are referenced by nothing
except the semantic layer. Semantic tokens name a role, carry a value per theme, and are
what code and components use.

The CSS mechanism is a hop through an intermediate variable, in a plain `@theme` block:

```css
:root { --c-canvas: var(--p-ink-950); }              /* dark, the default */
:root[data-theme="light"] { --c-canvas: var(--p-paper-50); }
@theme { --color-canvas: var(--c-canvas); }          /* utility resolves at use time */
```

The hop matters. `--color-canvas` points at `--c-canvas`, which the theme selector swaps, so
the utility follows the theme at runtime. It must be plain `@theme`, not `@theme inline`; see
above for why.

**Dark is the default. `data-theme` on the html element picks a theme; with no attribute the
page follows `prefers-color-scheme`** (added 4 Oct 2026, for `@specimen/tokens` consumers).
Flipping a product on an OS setting is still a product decision, so the site sets
`data-theme="dark"` in `layout.tsx` and renders exactly as before.

### The names changed

A physical name cannot survive two themes: `paper` cannot mean "the text colour" on a
paper-coloured page. `scripts/migrate-color-roles.mjs` renamed 70 usages across 18 files.

| was | now | why |
|---|---|---|
| `bg-ink` | `bg-canvas` | the page ground |
| `text-paper` | `text-ink` | primary text. `ink` is the role, so it resolves to paper on a dark canvas |
| `text-ink` | `text-on-sample` | ink text sitting on a green fill |
| `bg-panel` | `bg-surface` | a raised surface |
| `bg-sample` | `bg-sample-fill` | green as a surface is a different token from green as text |
| `bg-sample-light` | `bg-sample-hover` | |
| `bg-sample-deep` | `bg-sample-pressed` | |

`muted`, `faint`, `line`, `line-strong`, `sample`, `danger` and `warn` were already roles and
did not move.

### Contrast, and two things that were failing

Every semantic pair was measured before it was chosen. Two existing dark values did not
clear AA and were fixed rather than carried across:

| Token | Was | Now | Why |
|---|---|---|---|
| `faint` on dark | `#5A605B`, 3.04:1 | `grey/400` `#767C77`, 4.59:1 | it is placeholder text, which has to be readable |
| `danger` on dark | `#C0554B`, 4.33:1 | `red/400` `#CE6459`, 5.22:1 | just under the line, and it is error text |

`sample` is the other consequence of light mode. `#2CE98F` on paper is 1.44:1, so as text and
borders it aliases `green/800` `#07753F` (5.24:1) in light. As a fill it stays `#2CE98F` in
both modes under the separate `sample-fill` token, always with `on-sample` over it at 12.28:1.

A new token came out of the same pass. `color/line` is decorative and sits near 1.3:1 on
purpose, which is what keeps a table readable rather than striped. WCAG 1.4.11 asks for 3:1
on the boundary of anything a user has to find and click, so `color/line-interactive` exists
for inputs, selects and checkboxes: 3.29:1 on dark, 3.39:1 on light.

Seven control boundaries now use it: the signup input, the settings input, the block editor's
field class and its four bordered buttons. The rule for deciding is whether the element
carries interaction state. A class list with `focus-visible:`, `cursor-pointer` or
`hover:border-` is a control and takes `line-interactive`; a panel edge or a table rule is
structure and stays on `line`. Measured in the running app: 3.39:1 light, 3.29:1 dark.

### Token groups

| Group | Count | Tailwind namespace | Notes |
|---|---|---|---|
| `primitive` | 83 | `--p-*` | raw values, no utilities, referenced by every semantic token |
| `color` | 26 | `--color-*` | semantic, two themes, emitted through a plain `@theme` (see above) |
| `font` | 2 | `--font-*` | Figma stores the family name, not the CSS fallback stack |
| `text` | 7 | `--text-*` | the size scale |
| `tracking` | 4 | `--tracking-*` | percentages, applied through text styles |
| `leading` | 4 | `--leading-*` | overrides Tailwind's `leading-normal`, `leading-relaxed` and `leading-loose` |
| `spacing` | 15 | `--spacing-*` | 4px base, `none` through `9xl` |
| `radius` | 4 | `--radius-*` | none, sm 4px, md 8px, full |
| `border` | 5 | `--border-*` | none, hairline, strong, focus, accent |
| `measure` | 3 | `--container-*` | content max-widths |
| `breakpoint` | 5 | `--breakpoint-*` | Tailwind v4 defaults, written down |
| `ease` | 1 | `--ease-*` | |
| `duration` | 3 | `--duration-*` | |

Two of those borrow a namespace deliberately. `measure` emits `--container-measure-lg` so
the utility reads `max-w-measure-lg` without shadowing Tailwind's own `max-w-sm`. The token
keys carry the `measure-` prefix for that reason, and `build-tokens.mjs` strips it back off
for the Figma variable name, which stays `measure/lg`.

### Text styles: size and treatment are separate

`Text/Micro` through `Text/Display` are pure size steps. No case, no tracking. The two
uppercase treatments the codebase actually uses are their own styles:

| Style | Value | Where it comes from |
|---|---|---|
| `Text/Tag` | 10px, UPPER, 12% | the `.spc-tag` rule in `globals.css` |
| `Text/Label Caps` | 11px, UPPER, 16% | section eyebrows and column headers |

Keeping them separate means changing a size does not silently change a case treatment,
and a component can pick one without inheriting the other.

### Letter spacing is not a variable

A FLOAT variable bound to `letterSpacing` in Figma resolves as **pixels**. Binding
`tracking/label` (0.16em, stored as 16) produced 16px of tracking rather than 16%. Em is
relative to font size, so no single pixel value can express it across the scale.

Tracking therefore lives on the text styles as a percentage. The `tracking/*` variables
stay in the collection to document the values, with `scopes: []` so they cannot be picked
from the letter-spacing picker by mistake. Do not re-add a scope to them.

### Known drift at v1.1

| Item | Where | Decision needed |
|---|---|---|
| `letterSpacing: '0.1em'` | `SectionHeader.tsx` label | Not a token. The Figma label node carries it as a raw 10% override and is detached from `Text/Body` as a result. Either promote it to a `tracking/*` token or drop it. |
| `pb-[14px]` | `SectionHeader.tsx` | Off the 4px scale. Round to `spacing/md` (12px) or `spacing/lg` (16px). |
| `text-sm` (14px), `text-[16px]`, `text-[17px]` | various | Sizes with no token. Round onto the scale or add steps. |
| `gap-[14px]`, `py-[22px]`, `py-[15px]`, `py-[13px]`, `gap-[34px]` | various | Off-scale spacing. |
| `px-10` (40px) | various | Now covered by `spacing/4xl`. Migrate the class. |
| `showBar` has no effect below `size='lg'` | `Mark.tsx` | The prop is part of the API at every size but only renders at lg, so two of the six combinations are visually identical. Either scope the prop to lg in the type or draw the bar at every size. |

Each of these makes `npm run figma:check` emit a warning about an unbound value, which is
the intended behaviour: the check surfaces them until a decision is made.

## The component loop

For each component, in order:

1. Build the React component in `src/components/`.
2. Write `Component.stories.tsx` beside it. One story per meaningful state, one arg per prop.
3. Check the a11y panel. `a11y: { test: 'error' }` is set in preview, so violations fail.
4. Generate the Figma component set from the story matrix.
5. Screenshot the Figma result and compare against the story.

### Defaults

A prop default in code becomes the property default in Figma, so opening the component in
Figma shows what rendering it with no props shows. `build-contract.mjs` reads defaults out
of the source (`size = 'md'`, `showBar = true`) and `figma:check` asserts them, but only
where code declares one. A prop with no default leaves Figma free to carry whatever
placeholder text reads best.

**Figma picks the top-left variant as the default.** Not the first child, not the order
passed to `combineAsVariants`. Both were tried and neither moves it. So the variant matching
the code default has to sit leftmost in the set, which is why `Mark` reads md, sm, lg rather
than sm, md, lg. `figma:check` names this in the error when a variant default drifts.

### Naming parity

This is the rule everything else depends on:

| Code | Storybook | Figma |
|---|---|---|
| prop name `variant` | arg `variant` | component property `variant` |
| prop value `'primary'` | arg value `'primary'` | variant value `primary` |
| optional prop `meta?` | arg `meta` | boolean property `meta` |
| component `SectionHeader` | title `Components/SectionHeader` | component `SectionHeader` |
| token `--color-sample` | n/a | variable `color/sample` |

Case matches exactly. When the names match, generating the Figma set is mechanical and drift
detection is a string comparison. When they drift, every later step becomes a judgement call.

## Mirroring to Figma

The Figma MCP server drives this, using the `figma-generate-library` and `figma-use` skills.
Order is fixed: variables, then styles, then components. A component cannot bind to a token
that does not exist yet.

1. Variables from `tokens/figma-variables.json` into one collection named `specimen_`, mode
   `Value`. Scopes and code syntax come from the manifest, so they are never typed by hand.
2. Text styles from the `text/*` and `tracking/*` tokens, in IBM Plex Mono.
3. Foundations pages: colour swatches, type specimen, spacing bars. These mirror the
   `Foundations/Tokens` stories.
4. One page per component. Auto-layout bound to spacing variables, fills bound to colour
   variables, no hardcoded values.

## Linking without Code Connect

Three substitutes, in order of value:

1. Variable code syntax, already set from the manifest. Dev Mode shows `var(--color-sample)`.
2. Component description in Figma carries the import path and the Storybook URL, for example
   `import { SectionHeader } from '@/components/ui/SectionHeader'` plus
   `http://localhost:6006/?path=/story/components-sectionheader`.
3. A link to the published Storybook on the library cover page.

## Drift checks

| Check | Runs | Catches |
|---|---|---|
| `npm run tokens` then `git diff --exit-code` | CI | generated files edited by hand |
| `npm run typecheck` | CI | prop changes that break stories |
| a11y addon set to `error` | Storybook | contrast and labelling regressions |
| Figma screenshot against story | per component, manual | visual divergence |
| story arg names against Figma component properties | per component, manual | naming drift |

## Commands

```bash
npm run ds:build          # tokens + contract in one go
npm run test:figma-check  # run the drift checker against a stub API, no token needed
npm run tokens            # rebuild generated CSS and the Figma manifest
npm run contract          # rebuild tokens/component-contract.json from the stories
npm run figma:check       # compare the Figma file against the contract
npm run storybook         # dev server on :6006
npm run build-storybook   # static build
npm run typecheck
```

`test:figma-check` runs the checker against a stub Figma API built from the current
contract, covering a clean file, a renamed variant value and a drifted default. It needs no
token and no network, so it can gate CI on its own.

`figma:check` needs two values in `.env.local`, listed in `.env.example`:
a `FIGMA_TOKEN` personal access token with File content scope set to Read, and
`FIGMA_FILE_KEY`, which is already filled in.

## Continuous integration

`.github/workflows/design-system.yml` runs on push and pull request:

1. `npm run ds:build`, then `git diff --exit-code` on the generated files, including
   `packages/tokens/dist`. If
   regenerating changes anything, a generated file was edited by hand or a source change
   was committed without rebuilding. For that diff to mean anything the generators have to
   be deterministic, so the manifests carry a `sourceHash` (sha256 of their inputs) rather
   than a build date. A date would have failed this check on every day after the commit.
2. `npm run test:figma-check`, which exercises the drift checker against a stub API.
3. `npm run typecheck`.
4. A separate job builds Storybook and uploads it as an artifact.

`.github/workflows/publish-tokens.yml` publishes `@specimen/tokens` when a tag named
`tokens-v<version>` is pushed. It rebuilds and diffs the package first and refuses a tag that
does not match `packages/tokens/package.json`. It needs an `NPM_TOKEN` secret, and npm
provenance only works once the repository is public.

`.github/workflows/figma-drift.yml` runs `figma:check` against the live file weekly and on
demand. It is scheduled rather than hooked to a push because drift arrives from someone
editing Figma, which produces no commit. It needs a `FIGMA_TOKEN` repository secret and a
`FIGMA_FILE_KEY` repository variable. Exit code 2 is reported as a warning, not a failure:
an unreachable API is not a design system violation.

## What B2B SaaS still needs

Light mode, the spacing range and the border weights are done. What is left:

| Gap | Why it matters |
|---|---|
| **Status colours are thin** | `danger` and `warn` exist. There is no success, no info, and no low-emphasis background for any of them, which every table, toast and form validation state needs. Roughly 8 more semantic tokens over 4 more primitives. |
| **No form state colours** | Disabled, readonly and invalid all currently fall back to opacity. |
| **No elevation** | Surfaces separate with a 1px line and there are no shadows. Menus, popovers and modals sit above content and need something. Staying flat is a legitimate answer, but it has to be a decision. |
| **One density** | Product tables usually need a compact row height alongside the default. The spacing steps now exist to express it; nothing consumes them yet. |

None of these change the pipeline. They are new tokens flowing through the same generator,
and the checker holds the Figma side to whatever gets decided.

## Writing and type in components (6 October 2026)

- **Sentence case** for every piece of copy: buttons, tabs, menu items, titles, captions,
  helper text, story args. "specimen" stays lowercase as the brand name (SPC-BRAND-001 §05).
  Helper text that is a full sentence ends with a full stop.
- **Capitals only for structural labels**, through CSS or Figma text case rather than typed:
  form field labels, table column headers, and Tag. Tabs, close controls, the Popover heading
  and Command Menu group labels moved from capitals to sentence case.
- **Mono leads, Archivo explains** (brand §04). Descriptions, hints, errors, a Dialog's
  description and empty states are set in Archivo; labels, values and controls stay in Plex
  Mono. Figma binds the same layers to `font/text`.
- **Helper text is `muted`, not `faint`.** Faint fails AA on the surface fill; muted passes on
  canvas and surface. Faint is for placeholders only.

## Corners and surfaces (6 October 2026)

| Role | Value | Used on |
|---|---|---|
| `radius-none` | 0 | rules, table cells, tabs, page frames |
| `radius-sm` | 4px | Button, Field, Select, Textarea, Checkbox, Tag, Tooltip, menu items and command options |
| `radius-md` | 8px | Dialog, Popover, Menu, Toast, Command Menu, docs previews and code blocks |
| `radius-full` | round | the dot, Radio, the Switch track and thumb |

The Switch thumb is now the specimen dot on a pill track. Secondary and ghost buttons fill
with `surface` on hover rather than only changing their border or text, the way PrimeNG's
outlined and text buttons do. Overlays stay flat: no shadow tokens, per brand §06.

## The tokens package

`packages/tokens` is `@specimen/tokens`. `npm run tokens` writes its `dist/` alongside the
site's CSS and the Figma manifest, from the same data in the same run:

| File | Holds |
|---|---|
| `tailwind.css` | byte-identical to `src/app/tokens.generated.css` |
| `tokens.css` | the same variables as plain custom properties, no `@theme` |
| `tokens.json` | a copy of the DTCG source |
| `figma-variables.json` | a copy of the Figma manifest |

Tailwind v4's `duration-*` utilities read `--transition-duration-*`, not `--duration-*`, so
until 4 Oct 2026 `duration-fast` generated nothing and fell back to Tailwind's 150ms default
(the same value, which is why nobody noticed). Border widths have the same problem:
Tailwind reads `border-hairline` and `border-l-accent` from `--border-width-*`. The generator
now emits a `--transition-duration-*` alias per duration role and a `--border-width-*` alias
per border role, in the Tailwind output only.

## Slots and handlers in the contract

`children` maps to a Figma SLOT property: a dialog's body or a tooltip's trigger is open
content, not one swappable part. Any other node prop is still an INSTANCE_SWAP. Event
handlers (`onClose`, `onDismiss`) map to `NONE`, like data props: a designer cannot set them.
Toast draws its close control on every variant for that reason, and says so in its
description.

Popover and Menu take a `trigger` prop, which is a single swappable part, so it maps to an
INSTANCE_SWAP with a secondary sm Button as the default. Both use the native `popover`
attribute: the browser puts the panel in the top layer and handles Escape and outside clicks.
`useAnchoredPopover` positions the panel against its trigger, because CSS anchor positioning
is not in every browser yet.

`faint` clears AA on `canvas` (4.59:1) but not on `surface`, the fill of every overlay. Text
inside Dialog, Popover, Menu, Toast and CommandMenu uses `muted` for anything secondary.
The form components (Checkbox, Radio, Switch descriptions; Field, Select, Textarea hints) use
`faint` and sit on canvas today; one placed inside a Popover would fall below AA. Open design
call: either those move to `muted`, or `faint` gets a surface-safe value.

## TypeScript is pinned to 5.x

`typescript` is `^5.9.3`, not the 7.x native preview, and that is a deliberate floor rather
than staleness. Three things broke on 7:

1. `react-docgen-typescript` reads `ts.JsxEmit` at import time, which 7's CommonJS surface
   no longer exposes, so it threw before parsing anything.
2. `tsconfck`, reached through `vite-tsconfig-paths`, declares `peerDependencies:
   { typescript: "^5.0.0" }`. With 7 at the root npm has to install a second nested copy at
   5.9.3, and a lockfile written without that entry fails `npm ci` with
   `Missing: typescript@5.9.3 from lock file`. That is what broke CI.
3. `tsc` came as a per-platform native binary, so `npm run typecheck` only ran on the
   machine the packages were installed for.

On 5.9.3 all three go away, and both docgen paths can use the same engine:
`scripts/build-contract.mjs` and Storybook's prop tables now both run
`react-docgen-typescript`, so the table a designer reads and the contract the Figma library
is built from come from one parse. The generated contract was byte-identical across the
switch, which is the check that it was safe.

If 7.x is worth revisiting later, the blocker to watch is `react-docgen-typescript`.

## Environment note

`node_modules` holds win32 native binaries (TypeScript, rollup, esbuild, Next's SWC), so
`npm run storybook`, `npm run typecheck` and `npm run build-storybook` run on Windows only.
The pure-JS scripts (`tokens`, `contract`, `figma:check`) run anywhere.

If a remote session installs packages into this repo it will pull Linux binaries and prune
the win32 ones. Running `npm install` on Windows afterwards puts them back.

## Status and form-state colour (10 Sep 2026)

Ten semantic roles and twelve primitives were added so product UI has somewhere to put
state. Every pair below was measured before it was chosen.

| Role | Light | Dark | Use |
|---|---|---|---|
| `success` | green/800 | green/500 | success text and borders. The brand green doing its job as a status |
| `info` | blue/700 | blue/400 | informational text and borders. The only hue that is not brand or red/amber |
| `danger-subtle`, `warn-subtle`, `success-subtle`, `info-subtle` | */50 | */900 | low-emphasis surfaces for inline alerts, invalid rows, toasts. Always with the matching text colour over them, all at or above 4.6:1 |
| `danger-fill` | red/700 | red/700 | destructive confirm as a surface. Paper on it at 5.92:1; the base red/500 only managed 4.09 |
| `danger-hover` | red/800 | red/800 | hover and pressed on a danger fill |
| `on-danger` | paper/50 | paper/50 | text on danger-fill |
| `disabled` | grey/250 | ink/600 | text and border of a disabled control, about 3.3:1 in both modes. Replaces opacity |

Two existing light-mode aliases moved in the same pass: `sample-pressed` was green/800, where
ink on it measured 3.38:1, and is now green/700 (5.45:1); `sample-hover` moved off green/700
onto a new green/600 so hover and pressed stay distinct.

## Components: Button, Field, Tag

Three components with stories, extracted from the shapes the signup form and the admin
already used rather than invented. The signup form now renders `Button`.

| Component | Contract | Figma |
|---|---|---|
| `Button` | `label` TEXT, `variant` VARIANT (primary, secondary, ghost, danger), `size` VARIANT (md, sm), `disabled` BOOLEAN | 8-variant set. `disabled` toggles a "disabled" layer inside each variant that draws the inert state, since a boolean in code has to stay a boolean in Figma |
| `Field` | `label` TEXT; `placeholder`, `hint`, `error` TEXT + `...Visible`; `required`, `disabled`, `readOnly` BOOLEAN | single component. State booleans toggle "state / *" layers inside the input; the rest border lives on its own bottom layer because a frame paints its stroke above its children |
| `Tag` | `label` TEXT, `tone` VARIANT (sample, muted, success, info, warn, danger) | 6-variant set, Text/Tag style |
| `Checkbox` | `label` TEXT; `description` TEXT + `descriptionVisible`; `checked`, `disabled` BOOLEAN | single component. 16px box bound to spacing/lg; `checked` shows a fill-and-tick layer in the box, `disabled` a layer over the whole component |
| `Select` | `label` TEXT; `placeholder`, `hint`, `error` TEXT + `...Visible`; `required`, `disabled` BOOLEAN; `options` is a data prop | single component drawn to match Field, chevron as a stroke. `options` has no Figma property |

`figma:check` passed against the live file with no drift after the build.

## Data props have no Figma property

A prop whose type is an array or object (`options: SelectOption[]`, a table's rows) is
content rather than a property a designer sets, and Figma has no list property to map it
to. `build-contract` marks such props `figmaType: NONE` and the checker and its stub skip
them. The Figma component shows a representative value instead.

## Three design calls, closed 10 Sep 2026

| Question | Decision | Reason |
|---|---|---|
| Elevation | Stay flat | SPC-BRAND-001 §06: no drop shadows, structure comes from lines. Menus, popovers and dialogs will separate with `surface` fill, `line-strong` stroke and a scrim, added when Dialog lands |
| Control radius | 4px on controls, 8px on panels (changed 6 Oct 2026) | Callum asked for a rounder, PrimeNG-like feel. The values come from the mark's own 4px corner, so the system still reads as specimen. Rules, table cells and tabs stay square; the dot family is round. Was `radius/none` from 10 Sep. SPC-BRAND-001 v1.2 §07 |
| Density | A `density` prop on Table, not a global mode | The spacing steps already express compact rows; nothing else needs a second density |
