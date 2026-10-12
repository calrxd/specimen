import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import manifest from '../../tokens/figma-variables.json'

/**
 * Rendered from tokens/figma-variables.json, which is generated from
 * tokens/specimen.tokens.json. Every semantic token here points at a primitive,
 * so a wrong value shows up in this page before it reaches Figma.
 */
type Semantic = (typeof manifest.semantic)[number]
type Primitive = (typeof manifest.primitives)[number]

const primitiveByName = new Map<string, Primitive>(manifest.primitives.map((p) => [p.name, p]))

const inGroup = (prefix: string): Semantic[] =>
  manifest.semantic.filter((t) => t.name.startsWith(`${prefix}/`))

/** A semantic token's resolved value, by way of the primitive it aliases. */
const resolved = (token: Semantic): Primitive | undefined => {
  const target = Object.values(token.aliases)[0]
  return typeof target === 'string' ? primitiveByName.get(target) : undefined
}

const Row = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '190px 150px 90px 1fr',
      gap: 'var(--spacing-lg)',
      alignItems: 'center',
      padding: 'var(--spacing-md) 0',
      borderBottom: 'var(--border-hairline) solid var(--color-line)',
    }}
  >
    {children}
  </div>
)

const Name = ({ children }: { children: React.ReactNode }) => (
  <code style={{ fontSize: 'var(--text-label)', color: 'var(--color-ink)' }}>{children}</code>
)

const Alias = ({ children }: { children: React.ReactNode }) => (
  <code style={{ fontSize: 'var(--text-micro)', color: 'var(--color-faint)' }}>{children}</code>
)

const Section = ({
  title,
  count,
  children,
}: {
  title: string
  count: number
  children: React.ReactNode
}) => (
  <section style={{ marginBottom: 'var(--spacing-6xl)' }}>
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        borderBottom: 'var(--border-hairline) solid var(--color-line-strong)',
        paddingBottom: 'var(--spacing-md)',
        marginBottom: 'var(--spacing-lg)',
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: 'var(--text-micro)',
          letterSpacing: 'var(--tracking-label)',
          textTransform: 'uppercase',
          color: 'var(--color-ink)',
        }}
      >
        {title}
      </h2>
      <span style={{ fontSize: 'var(--text-micro)', color: 'var(--color-faint)' }}>
        {count} tokens
      </span>
    </div>
    {children}
  </section>
)

const meta: Meta = {
  title: 'Foundations/Tokens',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Generated from tokens/specimen.tokens.json. Run `npm run tokens` after any edit. Use the theme control in the toolbar to see both modes.',
      },
    },
  },
}
export default meta
type Story = StoryObj

export const Colour: Story = {
  render: () => {
    const semantic = inGroup('color')
    return (
      <div style={{ padding: 'var(--spacing-3xl)' }}>
        <Section title="Semantic" count={semantic.length}>
          {semantic.map((t) => (
            <Row key={t.name}>
              <Name>{t.cssVar}</Name>
              <Alias>
                {'Light' in t.aliases ? `${t.aliases.Light} / ${t.aliases.Dark}` : ''}
              </Alias>
              <div
                style={{
                  width: 72,
                  height: 28,
                  background: `var(${t.cssVar})`,
                  border: 'var(--border-hairline) solid var(--color-line-strong)',
                }}
              />
              <span style={{ fontSize: 'var(--text-label)', color: 'var(--color-muted)' }}>
                {t.description}
              </span>
            </Row>
          ))}
        </Section>

        <Section
          title="Primitives"
          count={manifest.primitives.filter((p) => p.dtcgType === 'color').length}
        >
          {manifest.primitives
            .filter((p) => p.dtcgType === 'color')
            .map((p) => (
              <Row key={p.name}>
                <Name>{p.name}</Name>
                <Alias>{String(p.value)}</Alias>
                <div
                  style={{
                    width: 72,
                    height: 28,
                    background: String(p.value),
                    border: 'var(--border-hairline) solid var(--color-line-strong)',
                  }}
                />
                <span style={{ fontSize: 'var(--text-label)', color: 'var(--color-muted)' }}>
                  {p.description}
                </span>
              </Row>
            ))}
        </Section>
      </div>
    )
  },
}

/**
 * The nine Figma text styles. Size, family and tracking come from tokens; the styles add a
 * weight, a case and a line height. Mirrors the Typography page of the specimen_ library.
 */
const TEXT_STYLES: { name: string; size: string; weight: number; leading: number; tracking?: string; upper?: boolean }[] = [
  { name: 'Text/Micro', size: 'text/micro', weight: 500, leading: 1.2 },
  { name: 'Text/Label', size: 'text/label', weight: 400, leading: 1.4 },
  { name: 'Text/Caption', size: 'text/caption', weight: 400, leading: 1.4 },
  { name: 'Text/Body', size: 'text/body', weight: 400, leading: 1.5 },
  { name: 'Text/Body Large', size: 'text/body-lg', weight: 400, leading: 1.5 },
  { name: 'Text/Heading', size: 'text/heading', weight: 500, leading: 1.2, tracking: 'tracking/display' },
  { name: 'Text/Display', size: 'text/display', weight: 500, leading: 1.1, tracking: 'tracking/display' },
  { name: 'Text/Tag', size: 'text/micro', weight: 500, leading: 1.2, tracking: 'tracking/tag', upper: true },
  { name: 'Text/Label Caps', size: 'text/label', weight: 400, leading: 1.4, tracking: 'tracking/label', upper: true },
]

const cssVarOf = (name: string) => manifest.semantic.find((t) => t.name === name)?.cssVar ?? ''

/** A token's value as CSS writes it: px for sizes, em for tracking, ms for durations. */
const shown = (t: Semantic): string => {
  const p = resolved(t)
  if (!p) return ''
  const group = t.name.split('/')[0]
  const v = p.value as unknown
  if (v && typeof v === 'object' && 'easingFunctionCubicBezier' in v) {
    const b = (v as { easingFunctionCubicBezier: Record<string, number> }).easingFunctionCubicBezier
    return `cubic-bezier(${b.x1}, ${b.y1}, ${b.x2}, ${b.y2})`
  }
  if (group === 'tracking') return `${Number(v) / 100}em`
  if (group === 'duration') return `${Math.round(Number(v) * 1000)}ms`
  if (group === 'leading' || group === 'font') return String(v)
  return `${v}px`
}

const Desc = ({ children }: { children: React.ReactNode }) => (
  <span style={{ fontSize: 'var(--text-label)', color: 'var(--color-muted)' }}>{children}</span>
)

/** Families, the size scale, the nine Figma text styles, tracking and line height: the Typography page in Figma. */
export const Type: Story = {
  render: () => {
    const families = inGroup('font')
    const sizes = inGroup('text')
    const tracking = inGroup('tracking')
    const leading = inGroup('leading')
    return (
      <div style={{ padding: 'var(--spacing-3xl)' }}>
        <Section title="Families" count={families.length}>
          {families.map((t) => (
            <Row key={t.name}>
              <Name>{t.cssVar}</Name>
              <Alias>{shown(t)}</Alias>
              <span />
              <div style={{ fontFamily: `var(${t.cssVar})`, fontSize: 'var(--text-body-lg)', color: 'var(--color-ink)' }}>
                specimen_ 0123456789
              </div>
            </Row>
          ))}
        </Section>

        <Section title="Type scale" count={sizes.length}>
          {sizes.map((t) => (
            <Row key={t.name}>
              <Name>{t.cssVar}</Name>
              <Alias>{Object.values(t.aliases)[0]}</Alias>
              <Alias>{shown(t)}</Alias>
              <div style={{ fontSize: `var(${t.cssVar})`, color: 'var(--color-ink)' }}>
                Specimen {t.name.split('/')[1]}
              </div>
            </Row>
          ))}
        </Section>

        <Section title="Text styles in Figma" count={TEXT_STYLES.length}>
          {TEXT_STYLES.map((st) => (
            <Row key={st.name}>
              <Name>{st.name}</Name>
              <Alias>{[st.size, st.tracking, st.upper ? 'upper' : ''].filter(Boolean).join(' + ')}</Alias>
              <Alias>{`${st.weight} / ${st.leading}`}</Alias>
              <div
                style={{
                  fontSize: `var(${cssVarOf(st.size)})`,
                  fontWeight: st.weight,
                  lineHeight: st.leading,
                  letterSpacing: st.tracking ? `var(${cssVarOf(st.tracking)})` : undefined,
                  textTransform: st.upper ? 'uppercase' : undefined,
                  color: 'var(--color-ink)',
                }}
              >
                Specimen field guide
              </div>
            </Row>
          ))}
        </Section>

        <Section title="Tracking" count={tracking.length}>
          {tracking.map((t) => (
            <Row key={t.name}>
              <Name>{t.cssVar}</Name>
              <Alias>{Object.values(t.aliases)[0]}</Alias>
              <Alias>{shown(t)}</Alias>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                <span style={{ letterSpacing: `var(${t.cssVar})`, fontSize: 'var(--text-body)', color: 'var(--color-ink)' }}>
                  Specimen tracking
                </span>
                <Desc>{t.description}</Desc>
              </div>
            </Row>
          ))}
        </Section>

        <Section title="Line height" count={leading.length}>
          {leading.map((t) => (
            <Row key={t.name}>
              <Name>{t.cssVar}</Name>
              <Alias>{Object.values(t.aliases)[0]}</Alias>
              <Alias>{shown(t)}</Alias>
              <p
                style={{
                  margin: 0,
                  lineHeight: `var(${t.cssVar})`,
                  fontSize: 'var(--text-caption)',
                  color: 'var(--color-ink)',
                  maxWidth: 'var(--container-measure-sm)',
                }}
              >
                Accessible components, one token source, docs like a field guide. The mark is a microscope slide and the green dot is the specimen.
              </p>
            </Row>
          ))}
        </Section>
      </div>
    )
  },
}

export const Spacing: Story = {
  render: () => {
    const steps = inGroup('spacing')
    return (
      <div style={{ padding: 'var(--spacing-3xl)' }}>
        <Section title="Spacing" count={steps.length}>
          {steps.map((t) => {
            const p = resolved(t)
            return (
              <Row key={t.name}>
                <Name>{t.cssVar}</Name>
                <Alias>{Object.values(t.aliases)[0]}</Alias>
                <Alias>{p ? `${p.value}px` : ''}</Alias>
                <div
                  style={{
                    width: `var(${t.cssVar})`,
                    minWidth: 1,
                    height: 12,
                    background: 'var(--color-sample-pressed)',
                  }}
                />
              </Row>
            )
          })}
        </Section>
      </div>
    )
  },
}

/** The widest breakpoint sets the scale, so each bar is its width as a share of 2xl. */
export const Breakpoints: Story = {
  render: () => {
    const steps = inGroup('breakpoint')
    const widest = Math.max(...steps.map((t) => Number(resolved(t)?.value ?? 0)))
    return (
      <div style={{ padding: 'var(--spacing-3xl)' }}>
        <Section title="Breakpoints" count={steps.length}>
          {steps.map((t) => {
            const px = Number(resolved(t)?.value ?? 0)
            const prefix = t.name.split('/')[1]
            return (
              <Row key={t.name}>
                <Name>{`${prefix}: ${t.cssVar}`}</Name>
                <Alias>{Object.values(t.aliases)[0]}</Alias>
                <Alias>{`${px}px and up`}</Alias>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                  <div
                    style={{
                      width: `${(px / widest) * 100}%`,
                      height: 12,
                      background: 'var(--color-sample-pressed)',
                    }}
                  />
                  <span style={{ fontSize: 'var(--text-label)', color: 'var(--color-muted)' }}>{t.description}</span>
                </div>
              </Row>
            )
          })}
        </Section>
        <p style={{ margin: 0, fontSize: 'var(--text-label)', color: 'var(--color-muted)', maxWidth: 'var(--container-measure-md)' }}>
          Min-width and mobile first: a class with no prefix applies at every width, and md:flex applies from 768px up. Figma frames for each layout use these widths.
        </p>
      </div>
    )
  },
}

/** Corners from the mark: sm for controls, md for panels that float, full for the dot family. */
export const Radius: Story = {
  render: () => {
    const steps = inGroup('radius')
    return (
      <div style={{ padding: 'var(--spacing-3xl)' }}>
        <Section title="Radius" count={steps.length}>
          {steps.map((t) => (
            <Row key={t.name}>
              <Name>{t.cssVar}</Name>
              <Alias>{Object.values(t.aliases)[0]}</Alias>
              <Alias>{shown(t)}</Alias>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    flexShrink: 0,
                    borderRadius: `var(${t.cssVar})`,
                    background: 'var(--color-surface)',
                    border: 'var(--border-hairline) solid var(--color-line-interactive)',
                  }}
                />
                <Desc>{t.description}</Desc>
              </div>
            </Row>
          ))}
        </Section>
      </div>
    )
  },
}

/** Five weights. A line separates surfaces where other systems use a shadow. */
export const Border: Story = {
  render: () => {
    const steps = inGroup('border')
    return (
      <div style={{ padding: 'var(--spacing-3xl)' }}>
        <Section title="Border" count={steps.length}>
          {steps.map((t) => (
            <Row key={t.name}>
              <Name>{t.cssVar}</Name>
              <Alias>{Object.values(t.aliases)[0]}</Alias>
              <Alias>{shown(t)}</Alias>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
                <div style={{ width: 96, flexShrink: 0, borderTop: `var(${t.cssVar}) solid var(--color-ink)` }} />
                <Desc>{t.description}</Desc>
              </div>
            </Row>
          ))}
        </Section>
        <p style={{ margin: 0, fontSize: 'var(--text-label)', color: 'var(--color-muted)', maxWidth: 'var(--container-measure-md)' }}>
          Colour comes from the line family: color-line for decorative rules, color-line-interactive (3:1) for the edge of a form control.
        </p>
      </div>
    )
  },
}

/** Slow, small, seldom: one transition duration, two loops and one easing curve. */
export const Motion: Story = {
  render: () => {
    const durations = inGroup('duration')
    const eases = inGroup('ease')
    return (
      <div style={{ padding: 'var(--spacing-3xl)' }}>
        <Section title="Duration" count={durations.length}>
          {durations.map((t) => (
            <Row key={t.name}>
              <Name>{t.cssVar}</Name>
              <Alias>{Object.values(t.aliases)[0]}</Alias>
              <Alias>{shown(t)}</Alias>
              <Desc>{t.description}</Desc>
            </Row>
          ))}
        </Section>
        <Section title="Easing" count={eases.length}>
          {eases.map((t) => (
            <Row key={t.name}>
              <Name>{t.cssVar}</Name>
              <Alias>{Object.values(t.aliases)[0]}</Alias>
              <span />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                <code style={{ fontSize: 'var(--text-label)', color: 'var(--color-ink)' }}>{shown(t)}</code>
                <Desc>{t.description}</Desc>
              </div>
            </Row>
          ))}
        </Section>
        <p style={{ margin: 0, fontSize: 'var(--text-label)', color: 'var(--color-muted)', maxWidth: 'var(--container-measure-md)' }}>
          Under prefers-reduced-motion the blink and pulse loops stop and every transition drops to 0.01ms, from globals.css.
        </p>
      </div>
    )
  },
}

/** Content max-widths: a reading constraint, so a scale of their own rather than spacing steps. */
export const Measure: Story = {
  render: () => {
    const steps = inGroup('measure')
    return (
      <div style={{ padding: 'var(--spacing-3xl)' }}>
        <Section title="Measure" count={steps.length}>
          {steps.map((t) => (
            <Row key={t.name}>
              <Name>{`max-w-measure-${t.name.split('/')[1]}`}</Name>
              <Alias>{Object.values(t.aliases)[0]}</Alias>
              <Alias>{shown(t)}</Alias>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                <div style={{ width: `min(100%, var(${t.cssVar}))`, height: 12, background: 'var(--color-sample-pressed)' }} />
                <Desc>{t.description}</Desc>
              </div>
            </Row>
          ))}
        </Section>
      </div>
    )
  },
}
