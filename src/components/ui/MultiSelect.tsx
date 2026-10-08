'use client'

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useAnchoredPanel } from './internal/d1-anchor'
import { FieldFrame, describedByOf } from './internal/d1-field-frame'
import { ChevronDown } from './internal/d1-icons'
import { CheckMark } from './internal/d1-checkbox'
import { OptionRow, grouped, type ListOption } from './internal/d1-options'
import { LISTBOX_MAX_H, optionBar } from './internal/listbox'

export type MultiSelectOption = ListOption

export type MultiSelectProps = {
  /** Always visible, above the control. Uppercase label style. */
  label: string
  /** The choices. Give options a `group` to show them under headings. */
  options: MultiSelectOption[]
  /** Values chosen on first render. */
  defaultValue?: string[]
  /** Called with every chosen value after each change, in option order. */
  onChange?: (values: string[]) => void
  /** Shown in the empty control, in faint. */
  placeholder?: string
  /** Adds a search field at the top of the list. */
  searchable?: boolean
  /** Adds a "Select all" row that toggles every enabled option in view. */
  selectAll?: boolean
  /** How many chosen values show as chips before the rest collapse into a count. */
  maxShown?: number
  /** One line under the control. Hidden while an error is showing. */
  hint?: string
  /** Replaces the hint, turns the border danger, and is announced as an alert. */
  error?: string
  /** Adds the green asterisk. */
  required?: boolean
  /** Inert. Border and text go to the disabled colour. */
  disabled?: boolean
  /** Submits each chosen value with a form under this name. */
  name?: string
}

/**
 * Choose several options from one control: recipients, tags, the columns of a report.
 * The control is a button showing the choices as chips; it opens a listbox where each row
 * carries a checkbox. Down or Enter opens it. In the list, Up and Down move, Home and End
 * jump, Space or Enter ticks the active option, and Escape or Tab closes it. With
 * `searchable`, typing filters the list and the arrow keys still move the highlight; the
 * search field is the combobox and the list follows it with aria-activedescendant.
 */
export function MultiSelect({
  label,
  options,
  defaultValue,
  onChange,
  placeholder = 'Choose options',
  searchable = false,
  selectAll = false,
  maxShown = 3,
  hint,
  error,
  required = false,
  disabled = false,
  name,
}: MultiSelectProps) {
  const id = useId()
  const [values, setValues] = useState<Set<string>>(() => new Set(defaultValue ?? []))
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const close = (refocus = true) => {
    setOpen(false)
    setQuery('')
    if (refocus) triggerRef.current?.focus()
  }
  const { anchorRef, panelRef } = useAnchoredPanel<HTMLDivElement, HTMLDivElement>({ open, onDismiss: () => close(false) })

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? options.filter((o) => o.label.toLowerCase().includes(q) || o.group?.toLowerCase().includes(q)) : options
  }, [options, query])
  const enabled = visible.filter((o) => !o.disabled)
  const allOn = enabled.length > 0 && enabled.every((o) => values.has(o.value))
  const someOn = enabled.some((o) => values.has(o.value))
  // Rows in keyboard order: the select-all row (when shown), then options in group order.
  const rows = useMemo(() => [...(selectAll && enabled.length ? ['__all'] : []), ...grouped(visible).flatMap((g) => g.options.map((o) => o.value))], [selectAll, enabled.length, visible])
  const optionId = (v: string) => `${id}-opt-${v === '__all' ? 'all' : options.findIndex((o) => o.value === v)}`

  useEffect(() => {
    if (!open) return
    setActive(0)
    ;(searchable ? searchRef.current : listRef.current)?.focus()
  }, [open, searchable])

  useEffect(() => setActive(0), [query])

  useEffect(() => {
    if (!open) return
    document.getElementById(optionId(rows[active] ?? ''))?.scrollIntoView({ block: 'nearest' })
    // optionId is stable for a given id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, open, rows])

  const commit = (next: Set<string>) => {
    setValues(next)
    onChange?.(options.filter((o) => next.has(o.value)).map((o) => o.value))
  }

  const toggle = (v: string) => {
    const next = new Set(values)
    if (v === '__all') {
      if (allOn) enabled.forEach((o) => next.delete(o.value))
      else enabled.forEach((o) => next.add(o.value))
    } else {
      const o = options.find((x) => x.value === v)
      if (!o || o.disabled) return
      if (next.has(v)) next.delete(v)
      else next.add(v)
    }
    commit(next)
  }

  const onListKey = (e: KeyboardEvent) => {
    const last = rows.length - 1
    const moves: Record<string, number> = { ArrowDown: Math.min(last, active + 1), ArrowUp: Math.max(0, active - 1), Home: 0, End: last }
    if (e.key in moves && !(searchable && (e.key === 'Home' || e.key === 'End'))) {
      e.preventDefault()
      setActive(moves[e.key])
    } else if (e.key === 'Enter' || (e.key === ' ' && !searchable)) {
      e.preventDefault()
      if (rows[active]) toggle(rows[active])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      close()
    } else if (e.key === 'Tab') {
      close(false)
    }
  }

  const chosen = options.filter((o) => values.has(o.value))
  const describedBy = describedByOf(id, hint, error)

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
          aria-controls={`${id}-panel`}
          aria-labelledby={`${id}-label ${id}-value`}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          onClick={() => (open ? close() : setOpen(true))}
          onKeyDown={(e) => {
            if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !open) {
              e.preventDefault()
              setOpen(true)
            }
          }}
          className={[
            'flex min-h-[2.875rem] min-w-0 flex-1 cursor-pointer items-center justify-between gap-md rounded-sm border bg-surface py-xs pr-lg pl-sm text-left font-mono text-body outline-none transition-colors duration-fast',
            error ? 'border-danger' : open ? 'border-sample' : 'border-line-interactive focus-visible:border-sample',
            'disabled:cursor-not-allowed disabled:border-disabled disabled:bg-transparent',
          ].join(' ')}
        >
          <span id={`${id}-value`} className="flex min-w-0 flex-wrap items-center gap-xs">
            {chosen.length === 0 ? (
              <span className={['px-sm', disabled ? 'text-disabled' : 'text-muted'].join(' ')}>{placeholder}</span>
            ) : (
              <>
                {chosen.slice(0, maxShown).map((o) => (
                  <span key={o.value} className={['max-w-full truncate rounded-sm border px-sm py-2xs text-caption', disabled ? 'border-disabled text-disabled' : 'border-line-strong bg-canvas text-ink'].join(' ')}>
                    {o.label}
                  </span>
                ))}
                {chosen.length > maxShown && <span className={['px-xs text-caption', disabled ? 'text-disabled' : 'text-muted'].join(' ')}>and {chosen.length - maxShown} more</span>}
              </>
            )}
          </span>
          <ChevronDown className={['size-md transition-transform duration-fast', open ? 'rotate-180' : '', disabled ? 'text-disabled' : 'text-muted'].join(' ')} />
        </button>
        {name && chosen.map((o) => <input key={o.value} type="hidden" name={name} value={o.value} />)}
      </div>

      <div ref={panelRef} id={`${id}-panel`} popover="manual" className="fixed inset-auto m-0 flex-col rounded-md border border-line-strong bg-surface p-xs text-ink [&:popover-open]:flex">
        {searchable && (
          <div className="p-xs">
            <input
              ref={searchRef}
              type="text"
              role="combobox"
              aria-expanded={open}
              aria-controls={`${id}-list`}
              aria-autocomplete="list"
              aria-activedescendant={rows[active] ? optionId(rows[active]) : undefined}
              aria-label={`Search ${label.toLowerCase()}`}
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onListKey}
              className="w-full min-w-0 rounded-sm border border-line-interactive bg-canvas px-md py-sm font-mono text-body text-ink outline-none transition-colors duration-fast focus-visible:border-sample"
            />
          </div>
        )}
        <div
          ref={listRef}
          id={`${id}-list`}
          role="listbox"
          aria-multiselectable
          aria-labelledby={`${id}-label`}
          tabIndex={searchable ? -1 : 0}
          aria-activedescendant={!searchable && rows[active] ? optionId(rows[active]) : undefined}
          onKeyDown={searchable ? undefined : onListKey}
          className={[LISTBOX_MAX_H, "flex flex-col overflow-y-auto outline-none"].join(' ')}
        >
          {rows.length === 0 && <p className="m-0 px-md py-sm font-text text-caption text-muted">No options match.</p>}
          {selectAll && enabled.length > 0 && (
            <div
              id={optionId('__all')}
              role="option"
              aria-selected={allOn}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => toggle('__all')}
              onPointerMove={() => setActive(0)}
              className={['flex cursor-pointer items-center gap-sm rounded-sm border-b border-line px-md py-sm font-mono text-body text-ink', optionBar(active === 0)].join(' ')}
            >
              <CheckMark checked={allOn} indeterminate={someOn && !allOn} />
              {query ? `Select all ${enabled.length} matches` : 'Select all'}
            </div>
          )}
          {grouped(visible).map((g, gi) => (
            <div key={g.group ?? '_'} role={g.group ? 'group' : undefined} aria-labelledby={g.group ? `${id}-g-${gi}` : undefined}>
              {g.group && (
                <p id={`${id}-g-${gi}`} className="m-0 px-md pt-sm pb-xs text-label uppercase text-muted tracking-label">
                  {g.group}
                </p>
              )}
              {g.options.map((o) => {
                const i = rows.indexOf(o.value)
                return (
                  <OptionRow
                    key={o.value}
                    id={optionId(o.value)}
                    option={o}
                    active={i === active}
                    selected={values.has(o.value)}
                    multiple
                    onPick={() => {
                      setActive(i)
                      toggle(o.value)
                    }}
                    onHover={() => setActive(i)}
                  />
                )
              })}
            </div>
          ))}
        </div>
        <div className="mt-xs flex items-center justify-between gap-md border-t border-line px-md pt-sm pb-xs">
          <span className="text-caption text-muted" aria-live="polite">
            {values.size} selected
          </span>
          {values.size > 0 && (
            <button
              type="button"
              onClick={() => commit(new Set())}
              className="cursor-pointer rounded-sm border-0 bg-transparent px-xs font-mono text-caption text-muted transition-colors duration-fast hover:text-ink"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </FieldFrame>
  )
}
