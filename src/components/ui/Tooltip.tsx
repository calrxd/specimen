'use client'

import { cloneElement, useEffect, useId, useState, type ReactElement } from 'react'

export type TooltipSide = 'top' | 'bottom'

export type TooltipProps = {
  /** One short line. A tooltip names or explains; it never holds anything the user must read to proceed. */
  label: string
  /** Which side of the trigger it opens on. */
  side?: TooltipSide
  /** The trigger: one focusable element, usually an icon-only button. */
  children: ReactElement<{ 'aria-describedby'?: string }>
}

const SIDE: Record<TooltipSide, string> = {
  top: 'bottom-full mb-sm',
  bottom: 'top-full mt-sm',
}

/**
 * A label that appears on hover and on keyboard focus, and goes on Escape or when either
 * ends. Flat like every overlay in the system: surface fill, line-strong edge, no shadow.
 * The trigger is described by it, so a screen reader hears the label after the name.
 */
export function Tooltip({ label, side = 'top', children }: TooltipProps) {
  const id = useId()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {cloneElement(children, { 'aria-describedby': id })}
      <span
        id={id}
        role="tooltip"
        className={[
          'pointer-events-none absolute left-1/2 z-10 w-max max-w-(--container-measure-sm) -translate-x-1/2 rounded-sm border border-line-strong bg-surface px-sm py-xs text-caption text-ink',
          SIDE[side],
          // Hidden, not just transparent: a closed tooltip must not widen the page on a narrow
          // screen. aria-describedby still reads a hidden element's text.
          open ? 'block' : 'hidden',
        ].join(' ')}
      >
        {label}
      </span>
    </span>
  )
}
