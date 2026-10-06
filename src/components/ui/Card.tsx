import type { ReactNode } from 'react'

export type CardProps = {
  /** The card's heading. Sentence case. */
  title?: string
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
 * and description are optional, so a card can also frame a bare table or chart.
 */
export function Card({ title, description, children, actions }: CardProps) {
  return (
    <section className="flex flex-col gap-xl rounded-md border border-line bg-surface p-2xl text-ink">
      {(title || description) && (
        <header className="flex flex-col gap-sm">
          {title && <h3 className="m-0 text-body-lg font-medium text-ink">{title}</h3>}
          {description && <p className="m-0 font-text text-body leading-relaxed text-muted">{description}</p>}
        </header>
      )}
      {children}
      {actions && <footer className="flex flex-wrap justify-end gap-sm border-t border-line pt-lg">{actions}</footer>}
    </section>
  )
}
