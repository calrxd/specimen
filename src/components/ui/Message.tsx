import type { ReactNode } from 'react'

export type MessageTone = 'info' | 'success' | 'warn' | 'danger'

export type MessageProps = {
  /** What the reader needs to know, sentence case: "Your trial ends in 3 days". */
  title: string
  /** One or two sentences of detail or the next step. */
  description?: string
  /** The status colour of the bar. danger is announced assertively; the rest politely. */
  tone?: MessageTone
  /** One action that resolves the message, usually a small Button. */
  action?: ReactNode
  /** Shows a close control. Leave it off for a message that stays until its cause is fixed. */
  onDismiss?: () => void
}

const BAR: Record<MessageTone, string> = {
  info: 'border-l-info',
  success: 'border-l-success',
  warn: 'border-l-warn',
  danger: 'border-l-danger',
}

/**
 * An inline notice that sits in the page flow, next to what it is about. Use it for a state
 * that lasts (a failed payment, an expiring trial); use Toast for something that just
 * happened. Flat, like Toast: surface fill, line-strong edge, and the status colour as a 4px
 * bar on the left.
 */
export function Message({ title, description, tone = 'info', action, onDismiss }: MessageProps) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={['flex w-full items-start gap-lg rounded-md border border-l-accent border-line-strong bg-surface px-lg py-md', BAR[tone]].join(' ')}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-sm">
        <div className="flex flex-col gap-2xs">
          <p className="m-0 text-body text-ink">{title}</p>
          {description && <p className="m-0 font-text text-caption leading-normal text-muted">{description}</p>}
        </div>
        {action && <div className="flex flex-wrap gap-sm">{action}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 cursor-pointer rounded-sm border-0 bg-transparent px-xs font-mono text-caption text-muted transition-colors duration-fast hover:text-ink"
        >
          Close
        </button>
      )}
    </div>
  )
}
