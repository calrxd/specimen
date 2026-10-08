'use client'

import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { FieldMessage, controlBorder, labelText, messageId } from './parts'

export type ListboxOption = { value: string; label: string; disabled?: boolean }

export type ListboxProps = {
  /** Always visible, above the list. Uppercase label style. Names the list for assistive technology. */
  label: string
  /** The choices, in order. Content, not a Figma property: the library shows five. */
  options: ListboxOption[]
  /** Lets a person pick more than one option. Off, picking one clears the last. */
  multiple?: boolean
  /** The values selected at first. Uncontrolled; pass onChange to observe it. One value unless multiple is on. */
  defaultValue?: string[]
  /** Submits the selected values with a form under this name, one entry per value. */
  name?: string
  /** One line under the list. Hidden while an error is showing. */
  hint?: string
  /** Replaces the hint, turns the border danger, and is announced as an alert. */
  error?: string
  /** Inert. Border and options go to the disabled colour, and the list leaves the tab order. */
  disabled?: boolean
  /** Called with every selected value, in option order, whenever the selection changes. */
  onChange?: (value: string[]) => void
}

/** How long a pause ends a type-ahead search, so "pa" then "r" is one word but a later "r" starts again. */
const TYPEAHEAD_MS = 500

/**
 * A list of options that stays on the page, for a choice a person makes while looking at all
 * of it: the columns to export, the regions a report covers. One tab stop; arrow keys move,
 * Home and End jump, typing a few letters jumps to the option that starts with them, and Space
 * or Enter selects. With one choice, moving also selects, as a radio group does. With multiple,
 * moving only moves, Space toggles, and Ctrl or Command with A selects every option. Use Select when the list can hide until it is needed.
 */
export function Listbox({
  label,
  options,
  multiple = false,
  defaultValue = [],
  name,
  hint,
  error,
  disabled = false,
  onChange,
}: ListboxProps) {
  const id = useId()
  const describedBy = messageId(id, hint, error)
  const enabled = options.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0)

  const [selected, setSelected] = useState<string[]>(multiple ? defaultValue : defaultValue.slice(0, 1))
  const firstSelected = options.findIndex((o) => !o.disabled && selected.includes(o.value))
  const [active, setActive] = useState(firstSelected >= 0 ? firstSelected : (enabled[0] ?? -1))
  const [focused, setFocused] = useState(false)
  const optionRefs = useRef<(HTMLLIElement | null)[]>([])
  const search = useRef({ text: '', at: 0 })

  const commit = (next: string[]) => {
    // Keep the values in option order, whatever order they were picked in.
    const ordered = options.filter((o) => next.includes(o.value)).map((o) => o.value)
    setSelected(ordered)
    onChange?.(ordered)
  }

  const choose = (i: number) => {
    const o = options[i]
    if (!o || o.disabled) return
    if (multiple) commit(selected.includes(o.value) ? selected.filter((v) => v !== o.value) : [...selected, o.value])
    else if (!selected.includes(o.value)) commit([o.value])
  }

  const move = (i: number) => {
    setActive(i)
    optionRefs.current[i]?.scrollIntoView({ block: 'nearest' })
    if (!multiple) choose(i)
  }

  /** The next enabled option, after the active one, whose label starts with what was typed. */
  const findTyped = (key: string) => {
    const now = Date.now()
    const s = search.current
    s.text = now - s.at > TYPEAHEAD_MS ? key : s.text + key
    s.at = now
    const text = s.text.toLowerCase()
    // A fresh single letter starts after the active option, so pressing "e" twice cycles the E's.
    const from = enabled.indexOf(active) + (text.length === 1 ? 1 : 0)
    const order = [...enabled.slice(Math.max(from, 0)), ...enabled.slice(0, Math.max(from, 0))]
    return order.find((i) => options[i].label.toLowerCase().startsWith(text))
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (disabled || !enabled.length) return
    const pos = enabled.indexOf(active)
    let to: number | undefined
    if (e.key === 'ArrowDown') to = enabled[Math.min(pos + 1, enabled.length - 1)]
    else if (e.key === 'ArrowUp') to = enabled[Math.max(pos - 1, 0)]
    else if (e.key === 'Home') to = enabled[0]
    else if (e.key === 'End') to = enabled[enabled.length - 1]
    else if (multiple && e.key.toLowerCase() === 'a' && (e.ctrlKey || e.metaKey)) {
      // Select every enabled option, or clear them all when they already are.
      e.preventDefault()
      const all = enabled.map((i) => options[i].value)
      commit(all.every((v) => selected.includes(v)) ? selected.filter((v) => !all.includes(v)) : [...selected, ...all])
      return
    } else if (e.key === ' ' || e.key === 'Enter') {
      // Space types into a search already under way, as in a native select.
      if (e.key === ' ' && search.current.text && Date.now() - search.current.at <= TYPEAHEAD_MS) to = findTyped(' ')
      else {
        e.preventDefault()
        choose(active)
        return
      }
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) to = findTyped(e.key)
    else return
    e.preventDefault()
    if (to !== undefined && to >= 0) move(to)
  }

  return (
    <div className="flex w-full flex-col gap-sm">
      <span id={`${id}-label`} className={labelText}>
        {label}
      </span>
      <ul
        role="listbox"
        tabIndex={disabled ? -1 : 0}
        aria-labelledby={`${id}-label`}
        aria-describedby={describedBy}
        aria-multiselectable={multiple || undefined}
        aria-invalid={error ? true : undefined}
        aria-disabled={disabled || undefined}
        aria-activedescendant={!disabled && active >= 0 ? `${id}-option-${active}` : undefined}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={[
          'm-0 flex list-none flex-col gap-2xs rounded-sm border p-xs transition-colors duration-fast',
          disabled ? 'cursor-not-allowed border-disabled bg-transparent' : ['bg-surface', controlBorder({ error })].join(' '),
        ].join(' ')}
      >
        {options.map((o, i) => {
          const on = selected.includes(o.value)
          const inert = disabled || o.disabled
          const current = focused && i === active
          return (
            <li
              key={o.value}
              ref={(el) => {
                optionRefs.current[i] = el
              }}
              id={`${id}-option-${i}`}
              role="option"
              aria-selected={on}
              aria-disabled={inert || undefined}
              // A click focuses the list itself, its nearest focusable ancestor, so focus stays on one stop.
              onClick={() => {
                if (inert) return
                setActive(i)
                choose(i)
              }}
              className={[
                'flex items-center justify-between gap-md rounded-sm px-md py-sm font-mono text-body transition-colors duration-fast',
                inert
                  ? ['cursor-not-allowed', on && !disabled ? 'bg-canvas text-muted' : 'text-disabled'].join(' ')
                  : on
                    ? ['cursor-pointer text-on-sample', current ? 'bg-sample-hover' : 'bg-sample-fill hover:bg-sample-hover'].join(' ')
                    : ['cursor-pointer text-ink hover:bg-canvas', current ? 'bg-canvas' : ''].join(' '),
                // The active option is drawn inset, so the ring stays inside the list's padding.
                current ? ['outline-2 -outline-offset-2', on ? 'outline-on-sample' : 'outline-sample'].join(' ') : '',
              ].join(' ')}
            >
              {o.label}
              {on && (
                <svg aria-hidden viewBox="0 0 16 16" className="size-md shrink-0">
                  <path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
                </svg>
              )}
            </li>
          )
        })}
      </ul>
      {name && !disabled && selected.map((v) => <input key={v} type="hidden" name={name} value={v} />)}
      <FieldMessage id={id} hint={hint} error={error} />
    </div>
  )
}
