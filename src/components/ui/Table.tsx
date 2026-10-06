import type { ReactNode } from 'react'

export type TableDensity = 'comfortable' | 'compact'

export type TableColumn = {
  key: string
  /** Sentence case in source. Rendered in the uppercase label style, a structural label. */
  header: string
  /** end for numbers, so the digits line up. */
  align?: 'start' | 'end'
}

export type TableProps = {
  /** Column definitions, in order. Content, not a Figma property. */
  columns: TableColumn[]
  /** One record per row, keyed by column key. Content, not a Figma property. */
  rows: Record<string, ReactNode>[]
  /** Says what the table holds. Above the table, in the caption style. */
  caption?: string
  /** compact for admin lists and anything scanned rather than read. Decided 10 Sep 2026: a prop on Table, not a global mode. */
  density?: TableDensity
}

const PAD_X: Record<TableDensity, string> = { comfortable: 'px-lg', compact: 'px-md' }
const PAD_Y: Record<TableDensity, string> = { comfortable: 'py-md', compact: 'py-sm' }

/**
 * A plain data table. Rows separate with decorative hairlines (line), the header with
 * line-strong; no zebra stripes and no cell borders, so structure comes from lines as the
 * brand asks. Numbers align to the end with tabular figures.
 */
export function Table({ columns, rows, caption, density = 'comfortable' }: TableProps) {
  const cell = `${PAD_X[density]} ${PAD_Y[density]}`
  const align = (c: TableColumn) => (c.align === 'end' ? 'text-right tabular-nums' : 'text-left')
  return (
    <table className="w-full border-collapse font-mono text-body">
      {caption && <caption className={['caption-top pb-md text-left text-caption text-muted', PAD_X[density]].join(' ')}>{caption}</caption>}
      <thead>
        <tr className="border-b border-line-strong">
          {columns.map((c) => (
            <th key={c.key} scope="col" className={[cell, align(c), 'text-label font-normal uppercase text-muted tracking-label'].join(' ')}>
              {c.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-line">
            {columns.map((c) => (
              <td key={c.key} className={[cell, align(c), 'text-ink'].join(' ')}>
                {row[c.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
