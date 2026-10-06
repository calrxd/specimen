import type { ComponentPropsWithoutRef } from 'react'

export type BadgeTone = 'sample' | 'muted' | 'danger'

export type BadgeProps = {
  /** A count or a single short word: "3", "99+", "New". Ignored when dot is on. */
  label: string
  /** sample for new or unread, danger for something that needs attention, muted for a neutral count. */
  tone?: BadgeTone
  /** Shows only the dot, without the label, for presence of something rather than a number. */
  dot?: boolean
} & Pick<ComponentPropsWithoutRef<'span'>, 'aria-label'>

const TONE: Record<BadgeTone, string> = {
  sample: 'bg-sample-fill text-on-sample',
  muted: 'border border-line-strong bg-surface text-muted',
  danger: 'bg-danger-fill text-on-danger',
}

/**
 * A badge: a small count or flag that sits next to a nav item, a tab or an avatar. It is a
 * pill from the dot family, so it is fully round; with dot on it collapses to the dot alone.
 * Give it an aria-label whenever the number would be meaningless read on its own.
 */
export function Badge({ label, tone = 'sample', dot = false, 'aria-label': accessibleLabel }: BadgeProps) {
  if (dot) {
    return <span role="img" aria-label={accessibleLabel ?? label} className={['inline-block size-sm shrink-0 rounded-full', TONE[tone]].join(' ')} />
  }
  return (
    <span
      aria-label={accessibleLabel}
      className={[
        'inline-flex h-lg min-w-(--spacing-lg) shrink-0 items-center justify-center rounded-full px-xs font-mono text-micro font-semibold tabular-nums',
        TONE[tone],
      ].join(' ')}
    >
      {label}
    </span>
  )
}
