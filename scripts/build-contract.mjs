#!/usr/bin/env node
/**
 * build-contract.mjs — specimen_ component contract
 *
 * Reads  src/**\/*.stories.tsx and the components they point at
 * Writes tokens/component-contract.json
 *
 * The contract is the machine-readable spec the Figma library is built to and
 * checked against. Prop names, types and story args in, Figma component
 * property definitions out. Nothing here is hand-maintained.
 *
 * Run with: npm run contract
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { resolve, dirname, relative, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { parse as parseBabel } from '@babel/parser'
import docgen from 'react-docgen-typescript'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC_DIR = resolve(root, 'src')
const OUT = resolve(root, 'tokens/component-contract.json')
const REGISTRY_OUT = resolve(root, 'src/app/docs/stories.generated.ts')

const BABEL = { sourceType: 'module', plugins: ['typescript', 'jsx'] }

/**
 * react-docgen-typescript, not react-docgen. It reads the real TypeScript types rather
 * than what babel can infer from the annotation in front of it, so an aliased or imported
 * prop type resolves, and it is the same engine Storybook's prop tables use. Both sides of
 * the contract therefore come from one parse. It needs the TypeScript compiler API, which
 * is why this repo pins typescript to 5.x: the 7.x native preview does not expose it.
 */
const parser = docgen.withCompilerOptions(
  { esModuleInterop: true, jsx: 4, strict: true },
  {
    savePropValueAsString: true,
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
    // Props inherited from React's own HTML types are noise in a design system contract.
    propFilter: (prop) => !/node_modules/.test(prop.parent?.fileName ?? ''),
  },
)

/* ---------------------------------------------------------------- helpers */

const PRO_DIR = resolve(root, 'src/components/pro')

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    // Pro components are a paid product with their own catalogue. They never enter the public
    // contract, which is mirrored to the open-source repository and drives the Basic Figma file.
    if (statSync(full).isDirectory()) { if (full !== PRO_DIR) walk(full, out) }
    else if (/\.stories\.tsx?$/.test(entry)) out.push(full)
  }
  return out
}

/** Static evaluation of a story arg. Anything dynamic is recorded, not guessed. */
function literal(node) {
  if (!node) return undefined
  switch (node.type) {
    case 'StringLiteral':
    case 'NumericLiteral':
    case 'BooleanLiteral':
      return node.value
    case 'NullLiteral':
      return null
    case 'UnaryExpression':
      return node.operator === '-' ? -literal(node.argument) : { $dynamic: node.operator }
    case 'TemplateLiteral':
      return node.expressions.length === 0 ? node.quasis.map((q) => q.value.cooked).join('') : { $dynamic: 'template' }
    case 'ArrayExpression':
      return node.elements.map(literal)
    case 'ObjectExpression':
      return Object.fromEntries(
        node.properties
          .filter((p) => p.type === 'ObjectProperty' && !p.computed)
          .map((p) => [p.key.name ?? p.key.value, literal(p.value)]),
      )
    default:
      return { $dynamic: node.type }
  }
}

const objectProp = (objectExpression, name) =>
  objectExpression?.properties?.find(
    (p) => p.type === 'ObjectProperty' && !p.computed && (p.key.name ?? p.key.value) === name,
  )?.value

/** Unwrap `{...} satisfies Meta<...>` and `{...} as const`. */
const unwrap = (node) =>
  node?.type === 'TSSatisfiesExpression' || node?.type === 'TSAsExpression' ? unwrap(node.expression) : node

/* ------------------------------------------------------- story file parse */

function readStoryFile(file) {
  const ast = parseBabel(readFileSync(file, 'utf8'), BABEL)
  const imports = new Map() // local name -> module specifier
  let metaName = null
  let metaObject = null
  const declarations = new Map() // const name -> init node
  const stories = []

  for (const node of ast.program.body) {
    if (node.type === 'ImportDeclaration') {
      for (const spec of node.specifiers) imports.set(spec.local.name, node.source.value)
    }
    if (node.type === 'VariableDeclaration') {
      for (const d of node.declarations) if (d.id.type === 'Identifier') declarations.set(d.id.name, unwrap(d.init))
    }
    if (node.type === 'ExportDefaultDeclaration') {
      const d = node.declaration
      if (d.type === 'Identifier') metaName = d.name
      else metaObject = unwrap(d)
    }
    if (node.type === 'ExportNamedDeclaration' && node.declaration?.type === 'VariableDeclaration') {
      for (const d of node.declaration.declarations) {
        if (d.id.type !== 'Identifier') continue
        const init = unwrap(d.init)
        declarations.set(d.id.name, init)
        if (d.id.name !== metaName) {
          stories.push({
            name: d.id.name,
            args: init?.type === 'ObjectExpression' ? (literal(objectProp(init, 'args')) ?? {}) : {},
          })
        }
      }
    }
  }

  if (!metaObject && metaName) metaObject = declarations.get(metaName)
  const titleNode = objectProp(metaObject, 'title')
  const componentNode = objectProp(metaObject, 'component')

  return {
    title: titleNode?.type === 'StringLiteral' ? titleNode.value : null,
    componentName: componentNode?.type === 'Identifier' ? componentNode.name : null,
    componentSource: componentNode?.type === 'Identifier' ? imports.get(componentNode.name) : null,
    stories: stories.filter((s) => s.name !== 'default'),
  }
}

/* ------------------------------------------------------------- prop types */

function resolveComponentFile(storyFile, specifier) {
  if (!specifier) return null
  const base = specifier.startsWith('@/')
    ? resolve(SRC_DIR, specifier.slice(2))
    : resolve(dirname(storyFile), specifier)
  for (const ext of ['.tsx', '.ts', '/index.tsx', '/index.ts']) {
    if (existsSync(base + ext)) return base + ext
  }
  return existsSync(base) ? base : null
}

const docCache = new Map()
function docOf(componentFile, componentName) {
  if (!docCache.has(componentFile)) docCache.set(componentFile, parser.parse([componentFile]))
  const docs = docCache.get(componentFile)
  return docs.find((d) => d.displayName === componentName) ?? docs[0]
}
const propsOf = (componentFile, componentName) => docOf(componentFile, componentName)?.props ?? {}

const unquote = (v) => String(v).replace(/^['"`]|['"`]$/g, '')

/** Flatten a react-docgen-typescript type into a plain name plus literal union values. */
function typeOf(type) {
  if (!type) return { type: 'unknown', values: null }
  if (type.name === 'enum' && Array.isArray(type.value)) {
    const values = type.value.map((v) => unquote(v.value))
    // A boolean reaches here as `false | true` when it is optional.
    if (values.every((v) => v === 'true' || v === 'false')) return { type: 'boolean', values: null }
    return { type: 'enum', values }
  }
  // Generic forms (ReactElement<{ ... }>) arrive with the type argument in the name.
  if (/^(React\.)?(ReactNode|ReactElement)\b/.test(type.name ?? '')) return { type: 'node', values: null }
  return { type: type.name ?? 'unknown', values: null }
}

/**
 * react-docgen reports defaults as source text: "'md'", "true", "17". Turn that back
 * into a value so the Figma property default can match the code default instead of
 * being guessed at.
 */
function parseDefault(raw, type) {
  if (raw === undefined || raw === null) return undefined
  const text = String(raw).trim()
  if (text === 'true') return true
  if (text === 'false') return false
  if (text === 'null' || text === 'undefined') return null
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text)
  const quoted = text.match(/^['"`](.*)['"`]$/s)
  if (quoted) return quoted[1]
  // react-docgen-typescript hands string defaults back unquoted, so a bare token that is
  // one of the declared values is a string, not an expression it failed to evaluate.
  if (type && (type.type === 'string' || (type.values ?? []).includes(text))) return text
  return { $expression: text }
}

/**
 * Prop -> Figma component property. This mapping is the whole point of the file:
 * it is what the Figma build reads, and what the drift check compares against.
 * A prop's default in code becomes the property's default in Figma, so opening the
 * component in Figma shows what rendering it with no props would show.
 */
function figmaProperty(name, { type, values }, required, codeDefault) {
  const fallback = (v) => (codeDefault === undefined ? v : codeDefault)

  // Data props (arrays, objects) have no Figma equivalent: a select's options list or a
  // table's rows are content, not a property a designer sets. The Figma component shows
  // a representative value and the checker ignores the prop.
  if (/\[\]$|^Array<|^Record<|^\{/.test(type)) return { name, figmaType: 'NONE', values: null, defaultValue: null, note: 'data prop, no Figma property' }

  // Numbers (a page, a step, a minimum) are content like data props: the library draws a
  // representative value, and Figma has no number property to bind them to.
  if (type === 'number') return { name, figmaType: 'NONE', values: null, defaultValue: null, note: 'number, no Figma property' }

  // Event handlers are behaviour. A designer cannot set onClose, and Figma has nowhere to put it.
  if (/=>/.test(type)) return { name, figmaType: 'NONE', values: null, defaultValue: null, note: 'handler, no Figma property' }

  // A union of number literals (a heading level, 2 | 3 | 4) is still a number: it sets
  // structure, not a look, and it goes the same way as plain numbers.
  if (type === 'enum' && values.every((v) => /^-?\d+(\.\d+)?$/.test(String(v)))) {
    return { name, figmaType: 'NONE', values: null, defaultValue: null, note: 'number, no Figma property' }
  }

  if (type === 'enum') {
    const def = values.includes(codeDefault) ? codeDefault : values[0]
    return { name, figmaType: 'VARIANT', values, defaultValue: def }
  }
  if (type === 'boolean') return { name, figmaType: 'BOOLEAN', values: null, defaultValue: fallback(false) }
  // children is open content (a dialog body, a tooltip's trigger): a Figma slot takes any
  // layers. Any other node prop is a single swappable part, which is an instance swap.
  if (type === 'node') {
    return name === 'children'
      ? { name, figmaType: 'SLOT', values: null, defaultValue: null }
      : { name, figmaType: 'INSTANCE_SWAP', values: null, defaultValue: null }
  }
  if (type === 'string') {
    // An optional string is a slot that can be absent, so it needs a visibility toggle
    // alongside the text property. Figma has no "optional text", only BOOLEAN + TEXT.
    return required
      ? { name, figmaType: 'TEXT', values: null, defaultValue: fallback('') }
      : { name, figmaType: 'TEXT', values: null, defaultValue: fallback(''), companionBoolean: `${name}Visible` }
  }
  return { name, figmaType: 'TEXT', values: null, defaultValue: fallback(''), note: `unmapped type: ${type}` }
}

/* ------------------------------------------------------------------ build */

const storyFiles = walk(SRC_DIR).sort()
const components = []
const skipped = []
const sources = new Set() // every file the contract was derived from, for the source hash

for (const file of storyFiles) {
  const rel = relative(root, file).replace(/\\/g, '/')
  const meta = readStoryFile(file)
  if (!meta.componentName) {
    skipped.push({ file: rel, reason: 'no `component` in meta (docs-only story)' })
    continue
  }
  const componentFile = resolveComponentFile(file, meta.componentSource)
  if (!componentFile) {
    skipped.push({ file: rel, reason: `could not resolve import "${meta.componentSource}"` })
    continue
  }

  sources.add(file)
  sources.add(componentFile)

  const rawProps = propsOf(componentFile, meta.componentName)
  const props = Object.entries(rawProps).map(([name, p]) => {
    const t = typeOf(p.type)
    const codeDefault = parseDefault(p.defaultValue && p.defaultValue.value, t)
    return {
      name,
      type: t.type,
      values: t.values,
      required: Boolean(p.required),
      default: codeDefault === undefined ? null : codeDefault,
      description: p.description || null,
      figma: figmaProperty(name, t, Boolean(p.required), codeDefault),
    }
  })

  components.push({
    name: meta.componentName,
    // The JSDoc above the component: what it is for. The docs page leads with it.
    description: docOf(componentFile, meta.componentName)?.description?.trim() || null,
    storybookTitle: meta.title,
    source: relative(root, componentFile).replace(/\\/g, '/'),
    storyFile: rel,
    importPath: `@/${relative(SRC_DIR, componentFile).replace(/\\/g, '/').replace(/\.tsx?$/, '')}`,
    props,
    stories: meta.stories,
    // Every variant combination the Figma component set must contain.
    variantAxes: props.filter((p) => p.figma.figmaType === 'VARIANT').map((p) => ({ name: p.name, values: p.values })),
  })
}

const variantCount = (c) => c.variantAxes.reduce((n, a) => n * a.values.length, 1)

// Stamped instead of a date, so regenerating from the same stories and components is
// byte-identical and CI's "generated files match their sources" diff stays deterministic.
const hash = createHash('sha256')
for (const f of [...sources].sort()) hash.update(relative(root, f).replace(/\\/g, '/')).update('\0').update(readFileSync(f))
const sourceHash = hash.digest('hex').slice(0, 12)

writeFileSync(
  OUT,
  `${JSON.stringify(
    {
      $comment: 'GENERATED FILE — DO NOT EDIT. Source: src/**/*.stories.tsx. Rebuild: npm run contract.',
      sourceHash,
      components: components.map((c) => ({ ...c, expectedVariantCount: variantCount(c) })),
      skipped,
    },
    null,
    2,
  )}\n`,
  'utf8',
)

// The docs site renders each component's real stories, so it needs a static import of
// every story module. Generated from the same walk as the contract, so a component
// cannot be in the contract and missing from the docs, or the other way round.
const registry = components
  .map((c) => ({ name: c.name, spec: `@/${relative(SRC_DIR, resolve(root, c.storyFile)).replace(/\\/g, '/').replace(/\.tsx?$/, '')}` }))
  .sort((a, b) => a.name.localeCompare(b.name))
// The public design-system repository has no docs site, so the registry is only written
// where the docs live.
if (existsSync(dirname(REGISTRY_OUT))) writeFileSync(
  REGISTRY_OUT,
  [
    '// GENERATED FILE - DO NOT EDIT. Source: src/**/*.stories.tsx. Rebuild: npm run contract.',
    ...registry.map((r) => `import * as ${r.name} from '${r.spec}'`),
    '',
    'export const storyModules = {',
    ...registry.map((r) => `  ${r.name},`),
    '}',
    '',
  ].join('\n'),
  'utf8',
)

console.log(
  `contract: ${components.length} components (${components.reduce((n, c) => n + c.props.length, 0)} props, ` +
    `${components.reduce((n, c) => n + c.stories.length, 0)} stories) -> tokens/component-contract.json`,
)
for (const s of skipped) console.log(`  skipped ${s.file}: ${s.reason}`)
