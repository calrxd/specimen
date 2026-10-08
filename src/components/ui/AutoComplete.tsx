'use client'

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Spinner } from '@/components/ui/Spinner'
import { useAnchoredPanel } from './internal/d1-anchor'
import { FieldFrame, describedByOf } from './internal/d1-field-frame'
import { OptionRow, type ListOption } from './internal/d1-options'
import { LISTBOX_MAX_H, optionBar } from './internal/listbox'

export type AutoCompleteOption = ListOption

export type AutoCompleteProps = {
  /** Always visible, above the input. Uppercase label style. */
  label: string
  /** Local suggestions, filtered as the person types. Leave out when `search` is given. */
  options?: AutoCompleteOption[]
  /** Remote suggestions: called with the query after a pause in typing. Return the matches. */
  search?: (query: string, signal: AbortSignal) => Promise<AutoCompleteOption[]>
  /** Characters needed before suggestions appear. */
  minChars?: number
  /** Pause in typing, in milliseconds, before `search` is called. */
  debounceMs?: number
  /** Called with the chosen option, or null when the text no longer matches one. */
  onSelect?: (option: AutoCompleteOption | null) => void
  /** Text in the input on first render. */
  defaultValue?: string
  /** Shown inside the empty input, in faint. */
  placeholder?: string
  /** Shown in the list when nothing matches. */
  emptyMessage?: string
  /** One line under the input. Hidden while an error is showing. */
  hint?: string
  /** Replaces the hint, turns the border danger, and is announced as an alert. */
  error?: string
  /** Adds the green asterisk and the native required attribute. */
  required?: boolean
  /** Inert. Border and text go to the disabled colour. */
  disabled?: boolean
  /** Submits the chosen option's value with a form under this name. */
  name?: string
}

/** The label with the matching run of characters picked out in sample green. */
function Highlight({ text, query }: { text: string; query: string }) {
  const i = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1
  if (i < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, i)}
      <span className="text-sample">{text.slice(i, i + query.length)}</span>
      {text.slice(i + query.length)}
    </>
  )
}

/**
 * Type-ahead search over local or remote data: customers, addresses, products. An ARIA
 * combobox with a listbox popup. Suggestions appear as the person types; Down opens the
 * list or moves the highlight, Up moves it back, Enter takes the highlighted option, and
 * Escape closes the list, or clears the text when the list is already closed. The match
 * is picked out in each suggestion, and the number of results is announced. With `search`,
 * calls are debounced, the previous call is aborted, and a spinner shows while it runs.
 */
export function AutoComplete({
  label,
  options,
  search,
  minChars = 1,
  debounceMs = 200,
  onSelect,
  defaultValue = '',
  placeholder,
  emptyMessage = 'No matches. Check the spelling or try fewer letters.',
  hint,
  error,
  required = false,
  disabled = false,
  name,
}: AutoCompleteProps) {
  const id = useId()
  const [text, setText] = useState(defaultValue)
  const [remoteResults, setRemoteResults] = useState<AutoCompleteOption[]>([])
  const [chosen, setChosen] = useState<AutoCompleteOption | null>(() => options?.find((o) => o.label === defaultValue) ?? null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const query = text.trim()
  const showList = open && query.length >= minChars
  const { anchorRef, panelRef } = useAnchoredPanel<HTMLDivElement, HTMLDivElement>({ open: showList, onDismiss: () => setOpen(false) })

  // Local matches are derived during render, so a fast Down after typing always lands on
  // the current list. Remote matches arrive later and reset the highlight when they do.
  const localResults = useMemo(() => {
    if (search || query.length < minChars) return []
    const q = query.toLowerCase()
    const hits = (options ?? []).filter((o) => o.label.toLowerCase().includes(q))
    return hits.sort((a, b) => Number(!a.label.toLowerCase().startsWith(q)) - Number(!b.label.toLowerCase().startsWith(q)))
  }, [search, query, minChars, options])
  const results = search ? remoteResults : localResults

  useEffect(() => {
    if (!search) return
    if (query.length < minChars) {
      setRemoteResults([])
      setLoading(false)
      return
    }
    const ctrl = new AbortController()
    setLoading(true)
    const t = window.setTimeout(() => {
      search(query, ctrl.signal)
        .then((r) => {
          if (ctrl.signal.aborted) return
          setRemoteResults(r)
          setActive(-1)
        })
        .catch(() => {
          if (!ctrl.signal.aborted) setRemoteResults([])
        })
        .finally(() => {
          if (!ctrl.signal.aborted) setLoading(false)
        })
    }, debounceMs)
    return () => {
      ctrl.abort()
      window.clearTimeout(t)
    }
  }, [query, search, minChars, debounceMs])

  useEffect(() => {
    if (active >= 0) document.getElementById(`${id}-opt-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active, id])

  const take = (o: AutoCompleteOption) => {
    if (o.disabled) return
    setText(o.label)
    setChosen(o)
    onSelect?.(o)
    setOpen(false)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const last = results.length - 1
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) {
        setOpen(true)
        if (!e.altKey) setActive(0)
      } else setActive((a) => Math.min(last, a + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (open) setActive((a) => Math.max(0, a - 1))
    } else if (e.key === 'Enter') {
      if (open && results[active]) {
        e.preventDefault()
        take(results[active])
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      if (open) setOpen(false)
      else {
        setText('')
        setChosen(null)
        onSelect?.(null)
      }
    } else if (e.key === 'Tab') setOpen(false)
  }

  const status = loading ? 'Searching' : query.length < minChars ? '' : results.length === 0 ? 'No matches' : `${results.length} ${results.length === 1 ? 'match' : 'matches'}`

  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} required={required}>
      <div ref={anchorRef} className="relative flex">
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={`${id}-list`}
          aria-activedescendant={showList && active >= 0 ? `${id}-opt-${active}` : undefined}
          aria-describedby={describedByOf(id, hint, error)}
          aria-invalid={error ? true : undefined}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setOpen(true)
            setActive(-1)
            if (chosen && e.target.value !== chosen.label) {
              setChosen(null)
              onSelect?.(null)
            }
          }}
          onKeyDown={onKeyDown}
          onClick={() => query.length >= minChars && setOpen(true)}
          className={[
            'min-w-0 flex-1 rounded-sm border bg-surface py-md pr-5xl pl-lg font-mono text-body text-ink outline-none transition-colors duration-fast',
            error ? 'border-danger' : 'border-line-interactive focus-visible:border-sample',
            'disabled:cursor-not-allowed disabled:border-disabled disabled:bg-transparent disabled:text-disabled disabled:placeholder:text-disabled',
          ].join(' ')}
        />
        {loading && (
          <span className="pointer-events-none absolute top-1/2 right-lg -translate-y-1/2">
            <Spinner label="Searching" size="sm" />
          </span>
        )}
        {name && <input type="hidden" name={name} value={chosen?.value ?? ''} />}
      </div>
      <p aria-live="polite" className="sr-only">
        {open ? status : ''}
      </p>

      <div ref={panelRef} popover="manual" className="fixed inset-auto m-0 rounded-md border border-line-strong bg-surface p-xs text-ink">
        <div id={`${id}-list`} role="listbox" aria-labelledby={`${id}-label`} className={[LISTBOX_MAX_H, "flex flex-col overflow-y-auto"].join(' ')}>
          {showList && !loading && results.length === 0 && <p className="m-0 px-md py-sm font-text text-caption text-muted">{emptyMessage}</p>}
          {showList && loading && results.length === 0 && <p className="m-0 px-md py-sm font-text text-caption text-muted">Searching</p>}
          {showList &&
            results.map((o, i) => (
              <OptionRow key={o.value} id={`${id}-opt-${i}`} option={o} active={i === active} selected={chosen?.value === o.value} multiple={false} onPick={() => take(o)} onHover={() => setActive(i)}>
                <Highlight text={o.label} query={query} />
              </OptionRow>
            ))}
        </div>
      </div>
    </FieldFrame>
  )
}
