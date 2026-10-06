'use client'

import { useEffect, useId, useRef, type ReactNode } from 'react'

export type DialogProps = {
  /** Whether the dialog is showing. Controlled: set it false from onClose. */
  open: boolean
  /** A question or a noun phrase, sentence case: "Delete this release?" */
  title: string
  /** One line under the title saying what will happen. */
  description?: string
  /** The body, and the actions as a row of Buttons at the end. */
  children?: ReactNode
  /** Called on Escape, on a click outside the panel, and on the close control. */
  onClose: () => void
}

/**
 * A modal for a decision that blocks everything else. Built on the native dialog element,
 * so focus is trapped, the page behind is inert, and Escape closes it without extra code.
 * Flat, per brand section 06: the page dims behind the scrim token, and the panel
 * separates with surface fill and a line-strong edge rather than a shadow.
 */
export function Dialog({ open, title, description, children, onClose }: DialogProps) {
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
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 cursor-pointer rounded-sm border-0 bg-transparent px-xs font-mono text-caption text-muted transition-colors duration-fast hover:text-ink"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
