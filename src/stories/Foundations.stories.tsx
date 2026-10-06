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

export const Type: Story = {
  render: () => {
    const sizes = inGroup('text')
    return (
      <div style={{ padding: 'var(--spacing-3xl)' }}>
        <Section title="Type scale" count={sizes.length}>
          {sizes.map((t) => {
            const p = resolved(t)
            return (
              <Row key={t.name}>
                <Name>{t.cssVar}</Name>
                <Alias>{Object.values(t.aliases)[0]}</Alias>
                <Alias>{p ? `${p.value}px` : ''}</Alias>
                <div style={{ fontSize: `var(${t.cssVar})`, color: 'var(--color-ink)' }}>
                  Specimen {t.name.split('/')[1]}
                </div>
              </Row>
            )
          })}
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
