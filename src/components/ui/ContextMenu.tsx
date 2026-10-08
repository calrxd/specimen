'use client'

import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode } from 'react'

export type ContextMenuItem =
  | {
      id: string
      /** Sentence case, a verb: "Copy link", "Mark as paid". */
      label: string
      onSelect: () => void
      /** A keyboard shortcut to show beside it, as text: "Ctrl C". Display only. */
      shortcut?: string
      /** danger for an action that destroys something. Put it last. */
      tone?: 'default' | 'danger'
      disabled?: boolean
    }
  | { id: string; separator: true }

export type ContextMenuProps = {
  /** The area that opens the menu: a table row, a card, a canvas. */
  children: ReactNode
  /** Names the area for keyboard and screen reader users: "Invoice INV-2048". */
  label: string
  /** The actions, in order, with separators between groups. */
  items: ContextMenuItem[]
}

const LONG_PRESS = 500

/**
 * A menu of actions on whatever is under the pointer: right-click, a long press on touch, or
 * Shift F10 and the context menu key when the area has focus. It opens at the pointer, inside
 * the viewport, with focus on the first item. Up and Down move, Home and End jump, typing a
 * letter jumps to the next item starting with it, Enter or Space runs the item, Escape and Tab
 * close it and return focus to the area.
 */
export function ContextMenu({ children, label, items }: ContextMenuProps) {
  const id = useId()
  const [at, setAt] = useState<{ x: number; y: number } | null>(null)
  const area = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const timer = useRef<number | undefined>(undefined)

  const actions = items.map((it, i) => ('separator' in it || it.disabled ? -1 : i)).filter((i) => i >= 0)

  const openAt = (x: number, y: number) => setAt({ x, y })
  const close = (refocus = true) => {
    setAt(null)
    if (refocus) area.current?.focus()
  }

  // Keep the panel inside the viewport once its size is known.
  useLayoutEffect(() => {
    const el = panel.current
    if (!at || !el) return
    const r = el.getBoundingClientRect()
    const x = Math.min(at.x, window.innerWidth - r.width - 8)
    const y = Math.min(at.y, window.innerHeight - r.height - 8)
    if (x !== at.x || y !== at.y) setAt({ x: Math.max(8, x), y: Math.max(8, y) })
    if (actions.length) refs.current[actions[0]]?.focus()
    // Runs once per opening; the clamped position does not need a second focus pass.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [at === null])

  useEffect(() => {
    if (!at) return
    const outside = (e: Event) => {
      if (!panel.current?.contains(e.target as Node)) close(false)
    }
    window.addEventListener('pointerdown', outside)
    window.addEventListener('scroll', outside, true)
    window.addEventListener('resize', outside)
    return () => {
      window.removeEventListener('pointerdown', outside)
      window.removeEventListener('scroll', outside, true)
      window.removeEventListener('resize', outside)
    }
  }, [at])

  const onContext = (e: MouseEvent) => {
    e.preventDefault()
    openAt(e.clientX, e.clientY)
  }
  const onAreaKey = (e: KeyboardEvent) => {
    if ((e.shiftKey && e.key === 'F10') || e.key === 'ContextMenu') {
      e.preventDefault()
      const r = area.current!.getBoundingClientRect()
      openAt(r.left + 16, r.top + 16)
    }
  }
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType !== 'touch') return
    const { clientX, clientY } = e
    timer.current = window.setTimeout(() => openAt(clientX, clientY), LONG_PRESS)
  }
  const cancelPress = () => window.clearTimeout(timer.current)

  const onMenuKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Tab') {
      e.preventDefault()
      close()
      return
    }
    const current = refs.current.findIndex((el) => el === document.activeElement)
    const pos = actions.indexOf(current)
    let to: number | undefined =
      e.key === 'ArrowDown' ? actions[(pos + 1) % actions.length]
      : e.key === 'ArrowUp' ? actions[(pos - 1 + actions.length) % actions.length]
      : e.key === 'Home' ? actions[0]
      : e.key === 'End' ? actions[actions.length - 1]
      : undefined
    if (to === undefined && e.key.length === 1 && /\S/.test(e.key)) {
      const ch = e.key.toLowerCase()
      const order = [...actions.slice(pos + 1), ...actions.slice(0, pos + 1)]
      to = order.find((i) => {
        const it = items[i]
        return !('separator' in it) && it.label.toLowerCase().startsWith(ch)
      })
    }
    if (to === undefined) return
    e.preventDefault()
    refs.current[to]?.focus()
  }

  return (
    <>
      <div
        ref={area}
        tabIndex={0}
        role="group"
        aria-label={label}
        aria-describedby={`${id}-hint`}
        onContextMenu={onContext}
        onKeyDown={onAreaKey}
        onPointerDown={onPointerDown}
        onPointerUp={cancelPress}
        onPointerLeave={cancelPress}
        onPointerCancel={cancelPress}
        className="rounded-sm"
      >
        {children}
        <span id={`${id}-hint`} className="sr-only">
          Press Shift F10 for actions.
        </span>
      </div>
      {at && (
        <div
          ref={panel}
          id={id}
          role="menu"
          aria-label={`Actions for ${label}`}
          onKeyDown={onMenuKey}
          className="fixed z-50 flex min-w-9xl flex-col rounded-md border border-line-strong bg-surface p-xs"
          style={{ left: at.x, top: at.y }}
        >
          {items.map((it, i) =>
            'separator' in it ? (
              <div key={it.id} role="separator" className="my-xs border-t border-line" />
            ) : (
              <button
                key={it.id}
                ref={(el) => {
                  refs.current[i] = el
                }}
                type="button"
                role="menuitem"
                tabIndex={-1}
                disabled={it.disabled}
                aria-keyshortcuts={it.shortcut?.replace(/ /g, '+')}
                onClick={() => {
                  it.onSelect()
                  close()
                }}
                className={[
                  'flex cursor-pointer items-center justify-between gap-2xl whitespace-nowrap rounded-sm border-0 bg-transparent px-md py-sm text-left font-mono text-body outline-none transition-colors duration-fast',
                  'hover:bg-canvas focus-visible:bg-canvas',
                  it.tone === 'danger' ? 'text-danger' : 'text-ink',
                  'disabled:cursor-not-allowed disabled:bg-transparent disabled:text-disabled',
                ].join(' ')}
              >
                <span>{it.label}</span>
                {it.shortcut && <span className={['text-caption', it.disabled ? 'text-disabled' : 'text-muted'].join(' ')}>{it.shortcut}</span>}
              </button>
            ),
          )}
        </div>
      )}
    </>
  )
}
