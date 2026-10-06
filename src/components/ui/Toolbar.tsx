'use client'

import type { ComponentPropsWithoutRef, KeyboardEvent, ReactNode } from 'react'

export type ToolbarProps = {
  /** Controls on the left: filters, view switches, bulk actions. */
  children: ReactNode
  /** Controls pinned to the right: export, create, settings. */
  end?: ReactNode
} & Required<Pick<ComponentPropsWithoutRef<'div'>, 'aria-label'>>

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * A row of related controls above a table or an editor, with an end group pinned to the
 * right. Exposed as role="toolbar"; Left and Right arrows move focus between its controls,
 * Home and End jump to either end, and Tab leaves the toolbar as usual.
 */
export function Toolbar({ children, end, 'aria-label': ariaLabel }: ToolbarProps) {
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return
    const items = [...e.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE)]
    const i = items.indexOf(document.activeElement as HTMLElement)
    if (i < 0) return
    const to =
      e.key === 'ArrowRight' ? (i + 1) % items.length
      : e.key === 'ArrowLeft' ? (i - 1 + items.length) % items.length
      : e.key === 'Home' ? 0
      : items.length - 1
    e.preventDefault()
    items[to]?.focus()
  }

  return (
    <div
      role="toolbar"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className="flex flex-wrap items-center justify-between gap-md rounded-md border border-line bg-surface px-md py-sm"
    >
      <div className="flex flex-wrap items-center gap-sm">{children}</div>
      {end && <div className="flex flex-wrap items-center gap-sm">{end}</div>}
    </div>
  )
}
