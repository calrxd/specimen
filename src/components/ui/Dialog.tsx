'use client'

import { useEffect, useId, useRef, type ReactNode } from 'react'
import { CloseButton } from './parts'

export type DialogProps = {
  /** Whether the dialog is showing. Controlled: set it false from onClose. */
  open: boolean
  /** A question or a noun phrase, sentence case: "Delete this release?" */
  title: string
  /** One line under the title saying what will happen. */
  description?: string
  /** The body: a message, a form, a summary. */
  children?: ReactNode
  /** The actions, usually Buttons, in a row under a hairline at the foot, aligned to the end. */
  footer?: ReactNode
  /** Called on Escape, on a click outside the panel, and on the close control. */
  onClose: () => void
}

/**
 * A modal for a decision that blocks everything else. Built on the native dialog element,
 * so focus is trapped, the page behind is inert, and Escape closes it without extra code.
 * Flat, per brand section 06: the page dims behind the scrim token, and the panel
 * separates with surface fill and a line-strong edge. Actions go in `footer`, so they sit in
 * the same place on every dialog: under a hairline, aligned to the end, the primary last.
 */
export function Dialog({ open, title, description, children, footer, onClose }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const id = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-desc` : undefined}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="m-auto w-full max-w-measure-md rounded-md border border-line-strong bg-surface p-none text-ink backdrop:bg-scrim"
    >
      <div className="flex flex-col gap-xl p-2xl">
        <div className="flex items-start justify-between gap-xl">
          <div className="flex flex-col gap-sm">
            <h2 id={`${id}-title`} className="m-0 text-body-lg font-medium text-ink">
              {title}
            </h2>
            {description && (
              <p id={`${id}-desc`} className="m-0 font-text text-body leading-relaxed text-muted">
                {description}
              </p>
            )}
          </div>
          <CloseButton onClick={onClose} />
        </div>
        {children}
      </div>
      {footer && <div className="flex flex-wrap items-center justify-end gap-sm border-t border-line px-2xl py-lg">{footer}</div>}
    </dialog>
  )
}
