'use client'

import { cloneElement, useEffect, useRef, type KeyboardEvent, type ReactElement, type Ref } from 'react'
import { useAnchoredPopover, type PopoverAlign } from './useAnchoredPopover'

type TriggerProps = {
  ref?: Ref<HTMLElement>
  popoverTarget?: string
  'aria-expanded'?: boolean
  'aria-controls'?: string
  'aria-haspopup'?: 'menu'
}

export type MenuItem = {
  id: string
  /** Sentence case, a verb: "Duplicate", "Copy link". */
  label: string
  onSelect: () => void
  /** danger for an action that destroys something. Put it last. */
  tone?: 'default' | 'danger'
  disabled?: boolean
}

export type MenuProps = {
  /** The button that opens it. Must render a native button. */
  trigger: ReactElement<TriggerProps>
  /** The actions, in order. Content, not a Figma property: the library shows four. */
  items: MenuItem[]
  /** Which edge of the trigger the menu lines up with. end for a menu at the right of a row. */
  align?: PopoverAlign
}

/**
 * A list of actions opened from a button. Opens below its trigger with focus on the first
 * item; arrow keys move, Home and End jump, Enter or Space runs the item and closes the
 * menu, Escape closes it and returns focus to the trigger, Tab closes it and moves on.
 */
export function Menu({ trigger, items, align = 'start' }: MenuProps) {
  const { id, open, triggerRef, panelRef, close } = useAnchoredPopover('bottom', align)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const enabled = items.map((it, i) => (it.disabled ? -1 : i)).filter((i) => i >= 0)

  useEffect(() => {
    if (open && enabled.length) itemRefs.current[enabled[0]]?.focus()
    // Focus only on the transition to open; the item list is stable while it is showing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const onKeyDown = (e: KeyboardEvent) => {
    // Tab leaves the menu, as in a native one: close it and let focus move on.
    if (e.key === 'Tab') {
      panelRef.current?.hidePopover()
      return
    }
    const current = itemRefs.current.findIndex((el) => el === document.activeElement)
    const pos = enabled.indexOf(current)
    const to =
      e.key === 'ArrowDown' ? enabled[(pos + 1) % enabled.length]
      : e.key === 'ArrowUp' ? enabled[(pos - 1 + enabled.length) % enabled.length]
      : e.key === 'Home' ? enabled[0]
      : e.key === 'End' ? enabled[enabled.length - 1]
      : undefined
    if (to === undefined) return
    e.preventDefault()
    itemRefs.current[to]?.focus()
  }

  return (
    <>
      {cloneElement(trigger, {
        ref: (el: HTMLElement | null) => {
          triggerRef.current = el
        },
        popoverTarget: id,
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        'aria-controls': id,
      })}
      <div
        ref={panelRef}
        id={id}
        popover="auto"
        role="menu"
        onKeyDown={onKeyDown}
        className="fixed inset-auto m-0 flex-col rounded-md border border-line-strong bg-surface p-xs [&:popover-open]:flex"
      >
        {items.map((it, i) => (
          <button
            key={it.id}
            ref={(el) => {
              itemRefs.current[i] = el
            }}
            type="button"
            role="menuitem"
            tabIndex={-1}
            disabled={it.disabled}
            onClick={() => {
              it.onSelect()
              close()
            }}
            className={[
              'cursor-pointer whitespace-nowrap rounded-sm border-0 bg-transparent px-md py-sm text-left font-mono text-body outline-none transition-colors duration-fast',
              'hover:bg-canvas focus-visible:bg-canvas',
              it.tone === 'danger' ? 'text-danger' : 'text-ink',
              'disabled:cursor-not-allowed disabled:bg-transparent disabled:text-disabled',
            ].join(' ')}
          >
            {it.label}
          </button>
        ))}
      </div>
    </>
  )
}
