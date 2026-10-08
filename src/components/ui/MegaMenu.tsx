'use client'

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { labelText } from '@/components/ui/parts'

export type MegaMenuLink = {
  id: string
  /** Sentence case: "Invoices", "Payment links". */
  label: string
  href: string
  /** One short line under the label, in Archivo. */
  description?: string
}

export type MegaMenuColumn = {
  id: string
  /** A short heading over the column: "Get paid", "Report". */
  heading: string
  links: MegaMenuLink[]
}

export type MegaMenuEntry = {
  id: string
  /** The top-level label in the bar. */
  label: string
  /** A plain link in the bar. Ignored when the entry has columns. */
  href?: string
  /** The wide panel's columns. An entry with columns opens a panel instead of navigating. */
  columns?: MegaMenuColumn[]
  /** Anything to feature at the end of the panel: a new release, a guide. */
  feature?: ReactNode
}

export type MegaMenuProps = {
  /** The top-level entries, in order. */
  entries: MegaMenuEntry[]
  /** Names the menu bar: "Product". */
  label: string
}

/**
 * A menu bar whose entries open wide panels of grouped links, for products with more pages than
 * a navbar can hold. Built on the WAI-ARIA menubar pattern. In the bar, Left and Right move between
 * entries, Down, Enter or Space opens one and focuses its first link, Home and End jump. In a
 * panel, Up and Down move through the links, Left and Right move between columns and then on to
 * the neighbouring entry, Escape closes it and returns focus to the bar, Tab closes it and moves on.
 * Panels also open on click; a click outside closes them.
 */
export function MegaMenu({ entries, label: ariaLabel }: MegaMenuProps) {
  const id = useId()
  const [open, setOpen] = useState<number | null>(null)
  const [focusTop, setFocusTop] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const tops = useRef<(HTMLElement | null)[]>([])
  // Link refs per entry, by column then row, so an earlier, wider panel leaves nothing stale.
  const links = useRef<Record<number, (HTMLAnchorElement | null)[][]>>({})
  const pending = useRef<'first' | null>(null)

  useEffect(() => {
    if (open === null) return
    if (pending.current === 'first') {
      links.current[open]?.[0]?.[0]?.focus()
      pending.current = null
    }
    const outside = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(null)
    }
    window.addEventListener('pointerdown', outside)
    return () => window.removeEventListener('pointerdown', outside)
  }, [open])

  const hasPanel = (i: number) => Boolean(entries[i]?.columns?.length)
  const goTop = (i: number, openIt: boolean, focusFirst = false) => {
    const n = (i + entries.length) % entries.length
    setFocusTop(n)
    tops.current[n]?.focus()
    if (openIt && hasPanel(n)) {
      if (focusFirst) pending.current = 'first'
      setOpen(n)
    } else setOpen(null)
  }

  const onTopKey = (e: KeyboardEvent, i: number) => {
    const keepOpen = open !== null
    if (e.key === 'ArrowRight') goTop(i + 1, keepOpen)
    else if (e.key === 'ArrowLeft') goTop(i - 1, keepOpen)
    else if (e.key === 'Home') goTop(0, false)
    else if (e.key === 'End') goTop(entries.length - 1, false)
    else if ((e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') && hasPanel(i)) {
      pending.current = 'first'
      setOpen(i)
    } else if (e.key === 'Escape') setOpen(null)
    else return
    e.preventDefault()
  }

  const onPanelKey = (e: KeyboardEvent, i: number) => {
    const cols = links.current[i] ?? []
    let c = cols.findIndex((col) => col.some((el) => el === document.activeElement))
    let r = c >= 0 ? cols[c].indexOf(document.activeElement as HTMLAnchorElement) : -1
    if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(null)
      tops.current[i]?.focus()
      return
    }
    if (e.key === 'Tab') {
      setOpen(null)
      return
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const flat = cols.flat().filter(Boolean)
      const at = flat.indexOf(document.activeElement as HTMLAnchorElement)
      const next = flat[(at + (e.key === 'ArrowDown' ? 1 : -1) + flat.length) % flat.length]
      next?.focus()
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const d = e.key === 'ArrowRight' ? 1 : -1
      if (cols[c + d]?.length) {
        c += d
        r = Math.min(r, cols[c].length - 1)
        cols[c][Math.max(0, r)]?.focus()
      } else goTop(i + d, true, true)
    } else if (e.key === 'Home') cols[0]?.[0]?.focus()
    else if (e.key === 'End') cols.flat().filter(Boolean).at(-1)?.focus()
    else return
    e.preventDefault()
  }

  return (
    <div ref={root} className="relative w-full">
      <div role="menubar" aria-label={ariaLabel} className="flex items-center gap-xs rounded-md border border-line bg-surface px-sm py-xs">
        {entries.map((entry, i) => {
          const panel = hasPanel(i)
          const cls = [
            'flex cursor-pointer items-center gap-xs rounded-sm border-0 bg-transparent px-md py-sm font-mono text-body no-underline transition-colors duration-fast',
            open === i ? 'bg-canvas text-ink' : 'text-muted hover:bg-canvas hover:text-ink',
          ].join(' ')
          return panel ? (
            <button
              key={entry.id}
              ref={(el) => {
                tops.current[i] = el
              }}
              type="button"
              role="menuitem"
              aria-haspopup="menu"
              aria-expanded={open === i}
              aria-controls={`${id}-${entry.id}`}
              tabIndex={focusTop === i ? 0 : -1}
              onClick={() => setOpen(open === i ? null : i)}
              onKeyDown={(e) => onTopKey(e, i)}
              onFocus={() => setFocusTop(i)}
              className={cls}
            >
              {entry.label}
              <svg aria-hidden viewBox="0 0 16 16" className={['size-md transition-transform duration-fast motion-reduce:transition-none', open === i ? 'rotate-180' : ''].join(' ')}>
                <path d="M4 6.5 8 10.5 12 6.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          ) : (
            <a
              key={entry.id}
              ref={(el) => {
                tops.current[i] = el
              }}
              href={entry.href}
              role="menuitem"
              tabIndex={focusTop === i ? 0 : -1}
              onKeyDown={(e) => onTopKey(e, i)}
              onFocus={() => setFocusTop(i)}
              className={cls}
            >
              {entry.label}
            </a>
          )
        })}
      </div>

      {entries.map((entry, i) =>
        hasPanel(i) && open === i ? (
          <div
            key={entry.id}
            id={`${id}-${entry.id}`}
            role="menu"
            aria-label={entry.label}
            onKeyDown={(e) => onPanelKey(e, i)}
            className="absolute inset-x-none top-full z-40 mt-xs flex flex-col gap-2xl rounded-md border border-line-strong bg-surface p-xl md:flex-row"
          >
            {entry.columns!.map((col, c) => (
              <div key={col.id} role="group" aria-labelledby={`${id}-${col.id}`} className="flex min-w-0 flex-1 flex-col gap-sm">
                <span id={`${id}-${col.id}`} role="presentation" className={labelText}>
                  {col.heading}
                </span>
                {col.links.map((l, r) => (
                  <a
                    key={l.id}
                    ref={(el) => {
                      ;((links.current[i] ??= [])[c] ??= [])[r] = el
                    }}
                    href={l.href}
                    role="menuitem"
                    tabIndex={-1}
                    onClick={() => setOpen(null)}
                    className="flex flex-col gap-2xs rounded-sm px-md py-sm no-underline transition-colors duration-fast hover:bg-canvas focus-visible:bg-canvas"
                  >
                    <span className="text-body text-ink">{l.label}</span>
                    {l.description && <span className="font-text text-caption leading-normal text-muted">{l.description}</span>}
                  </a>
                ))}
              </div>
            ))}
            {entry.feature && <div className="flex min-w-0 flex-1 flex-col rounded-md border border-line bg-canvas p-lg">{entry.feature}</div>}
          </div>
        ) : null,
      )}
    </div>
  )
}
