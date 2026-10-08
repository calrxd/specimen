'use client'

import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'

export type SplitterOrientation = 'horizontal' | 'vertical'

export type SplitterProps = {
  /** horizontal puts the panes side by side; vertical stacks them. */
  orientation?: SplitterOrientation
  /** The first pane: left, or top. */
  start: ReactNode
  /** The second pane: right, or bottom. */
  end: ReactNode
  /** Names the divider for screen readers, after the pane it resizes: "Resize file list". */
  label: string
  /** Size of the first pane at first render, as a percentage of the whole. */
  defaultSize?: number
  /** Smallest the first pane can get, as a percentage. */
  min?: number
  /** Largest the first pane can get, as a percentage. */
  max?: number
  /** How far one arrow key press moves the divider, as a percentage. */
  step?: number
  /** Called with the new size of the first pane, as a percentage, after every change. */
  onResize?: (size: number) => void
  /** Height of the whole splitter in pixels. Panes scroll inside it. */
  height?: number
}

/**
 * Two resizable panes for an editor and its inspector, or a list and its detail. The divider
 * is a focusable separator carrying its position in aria-valuenow: Left and Right (Up and Down
 * when stacked) move it, Home and End jump to the limits, Enter collapses the first pane to its
 * minimum and restores it. Dragging uses pointer capture, so it works with a mouse, pen or finger.
 */
export function Splitter({
  orientation = 'horizontal',
  start,
  end,
  label,
  defaultSize = 50,
  min = 20,
  max = 80,
  step = 5,
  onResize,
  height = 320,
}: SplitterProps) {
  const [size, setSize] = useState(defaultSize)
  const restore = useRef(defaultSize)
  const root = useRef<HTMLDivElement>(null)
  const row = orientation === 'horizontal'

  const set = (n: number) => {
    const v = Math.round(Math.min(max, Math.max(min, n)))
    setSize(v)
    onResize?.(v)
  }

  const onKey = (e: KeyboardEvent) => {
    const less = row ? 'ArrowLeft' : 'ArrowUp'
    const more = row ? 'ArrowRight' : 'ArrowDown'
    if (e.key === less) set(size - step)
    else if (e.key === more) set(size + step)
    else if (e.key === 'Home') set(min)
    else if (e.key === 'End') set(max)
    else if (e.key === 'Enter') {
      if (size > min) {
        restore.current = size
        set(min)
      } else set(restore.current)
    } else return
    e.preventDefault()
  }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId) || !root.current) return
    const r = root.current.getBoundingClientRect()
    set(row ? ((e.clientX - r.left) / r.width) * 100 : ((e.clientY - r.top) / r.height) * 100)
  }

  return (
    <div
      ref={root}
      className={['flex w-full overflow-hidden rounded-md border border-line bg-surface', row ? 'flex-row' : 'flex-col'].join(' ')}
      style={{ height }}
    >
      <div className="min-h-0 min-w-0 overflow-auto" style={{ flexBasis: `${size}%`, flexShrink: 0 }}>
        {start}
      </div>
      <div
        role="separator"
        tabIndex={0}
        aria-label={label}
        aria-orientation={row ? 'vertical' : 'horizontal'}
        aria-valuenow={size}
        aria-valuemin={min}
        aria-valuemax={max}
        onKeyDown={onKey}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        className={[
          'group relative flex shrink-0 touch-none items-center justify-center bg-line transition-colors duration-fast hover:bg-sample-fill focus-visible:bg-sample-fill',
          row ? 'w-px cursor-col-resize' : 'h-px cursor-row-resize',
        ].join(' ')}
      >
        {/* A wider invisible hit area, so the 1px rule is easy to grab. */}
        <span aria-hidden className={['absolute', row ? 'inset-y-none -inset-x-sm' : 'inset-x-none -inset-y-sm'].join(' ')} />
        <span
          aria-hidden
          className={[
            'relative rounded-full bg-line-interactive transition-colors duration-fast group-hover:bg-sample-fill group-focus-visible:bg-sample-fill',
            row ? 'h-2xl w-xs' : 'h-xs w-2xl',
          ].join(' ')}
        />
      </div>
      <div className="min-h-0 min-w-0 flex-1 overflow-auto">{end}</div>
    </div>
  )
}
