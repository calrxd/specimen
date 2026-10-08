import { useId } from 'react'

export type MeterGroupTone = 'sample' | 'info' | 'warn' | 'danger' | 'muted'

export type MeterGroupItem = {
  id: string
  /** What the share is, sentence case: "Documents". */
  label: string
  /** How much it uses, in the same unit as max. */
  value: number
  /** Colour of the segment and its legend dot. Left out, items take sample, info, warn, danger, muted in order. */
  tone?: MeterGroupTone
}

export type MeterGroupProps = {
  /** What is being measured, sentence case: "Storage". Also the meter's accessible name. */
  label: string
  /** The shares, in the order they fill the bar. Content, not a Figma property: the library shows three. */
  items: MeterGroupItem[]
  /** The quota the shares fill. The bar's full width. */
  max?: number
  /** The unit after every figure: "GB", "seats". Leave it out for a bare count. */
  unit?: string
  /** Shows the total used against max beside the label. */
  showValue?: boolean
}

const ORDER: MeterGroupTone[] = ['sample', 'info', 'warn', 'danger', 'muted']

const FILL: Record<MeterGroupTone, string> = {
  sample: 'bg-sample-fill',
  info: 'bg-info',
  warn: 'bg-warn',
  danger: 'bg-danger',
  muted: 'bg-muted',
}

const format = (n: number, unit?: string) => {
  const figure = n.toLocaleString('en-GB', { maximumFractionDigits: 1 })
  return unit ? `${figure} ${unit}` : figure
}

/**
 * One bar split into the shares that fill a quota: storage by file type, seats by team.
 * The track is the line colour, like ProgressBar's, and each share is a segment with a 2px
 * gap before the next, so neighbours stay apart without relying on colour. The bar is one
 * meter for the total; the legend under it gives every share as text, which is how a screen
 * reader gets the breakdown. Over quota, the bar scales to the total and the figure says so.
 */
export function MeterGroup({ label, items, max = 100, unit, showValue = true }: MeterGroupProps) {
  const labelId = useId()
  const total = items.reduce((sum, item) => sum + Math.max(0, item.value), 0)
  const scale = Math.max(max, total) || 1
  const totalText = `${format(total, unit)} of ${format(max, unit)}`

  return (
    <div role="group" aria-labelledby={labelId} className="flex w-full flex-col gap-sm">
      <div className="flex items-baseline justify-between gap-lg">
        <span id={labelId} className="text-caption text-ink">
          {label}
        </span>
        {showValue && <span className={['font-mono text-caption tabular-nums', total > max ? 'text-danger' : 'text-muted'].join(' ')}>{totalText}</span>}
      </div>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.min(total, max)}
        aria-valuetext={total > max ? `${totalText}, over the limit` : totalText}
        className="flex h-sm w-full gap-2xs overflow-hidden rounded-full bg-line"
      >
        {items.map((item, i) =>
          item.value > 0 ? (
            <span
              key={item.id}
              className={['h-full', FILL[item.tone ?? ORDER[i % ORDER.length]]].join(' ')}
              style={{ width: `${(item.value / scale) * 100}%` }}
            />
          ) : null,
        )}
      </div>
      <ul className="m-0 flex list-none flex-wrap gap-x-xl gap-y-xs p-0">
        {items.map((item, i) => (
          <li key={item.id} className="flex items-center gap-sm text-caption">
            <span aria-hidden className={['size-sm shrink-0 rounded-full', FILL[item.tone ?? ORDER[i % ORDER.length]]].join(' ')} />
            <span className="text-ink">{item.label}</span>
            <span className="font-mono tabular-nums text-muted">{format(item.value, unit)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
