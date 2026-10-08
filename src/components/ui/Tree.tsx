'use client'

import { useEffect, useMemo, useRef, useState, type DragEvent, type KeyboardEvent } from 'react'
import { ChevronRight } from './internal/d1-icons'
import { CheckMark } from './internal/d1-checkbox'
import { branchState, descendantIds, findNode, flattenVisible, moveNode, shiftNode } from './internal/d1-tree'

export type TreeNode = {
  id: string
  /** Sentence case. The item's accessible name. */
  label: string
  /** A short count or detail at the end of the row, in muted: "12 files". */
  meta?: string
  children?: TreeNode[]
  /** Shown, but cannot be selected or moved. */
  disabled?: boolean
}

export type TreeSelection = 'none' | 'single' | 'multiple'

export type TreeProps = {
  /** The tree's accessible name: "Workspace folders". Not drawn; put a visible heading beside it. */
  label: string
  /** The hierarchy. Uncontrolled: reordering updates an internal copy and reports it. */
  nodes: TreeNode[]
  /** none for navigation only, single to pick one item, multiple for checkboxes. */
  selection?: TreeSelection
  /** Ids open on first render. */
  defaultExpanded?: string[]
  /** Ids selected on first render. */
  defaultSelected?: string[]
  /** Called with every selected id after each change. */
  onSelectionChange?: (ids: string[]) => void
  /** Lets items move by drag, or by Alt with the up or down arrow. */
  reorderable?: boolean
  /** Called with the whole tree after a move. */
  onReorder?: (nodes: TreeNode[]) => void
}

/** A parent counts as selected exactly when its whole branch is. */
function syncParents(nodes: TreeNode[], selected: Set<string>) {
  for (const n of nodes) {
    if (!n.children?.length) continue
    syncParents(n.children, selected)
    if (branchState(n, selected) === 'all') selected.add(n.id)
    else selected.delete(n.id)
  }
}

/**
 * A hierarchy a person can open, select and reorder: folders, accounts, a chart of
 * accounts, permissions. ARIA tree with one tab stop. Up and Down move through the visible
 * items; Right opens an item or moves to its first child; Left closes it or moves to its
 * parent; Home and End jump; typing a letter moves to the next item starting with it;
 * Enter or Space selects. In multiple selection a parent's box ticks its whole branch and
 * shows a dash when only part of it is selected. With `reorderable`, drag a row onto the
 * top or bottom half of another to place it before or after, or press Alt with the up or
 * down arrow to move it among its siblings.
 */
export function Tree({
  label,
  nodes: initial,
  selection = 'single',
  defaultExpanded,
  defaultSelected,
  onSelectionChange,
  reorderable = false,
  onReorder,
}: TreeProps) {
  const [nodes, setNodes] = useState(initial)
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(defaultExpanded ?? []))
  const [selected, setSelected] = useState<Set<string>>(() => new Set(defaultSelected ?? []))
  const flat = useMemo(() => flattenVisible(nodes, expanded), [nodes, expanded])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [drop, setDrop] = useState<{ id: string; place: 'before' | 'after' } | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const dragId = useRef<string | null>(null)
  const itemRefs = useRef(new Map<string, HTMLDivElement>())
  const focusNext = useRef(false)

  const current = activeId && flat.some((f) => f.node.id === activeId) ? activeId : (flat[0]?.node.id ?? null)

  useEffect(() => {
    if (!focusNext.current || !current) return
    focusNext.current = false
    itemRefs.current.get(current)?.focus()
  })

  const go = (id: string | undefined) => {
    if (!id) return
    focusNext.current = true
    setActiveId(id)
  }

  const setOpen = (id: string, open: boolean) =>
    setExpanded((s) => {
      const n = new Set(s)
      if (open) n.add(id)
      else n.delete(id)
      return n
    })

  const select = (node: TreeNode) => {
    if (selection === 'none' || node.disabled) return
    let next: Set<string>
    if (selection === 'single') next = new Set([node.id])
    else {
      next = new Set(selected)
      const on = node.children?.length ? branchState(node, selected) !== 'all' : !selected.has(node.id)
      ;[node.id, ...descendantIds(node)].forEach((i) => (on ? next.add(i) : next.delete(i)))
      syncParents(nodes, next)
    }
    setSelected(next)
    onSelectionChange?.([...next])
  }

  const reorder = (next: TreeNode[], movedLabel: string) => {
    if (next === nodes) return
    setNodes(next)
    onReorder?.(next)
    setAnnouncement(`Moved ${movedLabel}`)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const i = flat.findIndex((f) => f.node.id === current)
    const item = flat[i]
    if (!item) return
    const { node } = item
    if (reorderable && e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault()
      if (!node.disabled) {
        reorder(shiftNode(nodes, node.id, e.key === 'ArrowUp' ? -1 : 1), node.label)
        focusNext.current = true
      }
      return
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        go(flat[i + 1]?.node.id)
        break
      case 'ArrowUp':
        e.preventDefault()
        go(flat[i - 1]?.node.id)
        break
      case 'Home':
        e.preventDefault()
        go(flat[0]?.node.id)
        break
      case 'End':
        e.preventDefault()
        go(flat[flat.length - 1]?.node.id)
        break
      case 'ArrowRight':
        e.preventDefault()
        if (item.hasChildren && !expanded.has(node.id)) setOpen(node.id, true)
        else if (item.hasChildren) go(flat[i + 1]?.node.id)
        break
      case 'ArrowLeft':
        e.preventDefault()
        if (item.hasChildren && expanded.has(node.id)) setOpen(node.id, false)
        else go(item.parentId ?? undefined)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        select(node)
        break
      default:
        if (e.key.length === 1 && /\S/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
          const k = e.key.toLowerCase()
          const order = [...flat.slice(i + 1), ...flat.slice(0, i + 1)]
          go(order.find((f) => f.node.label.toLowerCase().startsWith(k))?.node.id)
        }
    }
  }

  const onDragOver = (id: string) => (e: DragEvent<HTMLDivElement>) => {
    if (!dragId.current || dragId.current === id) return
    e.preventDefault()
    const r = e.currentTarget.getBoundingClientRect()
    setDrop({ id, place: e.clientY < r.top + r.height / 2 ? 'before' : 'after' })
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    const from = dragId.current
    if (from && drop) reorder(moveNode(nodes, from, drop.id, drop.place), findNode(nodes, from)?.label ?? 'item')
    dragId.current = null
    setDrop(null)
  }

  return (
    <div className="flex flex-col">
      <div role="tree" aria-label={label} aria-multiselectable={selection === 'multiple' || undefined} onKeyDown={onKeyDown} className="flex flex-col gap-2xs font-mono text-body">
        {flat.map(({ node, level, posinset, setsize, hasChildren }) => {
          const open = expanded.has(node.id)
          const state = selection === 'multiple' ? branchState(node, selected) : selected.has(node.id) ? 'all' : 'none'
          const isSelected = selection !== 'none' && state === 'all'
          return (
            <div
              key={node.id}
              ref={(el) => {
                if (el) itemRefs.current.set(node.id, el)
                else itemRefs.current.delete(node.id)
              }}
              role="treeitem"
              aria-level={level}
              aria-posinset={posinset}
              aria-setsize={setsize}
              aria-expanded={hasChildren ? open : undefined}
              aria-selected={selection === 'none' ? undefined : isSelected}
              aria-disabled={node.disabled || undefined}
              tabIndex={node.id === current ? 0 : -1}
              draggable={reorderable && !node.disabled}
              onDragStart={(e) => {
                dragId.current = node.id
                e.dataTransfer.effectAllowed = 'move'
                e.dataTransfer.setData('text/plain', node.label)
              }}
              onDragOver={onDragOver(node.id)}
              onDragLeave={() => setDrop((d) => (d?.id === node.id ? null : d))}
              onDrop={onDrop}
              onDragEnd={() => {
                dragId.current = null
                setDrop(null)
              }}
              onFocus={() => setActiveId(node.id)}
              onClick={() => {
                setActiveId(node.id)
                select(node)
              }}
              style={{ paddingLeft: `calc(${level - 1} * var(--spacing-xl) + var(--spacing-xs))` }}
              className={[
                'relative flex h-3xl cursor-pointer items-center gap-sm rounded-sm pr-md outline-none transition-colors duration-fast',
                'focus-visible:outline-2 focus-visible:outline-solid focus-visible:-outline-offset-2 focus-visible:outline-sample',
                node.disabled ? 'cursor-not-allowed text-disabled' : isSelected && selection === 'single' ? 'bg-success-subtle text-ink' : 'text-ink hover:bg-surface',
                drop?.id === node.id ? (drop.place === 'before' ? 'border-t-strong border-t-sample' : 'border-b-strong border-b-sample') : '',
              ].join(' ')}
            >
              <span
                aria-hidden
                onClick={(e) => {
                  if (!hasChildren) return
                  e.stopPropagation()
                  setActiveId(node.id)
                  setOpen(node.id, !open)
                }}
                className={['flex size-lg shrink-0 items-center justify-center text-muted', hasChildren ? '' : 'invisible'].join(' ')}
              >
                <ChevronRight className={['size-md transition-transform duration-fast', open ? 'rotate-90' : ''].join(' ')} />
              </span>
              {selection === 'multiple' && <CheckMark checked={state === 'all'} indeterminate={state === 'some'} disabled={node.disabled} />}
              <span className="min-w-0 flex-1 truncate">{node.label}</span>
              {node.meta && <span className={['shrink-0 text-caption', node.disabled ? 'text-disabled' : 'text-muted'].join(' ')}>{node.meta}</span>}
            </div>
          )
        })}
      </div>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  )
}
