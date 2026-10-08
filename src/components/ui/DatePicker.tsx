'use client'

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useAnchoredPanel } from './internal/d1-anchor'
import { FieldFrame, describedByOf } from './internal/d1-field-frame'
import { Calendar, ChevronLeft, ChevronRight } from './internal/d1-icons'

export type DateRange = { start: Date; end: Date }
export type DatePickerValue = Date | DateRange | null
export type DatePreset = { label: string; value: Date | DateRange }

export type DatePickerProps = {
  /** Always visible, above the control. Uppercase label style. */
  label: string
  /** single picks one day; range picks a start and an end with two clicks. */
  mode?: 'single' | 'range'
  /** The value on first render: a Date in single mode, a { start, end } in range mode. */
  defaultValue?: DatePickerValue
  /** Called with the new value: a Date, a range, or null when cleared. */
  onChange?: (value: DatePickerValue) => void
  /** Shortcuts shown beside the calendar: "Last 7 days", "This month". */
  presets?: DatePreset[]
  /** A BCP 47 tag for month names, weekday names and the date format. */
  locale?: string
  /** 1 for Monday (the UK and most of Europe), 0 for Sunday. */
  weekStartsOn?: 0 | 1
  /** Days before this cannot be chosen. */
  min?: Date
  /** Days after this cannot be chosen. */
  max?: Date
  /** Shown in the empty control, in faint. */
  placeholder?: string
  /** One line under the control. Hidden while an error is showing. */
  hint?: string
  /** Replaces the hint, turns the border danger, and is announced as an alert. */
  error?: string
  /** Adds the green asterisk. */
  required?: boolean
  /** Inert. Border and text go to the disabled colour. */
  disabled?: boolean
  /** Submits the value with a form as ISO dates: one field, or name-start and name-end. */
  name?: string
}

const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const same = (a: Date | null | undefined, b: Date | null | undefined) => !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const addMonths = (d: Date, n: number) => {
  const t = new Date(d.getFullYear(), d.getMonth() + n, 1)
  return new Date(t.getFullYear(), t.getMonth(), Math.min(d.getDate(), new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate()))
}
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const isRange = (v: DatePickerValue | Date | DateRange | undefined): v is DateRange => !!v && !(v instanceof Date) && 'start' in v

/**
 * A date field with a calendar, for due dates, report periods and bookings. The control is
 * a button drawn like Field; it opens a non-modal dialog holding a month grid. In the grid,
 * the arrow keys move by a day or a week, Home and End go to the start and end of the week,
 * Page Up and Page Down change the month (with Shift, the year), Enter or Space picks the
 * day, and Escape closes and returns focus to the field. In range mode the first pick sets
 * the start and the second the end; the days between fill in as you move. Month and
 * weekday names, and the displayed format, come from Intl in the given locale.
 */
export function DatePicker({
  label,
  mode = 'single',
  defaultValue = null,
  onChange,
  presets,
  locale = 'en-GB',
  weekStartsOn = 1,
  min,
  max,
  placeholder = 'Choose a date',
  hint,
  error,
  required = false,
  disabled = false,
  name,
}: DatePickerProps) {
  const id = useId()
  const [value, setValue] = useState<DatePickerValue>(defaultValue)
  const [open, setOpen] = useState(false)
  const initialFocus = isRange(value) ? value.start : value instanceof Date ? value : new Date()
  const [focusDay, setFocusDay] = useState<Date>(day(initialFocus))
  const [pendingStart, setPendingStart] = useState<Date | null>(null)
  const [hoverDay, setHoverDay] = useState<Date | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const gridRef = useRef<HTMLTableElement>(null)
  const focusNext = useRef(false)
  const close = (refocus = true) => {
    setOpen(false)
    setPendingStart(null)
    if (refocus) triggerRef.current?.focus()
  }
  const { anchorRef, panelRef } = useAnchoredPanel<HTMLDivElement, HTMLDivElement>({ open, onDismiss: () => close(false), matchWidth: false })

  const fmt = useMemo(() => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }), [locale])
  const monthFmt = useMemo(() => new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }), [locale])
  const fullFmt = useMemo(() => new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), [locale])
  const weekdays = useMemo(() => {
    const short = new Intl.DateTimeFormat(locale, { weekday: 'short' })
    const long = new Intl.DateTimeFormat(locale, { weekday: 'long' })
    // 4 Jan 2026 is a Sunday; walk a week from there.
    return Array.from({ length: 7 }, (_, i) => new Date(2026, 0, 4 + ((i + weekStartsOn) % 7))).map((d) => ({ short: short.format(d), long: long.format(d) }))
  }, [locale, weekStartsOn])

  const blocked = (d: Date) => (min ? d < day(min) : false) || (max ? d > day(max) : false)

  const weeks = useMemo(() => {
    const first = new Date(focusDay.getFullYear(), focusDay.getMonth(), 1)
    const lead = (first.getDay() - weekStartsOn + 7) % 7
    const start = addDays(first, -lead)
    return Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, d) => addDays(start, w * 7 + d)))
  }, [focusDay, weekStartsOn])

  useEffect(() => {
    if (!open) return
    focusNext.current = true
  }, [open])

  useEffect(() => {
    if (!focusNext.current || !open) return
    focusNext.current = false
    gridRef.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus()
  })

  const commit = (v: DatePickerValue) => {
    setValue(v)
    onChange?.(v)
  }

  const pick = (d: Date) => {
    if (blocked(d)) return
    if (mode === 'single') {
      commit(d)
      close()
      return
    }
    if (!pendingStart) {
      setPendingStart(d)
      return
    }
    const [start, end] = d < pendingStart ? [d, pendingStart] : [pendingStart, d]
    commit({ start, end })
    close()
  }

  const moveFocus = (d: Date) => {
    focusNext.current = true
    setFocusDay(d)
  }

  const onGridKey = (e: KeyboardEvent) => {
    const map: Record<string, () => Date> = {
      ArrowLeft: () => addDays(focusDay, -1),
      ArrowRight: () => addDays(focusDay, 1),
      ArrowUp: () => addDays(focusDay, -7),
      ArrowDown: () => addDays(focusDay, 7),
      Home: () => addDays(focusDay, -((focusDay.getDay() - weekStartsOn + 7) % 7)),
      End: () => addDays(focusDay, 6 - ((focusDay.getDay() - weekStartsOn + 7) % 7)),
      PageUp: () => addMonths(focusDay, e.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focusDay, e.shiftKey ? 12 : 1),
    }
    if (map[e.key]) {
      e.preventDefault()
      const d = map[e.key]()
      moveFocus(d)
      if (pendingStart) setHoverDay(d)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      pick(focusDay)
    }
  }

  const display = isRange(value) ? `${fmt.format(value.start)} to ${fmt.format(value.end)}` : value instanceof Date ? fmt.format(value) : ''
  const range = isRange(value) ? value : null
  const previewEnd = pendingStart ? (hoverDay ?? pendingStart) : null
  const [rs, re] = pendingStart && previewEnd ? (previewEnd < pendingStart ? [previewEnd, pendingStart] : [pendingStart, previewEnd]) : range ? [range.start, range.end] : [null, null]
  const today = day(new Date())
  const describedBy = describedByOf(id, hint, error)

  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} required={required}>
      <div ref={anchorRef} className="flex">
        <button
          ref={triggerRef}
          id={id}
          type="button"
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={`${id}-dialog`}
          aria-labelledby={`${id}-label ${id}-value`}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          onClick={() => (open ? close() : setOpen(true))}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown' && !open) {
              e.preventDefault()
              setOpen(true)
            }
          }}
          className={[
            'flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-md rounded-sm border bg-surface px-lg py-md text-left font-mono text-body outline-none transition-colors duration-fast',
            error ? 'border-danger' : open ? 'border-sample' : 'border-line-interactive focus-visible:border-sample',
            'disabled:cursor-not-allowed disabled:border-disabled disabled:bg-transparent disabled:text-disabled',
          ].join(' ')}
        >
          <span id={`${id}-value`} className={['truncate', display ? (disabled ? 'text-disabled' : 'text-ink') : disabled ? 'text-disabled' : 'text-muted'].join(' ')}>{display || placeholder}</span>
          <Calendar className={['size-md', disabled ? 'text-disabled' : 'text-muted'].join(' ')} />
        </button>
        {name &&
          (range ? (
            <>
              <input type="hidden" name={`${name}-start`} value={iso(range.start)} />
              <input type="hidden" name={`${name}-end`} value={iso(range.end)} />
            </>
          ) : (
            <input type="hidden" name={name} value={value instanceof Date ? iso(value) : ''} />
          ))}
      </div>

      <div
        ref={panelRef}
        id={`${id}-dialog`}
        popover="manual"
        role="dialog"
        aria-modal="false"
        aria-label={mode === 'range' ? `Choose dates for ${label.toLowerCase()}` : `Choose a date for ${label.toLowerCase()}`}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault()
            close()
          }
        }}
        className="fixed inset-auto m-0 rounded-md border border-line-strong bg-surface p-md text-ink"
      >
        <div className="flex gap-lg">
          {presets?.length ? (
            <ul className="m-0 flex list-none flex-col gap-2xs border-r border-line p-0 pr-md">
              {presets.map((p) => (
                <li key={p.label}>
                  <button
                    type="button"
                    onClick={() => {
                      commit(p.value)
                      close()
                    }}
                    className="w-full cursor-pointer whitespace-nowrap rounded-sm border-0 bg-transparent px-sm py-xs text-left font-mono text-caption text-muted transition-colors duration-fast hover:bg-canvas hover:text-ink"
                  >
                    {p.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="flex flex-col gap-sm">
            <div className="flex items-center justify-between gap-md">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => setFocusDay(addMonths(focusDay, -1))}
                className="flex size-3xl cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent text-muted transition-colors duration-fast hover:bg-canvas hover:text-ink"
              >
                <ChevronLeft />
              </button>
              <p id={`${id}-month`} aria-live="polite" className="m-0 text-body text-ink">
                {monthFmt.format(focusDay)}
              </p>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => setFocusDay(addMonths(focusDay, 1))}
                className="flex size-3xl cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent text-muted transition-colors duration-fast hover:bg-canvas hover:text-ink"
              >
                <ChevronRight />
              </button>
            </div>
            <table ref={gridRef} role="grid" aria-labelledby={`${id}-month`} onKeyDown={onGridKey} className="border-collapse font-mono text-caption">
              <thead>
                <tr>
                  {weekdays.map((w) => (
                    <th key={w.long} scope="col" abbr={w.long} className="size-3xl p-none text-center text-micro font-normal text-muted">
                      {w.short.slice(0, 2)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody onMouseLeave={() => setHoverDay(null)}>
                {weeks.map((week) => (
                  <tr key={iso(week[0])}>
                    {week.map((d) => {
                      const outside = d.getMonth() !== focusDay.getMonth()
                      const off = blocked(d)
                      const isStart = same(d, rs)
                      const isEnd = same(d, re)
                      const single = mode === 'single' && value instanceof Date && same(d, value)
                      const ends = single || isStart || isEnd
                      const between = !!rs && !!re && d > rs && d < re
                      return (
                        <td
                          key={iso(d)}
                          tabIndex={same(d, focusDay) ? 0 : -1}
                          aria-selected={ends || between}
                          aria-disabled={off || undefined}
                          aria-current={same(d, today) ? 'date' : undefined}
                          aria-label={fullFmt.format(d)}
                          onClick={() => {
                            setFocusDay(d)
                            pick(d)
                          }}
                          onMouseEnter={() => pendingStart && setHoverDay(d)}
                          className={[
                            'size-3xl border border-transparent p-none text-center tabular-nums outline-none transition-colors duration-fast',
                            between ? 'rounded-none' : 'rounded-sm',
                            'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sample',
                            off ? 'cursor-not-allowed text-disabled' : 'cursor-pointer',
                            ends ? 'bg-sample-fill text-on-sample' : between ? 'bg-success-subtle text-ink' : off ? '' : outside ? 'text-muted hover:bg-canvas' : 'text-ink hover:bg-canvas',
                            same(d, today) && !ends ? 'border-line-strong' : '',
                          ].join(' ')}
                        >
                          {d.getDate()}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between gap-md border-t border-line pt-sm">
              <p className="m-0 font-text text-caption text-muted" aria-live="polite">
                {mode === 'range' ? (pendingStart ? `From ${fmt.format(pendingStart)}. Choose the end date.` : 'Choose the start date.') : 'Choose a date.'}
              </p>
              {value && (
                <button
                  type="button"
                  onClick={() => {
                    commit(null)
                    close()
                  }}
                  className="cursor-pointer rounded-sm border-0 bg-transparent px-xs font-mono text-caption text-muted transition-colors duration-fast hover:text-ink"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </FieldFrame>
  )
}
