#!/usr/bin/env node
/**
 * build-tokens.mjs - specimen_ token pipeline
 *
 * Reads  tokens/specimen.tokens.json   (W3C DTCG, hand-edited, source of truth)
 * Writes src/app/tokens.generated.css  (primitives, both themes, the Tailwind theme)
 *        tokens/figma-variables.json   (manifest consumed by the Figma variable build)
 *        packages/tokens/dist/*        (the @specimen.systems/tokens npm package, see its README)
 *
 * Two layers, all the way down:
 *   primitive.*   raw values with no meaning. Plain :root custom properties under --p-*,
 *                 no Tailwind utilities, every Figma scope empty.
 *   everything    a role that aliases exactly one primitive. Colour carries a value per
 *   else          theme; the rest are single-valued.
 *
 * Dark is the default theme. `data-theme` on the html element picks one explicitly; with
 * no attribute the page follows `prefers-color-scheme`. The site sets data-theme="dark".
 *
 * Run with: npm run tokens
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = resolve(root, 'tokens/specimen.tokens.json')
const CSS_OUT = resolve(root, 'src/app/tokens.generated.css')
const FIGMA_OUT = resolve(root, 'tokens/figma-variables.json')
const PKG_DIST = resolve(root, 'packages/tokens/dist')

// Stamped into the manifest instead of a date, so regenerating from the same source is
// byte-identical and CI's "generated files match their sources" diff stays deterministic.
const sourceHash = createHash('sha256').update(readFileSync(SRC)).digest('hex').slice(0, 12)

const THEMES = ['dark', 'light']
const DEFAULT_THEME = 'dark'

/** DTCG group -> Tailwind v4 theme namespace. */
const NAMESPACE = {
  color: 'color', font: 'font', text: 'text', tracking: 'tracking', spacing: 'spacing',
  radius: 'radius', border: 'border', ease: 'ease', duration: 'duration', leading: 'leading',
  breakpoint: 'breakpoint',
  // Tailwind's container namespace drives max-w-*, so measure-* names keep the utilities
  // readable (max-w-measure-lg) without shadowing max-w-sm and friends.
  measure: 'container',
}

/**
 * Tailwind compiles --breakpoint-* into `@media (min-width: ...)`, and a media query
 * cannot read a custom property. Breakpoints therefore inline their primitive's literal
 * value instead of pointing at it. The Figma side still aliases, where it costs nothing.
 */
const INLINE_LITERAL = new Set(['breakpoint'])

const FIGMA_TYPE = {
  color: 'COLOR', dimension: 'FLOAT', fontFamily: 'STRING',
  cubicBezier: 'EASING', duration: 'TIMING', number: 'FLOAT',
}

const isToken = (node) => node !== null && typeof node === 'object' && '$value' in node
const rowsOf = (node) => Object.entries(node ?? {}).filter(([k, v]) => !k.startsWith('$') && isToken(v))
const groupsOf = (node) => Object.entries(node ?? {}).filter(([k, v]) => !k.startsWith('$') && !isToken(v) && typeof v === 'object')

const tokens = JSON.parse(readFileSync(SRC, 'utf8'))

/* ------------------------------------------------------------- primitives */

/** path "color.ink.950" -> { cssVar, figmaName, value, type, ... } */
const primitives = new Map()

const collectPrimitives = (node, trail, inheritedType) => {
  const type = node.$type ?? inheritedType
  for (const [key, token] of rowsOf(node)) {
    const path = [...trail, key]
    primitives.set(path.join('.'), {
      path,
      cssVar: `--p-${path.join('-')}`,
      figmaName: path.join('/'),
      value: token.$value,
      type: token.$type ?? type,
      description: token.$description ?? '',
      figmaFamily: token.$extensions?.['com.figma']?.figmaFamily,
    })
  }
  for (const [key, child] of groupsOf(node)) collectPrimitives(child, [...trail, key], type)
}
collectPrimitives(tokens.primitive, [], tokens.primitive?.$type)

const aliasTarget = (value) => {
  const m = String(value).match(/^\{primitive\.(.+)\}$/)
  if (!m) return null
  if (!primitives.has(m[1])) throw new Error(`Alias points at a primitive that does not exist: ${value}`)
  return primitives.get(m[1])
}

const requireAlias = (label, value) => {
  const target = aliasTarget(value)
  if (!target) throw new Error(`${label} must alias a primitive, got ${JSON.stringify(value)}`)
  return target
}

/* ----------------------------------------------------------- value shaping */

const cssValue = (value, type) =>
  type === 'cubicBezier' && Array.isArray(value) ? `cubic-bezier(${value.join(', ')})` : String(value)

const figmaValue = (value, type, figmaFamily) => {
  if (type === 'color') return value
  if (type === 'fontFamily') return figmaFamily ?? String(value).split(',')[0].trim()
  if (type === 'cubicBezier') {
    const [x1, y1, x2, y2] = value
    return { type: 'CUSTOM_CUBIC_BEZIER', easingFunctionCubicBezier: { x1, y1, x2, y2 } }
  }
  const raw = String(value)
  const px = raw.match(/^(-?[\d.]+)px$/)
  if (px) return { value: Number(px[1]), unit: 'PIXELS' }
  const em = raw.match(/^(-?[\d.]+)em$/)
  if (em) return { value: Number(em[1]) * 100, unit: 'PERCENT' }
  const ms = raw.match(/^(-?[\d.]+)ms$/)
  if (ms) return Number(ms[1]) / 1000
  if (/^-?[\d.]+$/.test(raw)) return Number(raw)
  return raw
}

const shaped = (p) => {
  const converted = figmaValue(p.value, p.type, p.figmaFamily)
  const hasUnit = converted !== null && typeof converted === 'object' && 'unit' in converted
  return { value: hasUnit ? converted.value : converted, unit: hasUnit ? converted.unit : null }
}

/* --------------------------------------------------------- semantic colour */

const semanticColor = []
for (const [name, token] of rowsOf(tokens.color)) {
  const modes = token.$extensions?.modes
  if (!modes) throw new Error(`Semantic colour ${name} has no modes block`)
  const perTheme = {}
  for (const theme of THEMES) perTheme[theme] = requireAlias(`color/${name} (${theme})`, modes[theme])
  semanticColor.push({
    name,
    cssVar: `--color-${name}`,
    themeVar: `--c-${name}`,
    perTheme,
    scopes: token.$extensions?.['com.figma']?.scopes ?? [],
    description: token.$description ?? '',
  })
}

/* ---------------------------------------------------------- semantic scale */

const semanticScale = []
for (const [group, node] of Object.entries(tokens)) {
  if (group.startsWith('$') || group === 'primitive' || group === 'color') continue
  const ns = NAMESPACE[group]
  if (!ns) throw new Error(`No Tailwind namespace mapped for token group "${group}"`)
  for (const [name, token] of rowsOf(node)) {
    const target = requireAlias(`${group}/${name}`, token.$value)
    semanticScale.push({
      group,
      name,
      figmaName: `${group}/${name.startsWith(`${group}-`) ? name.slice(group.length + 1) : name}`,
      cssVar: `--${ns}-${name}`,
      target,
      inlineLiteral: INLINE_LITERAL.has(group),
      scopes: token.$extensions?.['com.figma']?.scopes ?? [],
      description: token.$description ?? node.$description ?? '',
    })
  }
}

/* ------------------------------------------------------------------- css */

const themeBlock = (theme, selector) =>
  [
    `${selector} {`,
    `  color-scheme: ${theme};`,
    ...semanticColor.map((s) => `  ${s.themeVar}: var(${s.perTheme[theme].cssVar});`),
    '}',
  ].join('\n')

const scaleLines = []
let lastGroup = null
for (const s of semanticScale) {
  if (s.group !== lastGroup) {
    if (lastGroup !== null) scaleLines.push('')
    const note = (tokens[s.group].$description ?? '').replace(/\*\//g, '* /').replace(/\/\*/g, '/ *')
    scaleLines.push(note ? `  /* ${s.group}: ${note} */` : `  /* ${s.group} */`)
    lastGroup = s.group
  }
  const value = s.inlineLiteral
    ? `${cssValue(s.target.value, s.target.type)} /* ${s.target.cssVar} */`
    : `var(${s.target.cssVar})`
  scaleLines.push(`  ${s.cssVar}: ${value};`)
}

/**
 * Two utility families read a different namespace from the role's own name: duration-*
 * reads --transition-duration-*, and border widths (border-hairline, border-l-accent)
 * read --border-width-*. The roles keep their names everywhere else (Figma, globals.css,
 * the plain package CSS); this block only makes the utilities resolve to the tokens.
 */
const UTILITY_ALIAS = { duration: 'transition-duration', border: 'border-width' }
const aliased = semanticScale.filter((s) => UTILITY_ALIAS[s.group])
const tailwindAliases = aliased.length
  ? [
      '/* Utility aliases. duration-* reads --transition-duration-*; border widths read --border-width-*. */',
      '@theme {',
      ...aliased.map((s) => `  --${UTILITY_ALIAS[s.group]}-${s.cssVar.slice(`--${NAMESPACE[s.group]}-`.length)}: var(${s.cssVar});`),
      '}',
      '',
    ]
  : []

const header = [
  '/* ------------------------------------------------------------------',
  '   GENERATED FILE - DO NOT EDIT',
  '   Source: tokens/specimen.tokens.json',
  '   Rebuild: npm run tokens',
  `   ${tokens.$description ?? ''}`,
  '   ------------------------------------------------------------------ */',
  '',
]

const primitiveBlock = [
  '/* Primitives. Raw values, referenced only by the semantic layers below. */',
  ':root {',
  ...[...primitives.values()].map((p) => `  ${p.cssVar}: ${cssValue(p.value, p.type)};`),
  '}',
]

const OTHER_THEME = THEMES.find((t) => t !== DEFAULT_THEME)

const themeBlocks = [
  `/* Semantic colour. ${DEFAULT_THEME} is the default. data-theme on the html element picks a`,
  '   theme explicitly; with no attribute the page follows prefers-color-scheme. */',
  themeBlock(DEFAULT_THEME, ':root'),
  '',
  `@media (prefers-color-scheme: ${OTHER_THEME}) {`,
  themeBlock(OTHER_THEME, ':root:not([data-theme])').replace(/^/gm, '  '),
  '}',
  '',
  ...THEMES.map((theme) => themeBlock(theme, `:root[data-theme="${theme}"]`)),
]

const css = [
  ...header,
  ...primitiveBlock,
  '',
  ...themeBlocks,
  '',
  '/* A plain @theme, not @theme inline. Tailwind then emits --color-* as real custom',
  '   properties, so globals.css and inline styles can read them, and the extra hop',
  '   through --c-* is what makes a utility follow the theme at runtime. */',
  '@theme {',
  ...semanticColor.map((s) => `  ${s.cssVar}: var(${s.themeVar});`),
  '}',
  '',
  '/* Semantic scale. Every value points at a primitive, except the breakpoints:',
  '   Tailwind compiles those into media queries, which cannot read a custom property. */',
  '@theme {',
  scaleLines.join('\n'),
  '}',
  '',
  ...tailwindAliases,
].join('\n')

/* The same variables as plain custom properties, for anyone not on Tailwind v4. */
const plainCss = [
  ...header,
  ...primitiveBlock,
  '',
  ...themeBlocks,
  '',
  '/* Semantic roles. Components read these, never the primitives. */',
  ':root {',
  ...semanticColor.map((s) => `  ${s.cssVar}: var(${s.themeVar});`),
  '',
  scaleLines.join('\n'),
  '}',
  '',
].join('\n')

writeFileSync(CSS_OUT, css, 'utf8')

/* ---------------------------------------------------------------- figma */

const figma = {
  $comment: 'GENERATED FILE - DO NOT EDIT. Source: tokens/specimen.tokens.json. Rebuild: npm run tokens.',
  sourceHash,
  collections: [
    { name: 'specimen_ primitives', modes: ['Value'] },
    { name: 'specimen_ color', modes: ['Light', 'Dark'] },
    { name: 'specimen_ scale', modes: ['Value'] },
  ],
  primitives: [...primitives.values()].map((p) => {
    const { value, unit } = shaped(p)
    return {
      name: p.figmaName,
      collection: 'specimen_ primitives',
      cssVar: p.cssVar,
      dtcgType: p.type,
      figmaType: FIGMA_TYPE[p.type] ?? 'STRING',
      value,
      unit,
      scopes: [],
      codeSyntax: { WEB: `var(${p.cssVar})` },
      description: p.description,
    }
  }),
  semantic: [
    ...semanticColor.map((s) => ({
      name: `color/${s.name}`,
      collection: 'specimen_ color',
      cssVar: s.cssVar,
      figmaType: 'COLOR',
      aliases: { Light: s.perTheme.light.figmaName, Dark: s.perTheme.dark.figmaName },
      scopes: s.scopes,
      codeSyntax: { WEB: `var(${s.cssVar})` },
      description: s.description,
    })),
    ...semanticScale.map((s) => ({
      name: s.figmaName,
      collection: 'specimen_ scale',
      cssVar: s.cssVar,
      figmaType: FIGMA_TYPE[s.target.type] ?? 'STRING',
      aliases: { Value: s.target.figmaName },
      scopes: s.scopes,
      codeSyntax: { WEB: `var(${s.cssVar})` },
      description: s.description,
    })),
  ],
}

writeFileSync(FIGMA_OUT, `${JSON.stringify(figma, null, 2)}\n`, 'utf8')

/* -------------------------------------------------------------- package */

// @specimen.systems/tokens ships the same outputs the site and the Figma file are built from, so
// what is installed can never differ from what the drift check verified.
mkdirSync(PKG_DIST, { recursive: true })
writeFileSync(resolve(PKG_DIST, 'tailwind.css'), css, 'utf8')
writeFileSync(resolve(PKG_DIST, 'tokens.css'), plainCss, 'utf8')
writeFileSync(resolve(PKG_DIST, 'tokens.json'), readFileSync(SRC, 'utf8'), 'utf8')
writeFileSync(resolve(PKG_DIST, 'figma-variables.json'), `${JSON.stringify(figma, null, 2)}\n`, 'utf8')

console.log(
  `tokens: ${primitives.size} primitives, ${semanticColor.length} semantic colours x ${THEMES.length} themes, ` +
    `${semanticScale.length} semantic scale -> src/app/tokens.generated.css + tokens/figma-variables.json + packages/tokens/dist`,
)
