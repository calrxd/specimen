import type { ReactNode } from 'react'
import { CloseButton } from './parts'

export type BannerTone = 'info' | 'success' | 'warn' | 'danger'

export type BannerProps = {
  /** One or two sentences about the whole app or page, sentence case: "Scheduled maintenance on Sunday 12 October, 02:00 to 04:00 UTC." */
  message: string
  /** The status colour of the fill and the rule under it. danger is announced assertively; the rest politely. */
  tone?: BannerTone
  /** One action that follows from the message: a link to the details or a small Button. */
  action?: ReactNode
  /** Shows a dismiss control. Leave it off for a banner that stays until its cause is fixed. */
  onDismiss?: () => void
}

const TONE: Record<BannerTone, string> = {
  info: 'border-info bg-info-subtle',
  success: 'border-success bg-success-subtle',
  warn: 'border-warn bg-warn-subtle',
  danger: 'border-danger bg-danger-subtle',
}

/**
 * A page-level announcement that runs edge to edge across the top of an app or a page: a
 * maintenance window, a trial that is ending, a new feature. It is about the whole product,
 * not one part of it. Use Message for a notice inside the content, next to what it is about,
 * and Toast for something that just happened and clears itself. A Banner stays put until its
 * cause goes away or the reader dismisses it.
 * Square, like the page frame it sits in: the tone's subtle fill with a hairline in the tone
 * colour under it, ink text over it (above 13:1 in both themes) and muted controls (above 4.8:1).
 */
export function Banner({ message, tone = 'info', action, onDismiss }: BannerProps) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={['flex w-full flex-wrap items-center gap-x-lg gap-y-sm rounded-none border-b px-2xl py-md text-ink', TONE[tone]].join(' ')}
    >
      <p className="m-0 min-w-0 flex-1 text-body text-ink">{message}</p>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-sm">{action}</div>}
      {onDismiss && <CloseButton onClick={onDismiss} label="Dismiss" />}
    </div>
  )
}
