'use client'

import { useEffect, useId, useRef, type ReactNode } from 'react'

export type DrawerSide = 'end' | 'start'

export type DrawerProps = {
  /** Whether the drawer is showing. Controlled: set it false from onClose. */
  open: boolean
  /** What the drawer is for, sentence case: "Invoice INV-2048". */
  title: string
  /** One line under the title. */
  description?: string
  /** Which edge it slides from. end is right in left-to-right languages. */
  side?: DrawerSide
  /** The body: details, a form, filters. Actions go at the end. */
  children?: ReactNode
  /** Called on Escape, on a click outside the panel, and on the close control. */
  onClose: () => void
}

const SIDE: Record<DrawerSide, string> = {
  end: 'ml-auto mr-0 rounded-l-md border-l',
  start: 'mr-auto ml-0 rounded-r-md border-r',
}

/**
 * A side sheet for detail or editing that keeps the page in view behind it. Built on the
 * native dialog element, like Dialog, so focus is trapped, the page is inert and Escape
 * closes it; focus returns to whatever opened it. Flat: the scrim dims the page, and the
 * panel takes surface fill, a line-strong edge and the 8px corner on its inner edge only.
 */
export function Drawer({ open, title, description, side = 'end', children, onClose }: DrawerProps) {
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
      // h-dvh and max-h-dvh let the sheet run the full height of the viewport. (max-h-none would
      // resolve to the none spacing token, 0, and collapse the sheet.)
      className={[
        'my-0 h-dvh max-h-dvh w-full max-w-measure-sm border-0 border-line-strong bg-surface p-none text-ink backdrop:bg-scrim',
        SIDE[side],
      ].join(' ')}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-xl border-b border-line p-2xl">
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
        <div className="flex-1 overflow-y-auto p-2xl">{children}</div>
      </div>
    </dialog>
  )
}
