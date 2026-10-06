export type SpinnerSize = 'sm' | 'md'

export type SpinnerProps = {
  /** What is loading, for assistive technology: "Loading invoices". Not shown. */
  label: string
  /** sm sits inline with text or inside a Button; md stands alone in an empty region. */
  size?: SpinnerSize
}

const SIZE: Record<SpinnerSize, string> = {
  sm: 'size-lg border-strong',
  md: 'size-3xl border-strong',
}

/**
 * A wait of unknown length, too short for a ProgressBar. A ring in the line colour with a
 * sample-green arc that turns. Under reduced motion it stops turning and stays visible, so
 * the loading state is still clear.
 */
export function Spinner({ label, size = 'md' }: SpinnerProps) {
  return (
    <span role="status" className="inline-flex items-center">
      <span
        aria-hidden
        className={[
          'inline-block animate-spin rounded-full border-line border-t-sample-fill motion-reduce:animate-none',
          SIZE[size],
        ].join(' ')}
      />
      <span className="sr-only">{label}</span>
    </span>
  )
}
