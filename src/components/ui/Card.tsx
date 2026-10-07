import type { ReactNode } from 'react'

export type CardTitleSize = 'md' | 'lg'

export type CardProps = {
  /** The card's heading. Sentence case. */
  title?: string
  /** md for a heading, lg when the title is the figure itself: a price, a total. */
  titleSize?: CardTitleSize
  /** The heading level of the title, so the card fits the page outline. 3 under a page's h2 sections. */
  headingLevel?: 2 | 3 | 4
  /** One or two lines under the title saying what the card holds. */
  description?: string
  /** The body. */
  children?: ReactNode
  /** A row at the foot of the card, usually sm Buttons. */
  actions?: ReactNode
}

/**
 * A framed panel that groups one subject on a screen: a plan, a setting, a summary. Flat
 * like every panel in the system: surface fill, hairline edge, the 8px panel corner. Title
 * and description are optional, so a card can also frame a bare table or chart. Set
 * `headingLevel` to match where the card sits in the page outline, and `titleSize` to lg
 * when the title is a figure.
 */
export function Card({ title, titleSize = 'md', headingLevel = 3, description, children, actions }: CardProps) {
  const Heading = `h${headingLevel}` as const
  return (
    <section className="flex flex-col gap-xl rounded-md border border-line bg-surface p-2xl text-ink">
      {(title || description) && (
        <header className="flex flex-col gap-sm">
          {title && (
            <Heading className={['m-0 font-medium text-ink', titleSize === 'lg' ? 'text-heading tracking-display' : 'text-body-lg'].join(' ')}>{title}</Heading>
          )}
          {description && <p className="m-0 font-text text-body leading-relaxed text-muted">{description}</p>}
        </header>
      )}
      {children}
      {actions && <footer className="flex flex-wrap justify-end gap-sm border-t border-line pt-lg">{actions}</footer>}
    </section>
  )
}
