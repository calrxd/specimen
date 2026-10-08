# specimen_

An open-source design system for B2B SaaS product teams. One token file generates the CSS, the Tailwind theme and the Figma library, and a checker fails the build when Figma and the code disagree. The core is MIT licensed; Pro components and the full Figma kit are paid, on [specimen.systems/pricing](https://specimen.systems/pricing). Pre-release; v1.0 is planned for December 2026.

Documentation: [specimen.systems/docs](https://specimen.systems/docs). Storybook: [storybook.specimen.systems](https://storybook.specimen.systems).

## Install

```bash
npm install @specimen.systems/tokens
```

```css
@import "tailwindcss";
@import "@specimen.systems/tokens/tailwind.css";
```

Without Tailwind, import `@specimen.systems/tokens/tokens.css` and read the custom properties, such as `var(--color-surface)`. Dark is the default theme; set `data-theme="light"` on the html element, or leave it off and the page follows the reader's system setting. More in the [package README](packages/tokens).

## Code is the source of truth

```
tokens/specimen.tokens.json  ->  npm run tokens    ->  CSS, Tailwind theme, Figma variable manifest, @specimen.systems/tokens
src/**/*.stories.tsx         ->  npm run contract  ->  tokens/component-contract.json
Figma library                <-  npm run figma:check compares it with the contract
```

Every component exists in code with a Storybook story before it exists in Figma. The stories are the contract: prop names, types, variants and defaults become Figma component properties, and `npm run figma:check` reads the Figma file through the REST API and reports any difference. It runs weekly, because drift arrives from someone editing Figma, which produces no commit. CI also regenerates every generated file on each push and fails if any of them changed, so a hand edit to an output cannot land.

The pipeline, the naming rules and every decision behind them are in [`docs/design-system-pipeline.md`](docs/design-system-pipeline.md).

## What is in it

| | |
|---|---|
| Tokens | 162: 83 primitives, 26 colour roles with a dark and a light value each, 53 scale roles. Every role aliases one primitive. Every colour pair is measured against WCAG 2.2 AA. |
| Components | 51: Button, Field, Textarea, Select, Checkbox, Radio, Switch, Tag, Table, Tabs, Dialog, Popover, Menu, CommandMenu, Toast, Tooltip, SectionHeader, Mark, Wordmark, InputNumber, Password, Slider, SelectButton, Chip, Avatar, AvatarGroup, Badge, Accordion, Card, Divider, Breadcrumb, Paginator, Stepper, Toolbar, PageHeader, Message, ProgressBar, Spinner, Skeleton, Drawer, EmptyState, InputGroup, SplitButton, Fieldset, Listbox, ConfirmDialog, Banner, MeterGroup, Stat, Timeline, DescriptionList. React, in `src/components`. |
| Packages | [`@specimen.systems/tokens`](packages/tokens) |

The look is flat and monospaced: IBM Plex Mono for the voice, Archivo for long text, hairlines for structure, and one green accent used as a signal. Corners come from the mark's own 4px corner: 4px on controls, 8px on panels, round for the dot family. There are no shadows; overlays separate with a surface fill, a stronger line and a scrim.

## Working on the system

```bash
npm install
npm run storybook        # components, both themes, on port 6006
npm run ds:build         # regenerate tokens, CSS, the package and the contract
npm run figma:check      # needs FIGMA_TOKEN and FIGMA_FILE_KEY
```

The checks CI runs: `typecheck`, `build-storybook`, `ds:build` followed by a clean `git diff`, and `test:figma-check`.

## Contributing

Issues are welcome. This repository is published automatically from the source of specimen.systems, so a change lands there and appears here a minute later, rather than by merging a pull request in this repository.

## Licence

MIT, for everything in this repository. Pro components, Pro Blocks and the Pro Figma kit are sold separately under a per-person licence and are not published here; the terms are at [specimen.systems/licence](https://specimen.systems/licence).
