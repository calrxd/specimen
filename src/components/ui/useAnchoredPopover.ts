'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'

export type PopoverSide = 'bottom' | 'top'
export type PopoverAlign = 'start' | 'end'

/**
 * Shared by Popover and Menu. The panel uses the native popover attribute, so it sits in
 * the top layer and the browser handles Escape and outside clicks. The trigger is wired
 * with popovertarget, which also stops an outside-click close and the trigger's own click
 * from fighting each other. What the platform does not do yet in every browser is anchor
 * the panel to its trigger, so that part is measured here, on open and while open.
 */
export function useAnchoredPopover(side: PopoverSide, align: PopoverAlign) {
  const id = useId()
  const triggerRef = useRef<HTMLElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)

  const place = useCallback(() => {
    const trigger = triggerRef.current
    const panel = panelRef.current
    if (!trigger || !panel) return
    const t = trigger.getBoundingClientRect()
    const p = panel.getBoundingClientRect()
    const gap = parseFloat(getComputedStyle(panel).getPropertyValue('--spacing-sm')) || 8
    const top = side === 'bottom' ? t.bottom + gap : t.top - gap - p.height
    const left = align === 'start' ? t.left : t.right - p.width
    // The measurements are on-screen pixels. Inside a CSS zoom (a scaled preview, say) the
    // panel's own top and left are zoomed too, so divide by its zoom or it lands twice as far.
    const zoom = (panel as HTMLElement & { currentCSSZoom?: number }).currentCSSZoom ?? 1
    // Keep the panel on screen: clamp to the viewport with the same gap as a margin.
    panel.style.top = `${Math.max(gap, Math.min(top, window.innerHeight - p.height - gap)) / zoom}px`
    panel.style.left = `${Math.max(gap, Math.min(left, window.innerWidth - p.width - gap)) / zoom}px`
  }, [side, align])

  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    const onToggle = (e: Event) => setOpen((e as ToggleEvent).newState === 'open')
    panel.addEventListener('toggle', onToggle)
    return () => panel.removeEventListener('toggle', onToggle)
  }, [])

  useEffect(() => {
    if (!open) return
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open, place])

  const close = useCallback(() => {
    panelRef.current?.hidePopover()
    triggerRef.current?.focus()
  }, [])

  return { id, open, triggerRef, panelRef, close }
}
