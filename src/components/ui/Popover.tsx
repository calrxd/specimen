'use client'

import { cloneElement, type ReactElement, type ReactNode, type Ref } from 'react'
import { useAnchoredPopover, type PopoverAlign, type PopoverSide } from './useAnchoredPopover'

type TriggerProps = {
  ref?: Ref<HTMLElement>
  popoverTarget?: string
  'aria-expanded'?: boolean
  'aria-controls'?: string
}

export type PopoverProps = {
  /** The button that opens it. Must render a native button: the browser wires the two together. */
  trigger: ReactElement<TriggerProps>
  /** What the panel holds: a short form, a set of filters, a definition. */
  children: ReactNode
  /** Which side of the trigger it opens on. */
  side?: PopoverSide
  /** Which edge of the trigger the panel lines up with. */
  align?: PopoverAlign
  /** The panel's heading. Sentence case, a noun: "Filters". Also its accessible name. */
  label: string
}

/**
 * A panel of extra content opened from a button, dismissed by Escape or a click outside.
 * Not modal: the page stays usable behind it. Use Dialog when the user must answer before
 * going on. Flat like every overlay: surface fill and a line-strong edge, no shadow.
 */
export function Popover({ trigger, children, side = 'bottom', align = 'start', label }: PopoverProps) {
  const { id, open, triggerRef, panelRef } = useAnchoredPopover(side, align)

  return (
    <>
      {cloneElement(trigger, {
        ref: (el: HTMLElement | null) => {
          triggerRef.current = el
        },
        popoverTarget: id,
        'aria-expanded': open,
        'aria-controls': id,
      })}
      <div
        ref={panelRef}
        id={id}
        popover="auto"
        role="dialog"
        aria-labelledby={`${id}-label`}
        className="fixed inset-auto m-0 max-w-measure-sm rounded-md border border-line-strong bg-surface p-lg text-body text-ink"
      >
        <div className="flex flex-col gap-md">
          <p id={`${id}-label`} className="m-0 text-body font-medium text-ink">
            {label}
          </p>
          {children}
        </div>
      </div>
    </>
  )
}
