export type ProgressBarProps = {
  /** What is in progress, sentence case: "Uploading invoices". Also its accessible name. */
  label: string
  /** How far along, from 0 to 100. Ignored while indeterminate. */
  value?: number
  /** For work with no known length. The bar pulses instead of filling. */
  indeterminate?: boolean
  /** Shows the percentage beside the label. */
  showValue?: boolean
}

/**
 * Shows how far a task has got. A 4px track in the line colour with a sample-green fill,
 * labelled above. Indeterminate work pulses a third of the track; the pulse stops under
 * reduced motion and the segment stays put.
 */
export function ProgressBar({ label, value = 0, indeterminate = false, showValue = false }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div className="flex w-full flex-col gap-sm">
      <div className="flex items-baseline justify-between gap-lg">
        <span className="text-caption text-ink">{label}</span>
        {showValue && !indeterminate && <span className="font-mono text-caption tabular-nums text-muted">{pct}%</span>}
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={indeterminate ? undefined : pct}
        aria-busy={indeterminate || undefined}
        className="relative h-xs w-full overflow-hidden rounded-full bg-line"
      >
        <div
          className={['h-full rounded-full bg-sample-fill transition-[width] duration-fast', indeterminate ? 'spc-pulse w-1/3' : ''].join(' ')}
          style={indeterminate ? undefined : { width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
