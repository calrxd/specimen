'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from 'react'

/**
 * A controlled, anchored panel for the Pro comboboxes and the date picker. The panel uses
 * popover="manual" so it sits in the top layer and escapes any overflow clipping, but the
 * component owns open and close: a combobox has to stay open while its input has focus,
 * which popover="auto" cannot express. Placement is measured on open and while open; the
 * panel matches the anchor's width unless `matchWidth` is false, and flips above the anchor
 * when there is no room below.
 */
export function useAnchoredPanel<A extends HTMLElement, P extends HTMLElement>({
  open,
  onDismiss,
  matchWidth = true,
}: {
  open: boolean
  /** Called on a pointer down outside both the anchor and the panel. */
  onDismiss: () => void
  matchWidth?: boolean
}): { anchorRef: RefObject<A | null>; panelRef: RefObject<P | null> } {
  const anchorRef = useRef<A | null>(null)
  const panelRef = useRef<P | null>(null)
  const dismiss = useRef(onDismiss)
  dismiss.current = onDismiss

  const place = useCallback(() => {
    const anchor = anchorRef.current
    const panel = panelRef.current
    if (!anchor || !panel) return
    const a = anchor.getBoundingClientRect()
    if (matchWidth) panel.style.width = `${a.width}px`
    const p = panel.getBoundingClientRect()
    const gap = parseFloat(getComputedStyle(panel).getPropertyValue('--spacing-xs')) || 4
    const below = a.bottom + gap
    const above = a.top - gap - p.height
    const top = below + p.height > window.innerHeight - gap && above > gap ? above : below
    panel.style.top = `${Math.max(gap, Math.min(top, window.innerHeight - p.height - gap))}px`
    panel.style.left = `${Math.max(gap, Math.min(a.left, window.innerWidth - p.width - gap))}px`
  }, [matchWidth])

  useLayoutEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    const showing = panel.matches(':popover-open')
    if (open && !showing) panel.showPopover()
    if (!open && showing) panel.hidePopover()
    if (open) place()
  }, [open, place])

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node
      if (anchorRef.current?.contains(t) || panelRef.current?.contains(t)) return
      dismiss.current()
    }
    // Content inside the panel can change its height (filtering a list), so re-place on resize too.
    const ro = new ResizeObserver(place)
    if (panelRef.current) ro.observe(panelRef.current)
    document.addEventListener('pointerdown', onPointer)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      ro.disconnect()
      document.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open, place])

  return { anchorRef, panelRef }
}
