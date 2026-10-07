import type { ReactNode } from 'react'
import { CloseButton } from './parts'

export type ToastTone = 'info' | 'success' | 'warn' | 'danger'

export type ToastProps = {
  /** What happened, past tense, sentence case: "Token copied", "Release published". */
  title: string
  /** One line of detail or the next step. */
  description?: string
  /** The status colour of the bar. danger is announced assertively; the rest politely. */
  tone?: ToastTone
  /** Shows a close control. Leave it off for a toast that clears itself. */
  onDismiss?: () => void
}

const BAR: Record<ToastTone, string> = {
  info: 'border-l-info',
  success: 'border-l-success',
  warn: 'border-l-warn',
  danger: 'border-l-danger',
}

/**
 * A short notice about something that just happened. Flat: surface fill, line-strong
 * edge, and the status colour as a 4px bar on the left edge,
 * so four tones never turn a screen into a traffic light. Put toasts in a ToastRegion.
 */
export function Toast({ title, description, tone = 'info', onDismiss }: ToastProps) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={['flex w-full items-start gap-lg rounded-md border border-l-accent border-line-strong bg-surface px-lg py-md', BAR[tone]].join(' ')}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2xs">
        <p className="m-0 text-body text-ink">{title}</p>
        {description && <p className="m-0 font-text text-caption leading-normal text-muted">{description}</p>}
      </div>
      {onDismiss && (
        <CloseButton onClick={onDismiss} />
      )}
    </div>
  )
}

/** The corner toasts stack in. Newest at the bottom, nearest the eye's last position. */
export function ToastRegion({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none fixed right-none bottom-none z-50 flex w-full max-w-measure-sm flex-col gap-sm p-xl [&>*]:pointer-events-auto">
      {children}
    </div>
  )
}
