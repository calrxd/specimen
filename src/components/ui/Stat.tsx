export type StatDirection = 'up' | 'down' | 'flat'
export type StatGoodDirection = 'up' | 'down'
export type StatSize = 'md' | 'lg'
export type StatVariant = 'card' | 'plain'

export type StatProps = {
  /** What the figure measures, sentence case: "Monthly recurring revenue". */
  label: string
  /** The figure, formatted: "£84,210", "112%", "9 days". */
  value: string
  /** How far the figure moved against the previous period: "3.6%", "£1,240", "3 days". */
  change?: string
  /** Which way it moved. Draws the arrow and, with goodDirection, picks the colour. flat is muted. */
  direction?: StatDirection
  /** Which way is good news. up for revenue, down for churn, overdue invoices or time to reply. */
  goodDirection?: StatGoodDirection
  /** One line naming the comparison or the context: "Against September", "6 invoices, up from 4 last week". */
  caption?: string
  /** md in a row of figures, lg for the one figure a screen leads with. */
  size?: StatSize
  /** card frames the figure on its own; plain leaves the frame to a parent, such as a strip of figures sharing hairlines. */
  variant?: StatVariant
}

const ARROW: Record<StatDirection, string> = { up: '↑', down: '↓', flat: '→' }
const SPOKEN: Record<StatDirection, string> = { up: 'Up', down: 'Down', flat: 'Flat' }

/**
 * A key figure with its label, and how it moved since the last period. The arrow shows the
 * direction; the colour says whether that is good, which depends on the figure: revenue up
 * is success, overdue invoices up is danger. The direction is also spoken, so it never rests
 * on the arrow or the colour alone. Built as a description list (label, figure, caption), so
 * a row of Stats reads as a set of named values.
 */
export function Stat({ label, value, change, direction = 'flat', goodDirection = 'up', caption, size = 'md', variant = 'card' }: StatProps) {
  const tone = direction === 'flat' ? 'text-muted' : direction === goodDirection ? 'text-success' : 'text-danger'
  return (
    <dl className={['m-0 flex min-w-0 flex-col gap-xs', variant === 'card' ? 'rounded-md border border-line bg-surface p-xl' : ''].join(' ')}>
      <dt className="text-caption text-muted">{label}</dt>
      <dd className="m-0 flex flex-wrap items-baseline gap-x-md gap-y-xs">
        <span className={['font-medium tracking-display text-ink tabular-nums', size === 'lg' ? 'text-display' : 'text-heading'].join(' ')}>{value}</span>
        {change && (
          <span className={['whitespace-nowrap font-mono text-caption tabular-nums', tone].join(' ')}>
            <span aria-hidden>{ARROW[direction]} </span>
            <span className="sr-only">{SPOKEN[direction]} </span>
            {change}
          </span>
        )}
      </dd>
      {caption && <dd className="m-0 font-text text-caption leading-normal text-muted">{caption}</dd>}
    </dl>
  )
}
