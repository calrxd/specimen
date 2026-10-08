'use client'

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useAnchoredPopover } from './useAnchoredPopover'
import { FieldFrame, describedByOf, type FieldBaseProps } from './internal/d2-field'
import { LISTBOX_MAX_H, optionBar } from './internal/listbox'

export type TreeSelectNode = {
  id: string
  /** Sentence case, as it should read in the field once chosen. */
  label: string
  children?: TreeSelectNode[]
  /** Shown but cannot be chosen; its children still can. */
  disabled?: boolean
}

export type TreeSelectProps = FieldBaseProps & {
  /** The hierarchy. Content, not a Figma property. */
  nodes: TreeSelectNode[]
  /** The id chosen at first, for an uncontrolled field. */
  defaultValue?: string
  /** leaf allows only items without children; any lets a branch be chosen too. */
  selectable?: 'leaf' | 'any'
  /** Shown in the field while nothing is chosen. */
  placeholder?: string
  /** Shows the full path ("Engineering / Platform / Payments") in the field instead of the label. */
  showPath?: boolean
  /** Called with the chosen node's id. */
  onChange?: (id: string) => void
  /** Submitted with a form under this name, as the chosen id. */
  name?: string
}

type Flat = { node: TreeSelectNode; level: number; parent: string | null; path: string[] }

function flatten(nodes: TreeSelectNode[], level = 1, parent: string | null = null, path: string[] = [], out: Flat[] = []) {
  for (const node of nodes) {
    out.push({ node, level, parent, path: [...path, node.label] })
    if (node.children) flatten(node.children, level + 1, node.id, [...path, node.label], out)
  }
  return out
}

/**
 * Choose one item from a hierarchy without leaving the form: a team inside a department, a
 * folder inside a project. The field is a combobox button that opens a tree below it. In the
 * tree, Up and Down move, Right opens a branch or steps into it, Left closes it or steps out
 * to its parent, Home and End jump, typing a letter jumps to the next item starting with it,
 * Enter or Space chooses, and Escape closes and returns to the field. The tree follows the
 * APG tree view pattern: role tree, treeitem with aria-level, aria-expanded and
 * aria-selected, and one tab stop.
 */
export function TreeSelect({
  label,
  hint,
  error,
  required = false,
  disabled = false,
  nodes,
  defaultValue,
  selectable = 'leaf',
  placeholder = 'Choose',
  showPath = false,
  onChange,
  name,
}: TreeSelectProps) {
  const { id, open, triggerRef, panelRef, close } = useAnchoredPopover('bottom', 'start')
  const flat = useMemo(() => flatten(nodes), [nodes])
  const byId = useMemo(() => new Map(flat.map((f) => [f.node.id, f])), [flat])
  const [value, setValue] = useState(defaultValue)
  // The branches above the chosen item start open, so it is in view on first open.
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(value ? ancestors(value) : []))
  const [active, setActive] = useState<string | undefined>(value ?? flat[0]?.node.id)
  const itemRefs = useRef(new Map<string, HTMLLIElement>())

  function ancestors(nodeId: string) {
    const out: string[] = []
    let p = byId.get(nodeId)?.parent ?? null
    while (p) {
      out.push(p)
      p = byId.get(p)?.parent ?? null
    }
    return out
  }

  const visible = flat.filter((f) => ancestors(f.node.id).every((a) => expanded.has(a)))
  const canChoose = (n: TreeSelectNode) => !n.disabled && (selectable === 'any' || !n.children?.length)
  const chosen = value ? byId.get(value) : undefined

  // Match the trigger's width, and land on the chosen item (or the first) when opening.
  useEffect(() => {
    if (!open) return
    const w = triggerRef.current?.getBoundingClientRect().width
    if (w && panelRef.current) panelRef.current.style.width = `${w}px`
    const start = value && visible.some((f) => f.node.id === value) ? value : visible[0]?.node.id
    setActive(start)
    if (start) requestAnimationFrame(() => itemRefs.current.get(start)?.focus())
    // Only on the transition to open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const move = (to: string | undefined) => {
    if (!to) return
    setActive(to)
    itemRefs.current.get(to)?.focus()
  }
  const toggle = (nodeId: string, on?: boolean) =>
    setExpanded((s) => {
      const next = new Set(s)
      if (on ?? !next.has(nodeId)) next.add(nodeId)
      else next.delete(nodeId)
      return next
    })
  const choose = (n: TreeSelectNode) => {
    if (!canChoose(n)) {
      if (n.children?.length) toggle(n.id)
      return
    }
    setValue(n.id)
    onChange?.(n.id)
    close()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    if (!active) return
    const i = visible.findIndex((f) => f.node.id === active)
    const cur = visible[i]
    const hasKids = !!cur?.node.children?.length
    const isOpen = expanded.has(active)
    switch (e.key) {
      case 'ArrowDown':
        move(visible[Math.min(i + 1, visible.length - 1)]?.node.id)
        break
      case 'ArrowUp':
        move(visible[Math.max(i - 1, 0)]?.node.id)
        break
      case 'Home':
        move(visible[0]?.node.id)
        break
      case 'End':
        move(visible[visible.length - 1]?.node.id)
        break
      case 'ArrowRight':
        if (hasKids && !isOpen) toggle(active, true)
        else if (hasKids) move(cur.node.children![0].id)
        break
      case 'ArrowLeft':
        if (hasKids && isOpen) toggle(active, false)
        else if (cur?.parent) move(cur.parent)
        break
      case 'Enter':
      case ' ':
        if (cur) choose(cur.node)
        break
      case 'Tab':
        panelRef.current?.hidePopover()
        return
      default:
        if (e.key.length === 1 && /\S/.test(e.key)) {
          const k = e.key.toLowerCase()
          const order = [...visible.slice(i + 1), ...visible.slice(0, i + 1)]
          move(order.find((f) => f.node.label.toLowerCase().startsWith(k))?.node.id)
          break
        }
        return
    }
    e.preventDefault()
  }

  const shown = chosen ? (showPath ? chosen.path.join(' / ') : chosen.node.label) : undefined

  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} required={required} labelFor={`${id}-trigger`}>
      <button
        ref={(el) => {
          triggerRef.current = el
        }}
        id={`${id}-trigger`}
        type="button"
        role="combobox"
        popoverTarget={id}
        aria-haspopup="tree"
        aria-expanded={open}
        aria-controls={id}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedByOf(id, error, hint)}
        disabled={disabled}
        className={[
          'flex w-full min-w-0 cursor-pointer items-center justify-between gap-md rounded-sm border px-lg py-md text-left font-mono text-body outline-none transition-colors duration-fast',
          disabled
            ? 'cursor-not-allowed border-disabled bg-transparent text-disabled'
            : error
              ? 'border-danger bg-surface'
              : 'border-line-interactive bg-surface focus-visible:border-sample',
        ].join(' ')}
      >
        {/* Placeholder in muted, not faint: faint passes only as a native placeholder, which browsers exempt. */}
        <span className={['truncate', disabled ? 'text-disabled' : shown ? 'text-ink' : 'text-muted'].join(' ')}>
          {shown ?? placeholder}
        </span>
        <svg aria-hidden viewBox="0 0 16 16" className={['size-md shrink-0 transition-transform duration-fast', open ? 'rotate-180' : ''].join(' ')}>
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      <div
        ref={panelRef}
        id={id}
        popover="auto"
        className={[LISTBOX_MAX_H, "fixed inset-auto m-0 overflow-y-auto rounded-md border border-line-strong bg-surface p-xs"].join(' ')}
      >
        <ul role="tree" aria-labelledby={`${id}-label`} onKeyDown={onKeyDown} className="m-0 flex list-none flex-col p-0">
          {visible.map(({ node, level }) => {
            const kids = !!node.children?.length
            const isOpen = expanded.has(node.id)
            const selected = node.id === value
            const choosable = canChoose(node)
            return (
              <li
                key={node.id}
                ref={(el) => {
                  if (el) itemRefs.current.set(node.id, el)
                  else itemRefs.current.delete(node.id)
                }}
                role="treeitem"
                aria-level={level}
                aria-expanded={kids ? isOpen : undefined}
                aria-selected={choosable ? selected : undefined}
                aria-disabled={node.disabled || undefined}
                tabIndex={node.id === active ? 0 : -1}
                onClick={() => {
                  setActive(node.id)
                  choose(node)
                }}
                onFocus={() => setActive(node.id)}
                className={[
                  'flex cursor-pointer items-center gap-sm rounded-sm py-sm pr-md font-mono text-body outline-none transition-colors duration-fast',
                  'hover:bg-canvas focus-visible:bg-canvas focus-visible:outline-2 focus-visible:-outline-offset-2',
                  node.disabled ? 'cursor-not-allowed text-disabled' : selected ? 'text-sample' : choosable ? 'text-ink' : 'text-muted',
                ].join(' ')}
                style={{ paddingLeft: `calc(var(--spacing-sm) + ${(level - 1) * 1.25}rem)` }}
              >
                <span aria-hidden className="flex size-md shrink-0 items-center justify-center text-muted">
                  {kids && (
                    <svg
                      viewBox="0 0 16 16"
                      className={['size-md transition-transform duration-fast', isOpen ? 'rotate-90' : ''].join(' ')}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggle(node.id)
                      }}
                    >
                      <path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  )}
                </span>
                <span className="truncate">{node.label}</span>
                {selected && (
                  <svg aria-hidden viewBox="0 0 16 16" className="ml-auto size-md shrink-0">
                    <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                )}
              </li>
            )
          })}
        </ul>
      </div>
      {name && <input type="hidden" name={name} value={value ?? ''} />}
    </FieldFrame>
  )
}
