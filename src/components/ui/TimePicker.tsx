'use client'

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useAnchoredPanel } from './internal/d1-anchor'
import { FieldFrame, describedByOf } from './internal/d1-field-frame'
import { LISTBOX_MAX_H, optionBar } from './internal/listbox'

export type TimePickerFormat = '24h' | '12h'

export type TimePickerProps = {
  /** Always visible, above the control. Uppercase label style. */
  label: string
  /** The time on first render, as 24-hour "HH:MM": "09:30". Uncontrolled; pass onChange to observe it. */
  defaultValue?: string
  /** Called with the chosen time as "HH:MM", or null when cleared. */
  onChange?: (value: string | null) => void
  /** Minutes between the times in the list. 15 for meetings, 30 for bookings, 5 for fine control. */
  step?: number
  /** The earliest time in the list, as "HH:MM". */
  min?: string
  /** The latest time in the list, as "HH:MM". */
  max?: string
  /** 24h shows 14:30; 12h shows 2:30 pm. The submitted value is always 24-hour. */
  format?: TimePickerFormat
  /** Shown in the empty control, in muted. */
  placeholder?: string
  /** One line under the control. Hidden while an error is showing. */
  hint?: string
  /** Replaces the hint, turns the border danger, and is announced as an alert. */
  error?: string
  /** Adds the green asterisk. */
  required?: boolean
  /** Inert. Border and text go to the disabled colour. */
  disabled?: boolean
  /** Submits the value with a form as "HH:MM". */
  name?: string
}

const toMinutes = (hhmm: string) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim())
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  return h < 24 && min < 60 ? h * 60 + min : null
}
const toHHMM = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
const display = (minutes: number, format: TimePickerFormat) => {
  const h = Math.floor(minutes / 60)
  const m = String(minutes % 60).padStart(2, '0')
  if (format === '24h') return `${String(h).padStart(2, '0')}:${m}`
  return `${h % 12 === 0 ? 12 : h % 12}:${m} ${h < 12 ? 'am' : 'pm'}`
}

function Clock({ className }: { className: string }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className={['pointer-events-none size-md shrink-0', className].join(' ')}>
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 4.5V8l2.5 1.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}

/**
 * A time field with a list of times, for meetings, bookings and opening hours. The control is a
 * button drawn like Field; it opens a listbox of times every `step` minutes between `min` and
 * `max`. In the list, the arrow keys move one time, Page Up and Page Down move an hour, Home and
 * End go to the first and last time, typing digits jumps to the first time that starts with
 * them, Enter picks, and Escape closes and returns focus to the field. The value is always
 * 24-hour "HH:MM", whichever format is shown, so it submits and stores the same everywhere.
 */
export function TimePicker({
  label,
  defaultValue,
  onChange,
  step = 15,
  min = '00:00',
  max = '23:59',
  format = '24h',
  placeholder = 'Choose a time',
  hint,
  error,
  required = false,
  disabled = false,
  name,
}: TimePickerProps) {
  const id = useId()
  const [value, setValue] = useState<number | null>(defaultValue ? toMinutes(defaultValue) : null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const typed = useRef({ text: '', at: 0 })
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const times = useMemo(() => {
    const from = toMinutes(min) ?? 0
    const to = toMinutes(max) ?? 24 * 60 - 1
    const every = Math.max(1, Math.round(step))
    const out: number[] = []
    for (let t = from; t <= to; t += every) out.push(t)
    return out
  }, [min, max, step])

  const close = (refocus = true) => {
    setOpen(false)
    if (refocus) triggerRef.current?.focus()
  }
  const { anchorRef, panelRef } = useAnchoredPanel<HTMLDivElement, HTMLDivElement>({ open, onDismiss: () => close(false) })

  const openList = () => {
    // Start on the chosen time, else the nearest time to now, so the list opens where a person looks.
    const now = new Date()
    const target = value ?? now.getHours() * 60 + now.getMinutes()
    const nearest = times.reduce((best, t, i) => (Math.abs(t - target) < Math.abs(times[best] - target) ? i : best), 0)
    setActive(value !== null && times.includes(value) ? times.indexOf(value) : nearest)
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    listRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    listRef.current?.querySelector(`#${CSS.escape(`${id}-opt-${active}`)}`)?.scrollIntoView({ block: 'nearest' })
  }, [open, active, id])

  const pick = (i: number) => {
    const t = times[i]
    if (t === undefined) return
    setValue(t)
    onChange?.(toHHMM(t))
    close()
  }

  const perHour = Math.max(1, Math.round(60 / Math.max(1, step)))
  const onListKey = (e: KeyboardEvent) => {
    const last = times.length - 1
    const moves: Record<string, () => number> = {
      ArrowDown: () => Math.min(last, active + 1),
      ArrowUp: () => Math.max(0, active - 1),
      PageDown: () => Math.min(last, active + perHour),
      PageUp: () => Math.max(0, active - perHour),
      Home: () => 0,
      End: () => last,
    }
    if (moves[e.key]) {
      e.preventDefault()
      setActive(moves[e.key]())
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      pick(active)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      close()
    } else if (e.key === 'Tab') {
      close(false)
    } else if (/^[0-9:apm ]$/i.test(e.key)) {
      // Type-ahead: "9" goes to 09:00, "14" to 14:00, "2:3" to 2:30 pm in 12-hour.
      const now = Date.now()
      const text = (now - typed.current.at > 800 ? '' : typed.current.text) + e.key.toLowerCase()
      typed.current = { text, at: now }
      const hit = times.findIndex((t) => {
        const shown = display(t, format).toLowerCase()
        return shown.startsWith(text) || shown.replace(/^0/, '').startsWith(text)
      })
      if (hit >= 0) setActive(hit)
    }
  }

  const describedBy = describedByOf(id, hint, error)
  const shown = value === null ? '' : display(value, format)

  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} required={required}>
      <div ref={anchorRef} className="flex">
        <button
          ref={triggerRef}
          id={id}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-labelledby={`${id}-label ${id}-value`}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          onClick={() => (open ? close() : openList())}
          onKeyDown={(e) => {
            if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !open) {
              e.preventDefault()
              openList()
            }
          }}
          className={[
            'flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-md rounded-sm border bg-surface px-lg py-md text-left font-mono text-body tabular-nums outline-none transition-colors duration-fast',
            error ? 'border-danger' : open ? 'border-sample' : 'border-line-interactive focus-visible:border-sample',
            'disabled:cursor-not-allowed disabled:border-disabled disabled:bg-transparent disabled:text-disabled',
          ].join(' ')}
        >
          <span id={`${id}-value`} className={['truncate', disabled ? 'text-disabled' : shown ? 'text-ink' : 'text-muted'].join(' ')}>
            {shown || placeholder}
          </span>
          <Clock className={disabled ? 'text-disabled' : 'text-muted'} />
        </button>
        {name && <input type="hidden" name={name} value={value === null ? '' : toHHMM(value)} />}
      </div>

      <div ref={panelRef} popover="manual" className="fixed inset-auto m-0 rounded-md border border-line-strong bg-surface p-xs text-ink">
        <div
          ref={listRef}
          id={`${id}-list`}
          role="listbox"
          tabIndex={-1}
          aria-label={`Times for ${label.toLowerCase()}`}
          aria-activedescendant={open ? `${id}-opt-${active}` : undefined}
          onKeyDown={onListKey}
          className={['flex flex-col overflow-y-auto outline-none', LISTBOX_MAX_H].join(' ')}
        >
          {times.map((t, i) => {
            const selected = t === value
            return (
              <div
                key={t}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={selected}
                onPointerDown={(e) => e.preventDefault()}
                onPointerMove={() => setActive(i)}
                onClick={() => pick(i)}
                className={[
                  'flex cursor-pointer items-center justify-between gap-md rounded-sm px-md py-sm font-mono text-body tabular-nums transition-colors duration-fast',
                  selected ? 'text-sample' : 'text-ink',
                  optionBar(i === active),
                ].join(' ')}
              >
                {display(t, format)}
                {selected && (
                  <svg aria-hidden viewBox="0 0 16 16" className="size-md shrink-0 text-sample">
                    <path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
                  </svg>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </FieldFrame>
  )
}
