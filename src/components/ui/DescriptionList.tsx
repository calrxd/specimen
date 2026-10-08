import type { ReactNode } from 'react'

export type DescriptionListLayout = 'horizontal' | 'stacked'

export type DescriptionListItem = {
  /** Needed only when two terms repeat. Defaults to the term. */
  id?: string
  /** The name of the detail, sentence case: "Billing contact". */
  term: string
  /** Its value: text, a figure, a Tag or a link. */
  description: ReactNode
}

export type DescriptionListProps = {
  /** The details, in reading order. Content, not a Figma property: the library shows four. */
  items: DescriptionListItem[]
  /** horizontal puts the term beside its value on a hairline row; stacked puts it above, for short values in a grid. */
  layout?: DescriptionListLayout
  /** How many columns the details flow into from md up. Below md they always stack in one. */
  columns?: 1 | 2 | 3
}

const COLUMNS: Record<NonNullable<DescriptionListProps['columns']>, string> = {
  1: '',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-2 lg:grid-cols-3',
}

/**
 * Key and value details for a record: an account, an invoice, a plan. A real dl, so each term
 * names its value for assistive technology. Horizontal rows give the term a third of the row
 * and separate with hairlines, the way a details card reads; stacked groups put the term above
 * a value and drop the lines, for a summary of short figures. Terms are muted mono, values ink
 * with tabular figures so amounts and dates line up.
 */
export function DescriptionList({ items, layout = 'horizontal', columns = 1 }: DescriptionListProps) {
  const horizontal = layout === 'horizontal'
  return (
    <dl className={['m-0 grid', horizontal ? 'gap-x-3xl' : 'gap-x-3xl gap-y-xl', COLUMNS[columns]].join(' ')}>
      {items.map((item) => (
        <div
          key={item.id ?? item.term}
          className={
            horizontal
              ? ['grid grid-cols-3 gap-md border-b border-line py-sm', columns === 1 ? 'last:border-b-0' : ''].join(' ')
              : 'flex min-w-0 flex-col gap-2xs'
          }
        >
          <dt className="text-caption text-muted">{item.term}</dt>
          <dd className={['m-0 min-w-0 break-words text-body tabular-nums text-ink', horizontal ? 'col-span-2' : ''].join(' ')}>{item.description}</dd>
        </div>
      ))}
    </dl>
  )
}
