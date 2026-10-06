'use client'

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'

export type Command = {
  id: string
  /** Sentence case, a verb or a destination: "New release", "Tokens". */
  label: string
  /** Right-aligned, in muted: a shortcut or where the command lives. (Faint fails AA on the surface fill.) */
  hint?: string
  /** Extra words that should match, beyond the label. */
  keywords?: string[]
  onSelect: () => void
}

export type CommandGroup = {
  label: string
  commands: Command[]
}

export type CommandMenuProps = {
  /** Whether it is showing. Controlled: set it false from onClose. */
  open: boolean
  /** The commands, grouped. Content, not a Figma property: the library shows two groups. */
  groups: CommandGroup[]
  /** Inside the empty search field. */
  placeholder?: string
  /** Shown when nothing matches. */
  emptyText?: string
  /** Called on Escape, on a click outside the panel, and after a command runs. */
  onClose: () => void
}

const matches = (c: Command, q: string) =>
  !q || [c.label, ...(c.keywords ?? [])].some((s) => s.toLowerCase().includes(q.toLowerCase()))

/**
 * Search across every action in the product and run one from the keyboard. A modal on the
 * native dialog element, with the search field as a combobox over a listbox: typing filters,
 * arrows move the active option, Enter runs it, Escape closes. Focus stays in the field the
 * whole time; the active option is announced through aria-activedescendant.
 */
export function CommandMenu({ open, groups, placeholder = 'Type a command', emptyText = 'No commands match. Try another word.', onClose }: CommandMenuProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const base = useId()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  const visible = useMemo(
    () => groups.map((g) => ({ ...g, commands: g.commands.filter((c) => matches(c, query)) })).filter((g) => g.commands.length),
    [groups, query],
  )
  const flat = useMemo(() => visible.flatMap((g) => g.commands), [visible])
  const optionId = (c: Command) => `${base}-${c.id}`

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      setQuery('')
      setActive(0)
      dialog.showModal()
      inputRef.current?.focus()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => setActive(0), [query])

  useEffect(() => {
    const el = flat[active] && document.getElementById(optionId(flat[active]))
    el?.scrollIntoView({ block: 'nearest' })
    // optionId only depends on base, which is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, flat])

  const run = (c: Command) => {
    c.onSelect()
    onClose()
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (!flat.length) return
    const to =
      e.key === 'ArrowDown' ? (active + 1) % flat.length
      : e.key === 'ArrowUp' ? (active - 1 + flat.length) % flat.length
      : e.key === 'Home' && e.ctrlKey ? 0
      : e.key === 'End' && e.ctrlKey ? flat.length - 1
      : null
    if (to !== null) {
      e.preventDefault()
      setActive(to)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      run(flat[active])
    }
  }

  const listId = `${base}-list`
  return (
    <dialog
      ref={ref}
      aria-label="Command menu"
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="mx-auto mt-9xl w-full max-w-measure-lg rounded-md border border-line-strong bg-surface p-none text-ink backdrop:bg-scrim"
    >
      <div className="flex items-center gap-md border-b border-line px-lg py-md">
        <span aria-hidden className="text-body text-sample">
          &gt;
        </span>
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded={flat.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={flat[active] ? optionId(flat[active]) : undefined}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="min-w-0 flex-1 border-0 bg-transparent p-0 font-mono text-body text-ink outline-none"
        />
      </div>
      {/* A listbox must hold options, so with no matches the role comes off and the message stands alone. */}
      <div
        id={listId}
        role={flat.length ? 'listbox' : undefined}
        aria-label={flat.length ? 'Commands' : undefined}
        className="max-h-(--container-measure-sm) overflow-y-auto p-xs"
      >
        {visible.map((g, gi) => (
          <div key={g.label} role="group" aria-labelledby={`${base}-g${gi}`}>
            <p id={`${base}-g${gi}`} className="m-0 px-md pt-md pb-xs text-caption text-muted">
              {g.label}
            </p>
            {g.commands.map((c) => {
              const isActive = flat[active]?.id === c.id
              return (
                <div
                  key={c.id}
                  id={optionId(c)}
                  role="option"
                  aria-selected={isActive}
                  onMouseMove={() => setActive(flat.indexOf(c))}
                  onClick={() => run(c)}
                  className={['flex cursor-pointer items-baseline justify-between gap-lg rounded-sm px-md py-sm text-body', isActive ? 'bg-canvas text-ink' : 'text-ink'].join(' ')}
                >
                  <span>{c.label}</span>
                  {c.hint && <span className="text-caption text-muted">{c.hint}</span>}
                </div>
              )
            })}
          </div>
        ))}
        {!flat.length && (
          <p role="status" className="m-0 px-md py-lg font-text text-body text-muted">
            {emptyText}
          </p>
        )}
      </div>
      <div aria-hidden className="flex gap-xl border-t border-line px-lg py-sm text-caption text-muted">
        <span>↑ ↓ to move</span>
        <span>Enter to run</span>
        <span>Esc to close</span>
      </div>
    </dialog>
  )
}
