'use client'

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { Paginator } from '@/components/ui/Paginator'
import { SortArrow } from './internal/d1-icons'
import { CheckBox } from './internal/d1-checkbox'

export type SortDirection = 'ascending' | 'descending'
export type DataTableDensity = 'comfortable' | 'compact'
export type CellValue = string | number | Date | null | undefined

export type DataTableColumn<Row> = {
  /** Unique per table. Also the property read from the row when `value` is not given. */
  key: string
  /** Sentence case in source. Rendered in the uppercase label style. */
  header: string
  /** The value used to sort and filter. Defaults to `row[key]`. */
  value?: (row: Row) => CellValue
  /** How the cell draws. Defaults to the value as text: numbers grouped, dates in en-GB. */
  render?: (row: Row) => ReactNode
  /** end for numbers and money, so the digits line up. */
  align?: 'start' | 'end'
  /** Lets the header sort the rows. */
  sortable?: boolean
  /** Adds a filter input for this column in the row under the header. */
  filterable?: boolean
  /** Starting width in pixels, and the least the column takes. Columns share any spare width in proportion. */
  width?: number
}

export type DataTableProps<Row> = {
  /** Says what the table holds. Shown above it and used as the grid's accessible name. */
  caption: string
  /** Column definitions, in order. */
  columns: DataTableColumn<Row>[]
  /** The records. Sorting, filtering and paging happen inside the table. */
  rows: Row[]
  /** A stable id per row, used for selection and as the React key. */
  getRowId: (row: Row) => string
  /** Adds a checkbox column and Space to select rows. */
  selectable?: boolean
  /** Rows selected on first render. */
  defaultSelected?: string[]
  /** Called with every selected row id after each change. */
  onSelectionChange?: (ids: string[]) => void
  /** Splits the rows into pages of this size, with a Paginator underneath. */
  pageSize?: number
  /** A fixed height in pixels. The body scrolls inside it and only the visible rows render. */
  height?: number
  /** compact for admin lists and anything scanned rather than read. */
  density?: DataTableDensity
  /** Adds a filter field above the table that searches every column. */
  searchable?: boolean
  /** The sort on first render. */
  defaultSort?: { key: string; direction: SortDirection }
  /** Shown in the body when no row matches the filters. */
  emptyMessage?: string
}

const ROW_HEIGHT: Record<DataTableDensity, number> = { comfortable: 40, compact: 32 }
const ROW_CLASS: Record<DataTableDensity, string> = { comfortable: 'h-4xl', compact: 'h-3xl' }
const PAD_X: Record<DataTableDensity, string> = { comfortable: 'px-lg', compact: 'px-md' }
const SELECT_WIDTH = 44
const MIN_WIDTH = 64
const OVERSCAN = 8

const defaultValue = (row: unknown, key: string): CellValue => (row as Record<string, CellValue>)[key]

const asText = (v: CellValue) =>
  v == null ? '' : v instanceof Date ? v.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : typeof v === 'number' ? v.toLocaleString('en-GB') : String(v)

function compare(a: CellValue, b: CellValue) {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), 'en-GB', { numeric: true, sensitivity: 'base' })
}

/**
 * A data grid for large record sets: sort, filter, select, resize, page and scroll through
 * ten thousand rows without rendering them all. Exposed as an ARIA grid with one tab stop:
 * arrow keys move between cells, Home and End go to the ends of a row, Ctrl+Home and
 * Ctrl+End to the first and last cell, Page Up and Page Down by a screenful. On a header,
 * Enter sorts (ascending, descending, off) and Shift with the left or right arrow resizes
 * the column; columns also resize by dragging their right edge. With `selectable`, Space
 * selects the focused row. Flat like Table: hairlines between rows, line-strong under the
 * header, no zebra stripes, numbers aligned to the end with tabular figures.
 */
export function DataTable<Row>({
  caption,
  columns,
  rows,
  getRowId,
  selectable = false,
  defaultSelected,
  onSelectionChange,
  pageSize,
  height,
  density = 'comfortable',
  searchable = false,
  defaultSort,
  emptyMessage = 'No rows match these filters.',
}: DataTableProps<Row>) {
  const id = useId()
  const [sort, setSort] = useState<{ key: string; direction: SortDirection } | null>(defaultSort ?? null)
  const [query, setQuery] = useState('')
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<Set<string>>(() => new Set(defaultSelected ?? []))
  const [page, setPage] = useState(1)
  const [widths, setWidths] = useState<Record<string, number>>(() => Object.fromEntries(columns.map((c) => [c.key, c.width ?? 160])))
  const [active, setActive] = useState<{ row: number; col: number }>({ row: 0, col: 0 })
  const [scrollTop, setScrollTop] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const pendingFocus = useRef(false)

  const valueOf = useCallback((c: DataTableColumn<Row>, row: Row) => (c.value ? c.value(row) : defaultValue(row, c.key)), [])
  const hasFilterRow = columns.some((c) => c.filterable)
  const headerRows = hasFilterRow ? 2 : 1
  const colCount = columns.length + (selectable ? 1 : 0)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const active = Object.entries(columnFilters).filter(([, v]) => v.trim())
    if (!q && !active.length) return rows
    return rows.filter((row) => {
      if (q && !columns.some((c) => asText(valueOf(c, row)).toLowerCase().includes(q))) return false
      return active.every(([key, v]) => {
        const c = columns.find((col) => col.key === key)
        return c ? asText(valueOf(c, row)).toLowerCase().includes(v.trim().toLowerCase()) : true
      })
    })
  }, [rows, columns, query, columnFilters, valueOf])

  const sorted = useMemo(() => {
    if (!sort) return filtered
    const c = columns.find((col) => col.key === sort.key)
    if (!c) return filtered
    const out = [...filtered].sort((a, b) => compare(valueOf(c, a), valueOf(c, b)))
    return sort.direction === 'descending' ? out.reverse() : out
  }, [filtered, sort, columns, valueOf])

  const pageCount = pageSize ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1
  const currentPage = Math.min(page, pageCount)
  const pageRows = pageSize ? sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize) : sorted
  const firstIndex = pageSize ? (currentPage - 1) * pageSize : 0

  // Virtual window: only rows near the viewport render. Row heights are fixed per density.
  const rowHeight = ROW_HEIGHT[density]
  const virtual = height !== undefined
  const visibleCount = virtual ? Math.ceil(height / rowHeight) : pageRows.length
  const start = virtual ? Math.max(0, Math.floor(scrollTop / rowHeight) - OVERSCAN) : 0
  const end = virtual ? Math.min(pageRows.length, start + visibleCount + OVERSCAN * 2) : pageRows.length

  // Each column's width is its minimum. When the columns add up to less than the table, the
  // spare room is shared in proportion to those widths, so a wide screen shows no empty band.
  const template = [selectable ? `${SELECT_WIDTH}px` : null, ...columns.map((c) => `minmax(${widths[c.key]}px, ${widths[c.key]}fr)`)].filter(Boolean).join(' ')
  const totalWidth = (selectable ? SELECT_WIDTH : 0) + columns.reduce((n, c) => n + widths[c.key], 0)
  const rowStyle: CSSProperties = { gridTemplateColumns: template, width: totalWidth, minWidth: '100%' }

  // Grid coordinates: rows 0..headerRows-1 are the header and filter rows; body rows follow.
  const lastRow = headerRows + Math.max(pageRows.length, 1) - 1
  const clampActive = (r: number, c: number) => ({ row: Math.max(0, Math.min(lastRow, r)), col: Math.max(0, Math.min(colCount - 1, c)) })

  useEffect(() => {
    setActive((a) => clampActive(a.row, a.col))
    // Re-clamp when the row set changes under the focused cell.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageRows.length, colCount])

  const selectedIds = useCallback(
    (next: Set<string>) => {
      setSelected(next)
      onSelectionChange?.([...next])
    },
    [onSelectionChange],
  )

  const toggleRow = (rowId: string) => {
    const next = new Set(selected)
    if (next.has(rowId)) next.delete(rowId)
    else next.add(rowId)
    selectedIds(next)
  }
  const allIds = sorted.map(getRowId)
  const selectedInView = allIds.filter((i) => selected.has(i)).length
  const allChecked = allIds.length > 0 && selectedInView === allIds.length
  const someChecked = selectedInView > 0 && !allChecked
  const toggleAll = () => {
    const next = new Set(selected)
    if (allChecked) allIds.forEach((i) => next.delete(i))
    else allIds.forEach((i) => next.add(i))
    selectedIds(next)
  }

  const cycleSort = (key: string) => {
    setSort((s) => (s?.key !== key ? { key, direction: 'ascending' } : s.direction === 'ascending' ? { key, direction: 'descending' } : null))
    setPage(1)
  }

  const resize = (key: string, delta: number) => setWidths((w) => ({ ...w, [key]: Math.max(MIN_WIDTH, w[key] + delta) }))

  // Keep the focused body row inside the scroll window, then focus it once it has rendered.
  useLayoutEffect(() => {
    if (!pendingFocus.current) return
    const el = scrollRef.current
    if (virtual && el && active.row >= headerRows) {
      const top = (active.row - headerRows) * rowHeight
      const headerHeight = headerRows * rowHeight
      if (top < el.scrollTop) el.scrollTop = top
      else if (top + rowHeight > el.scrollTop + el.clientHeight - headerHeight) el.scrollTop = top + rowHeight - el.clientHeight + headerHeight
      setScrollTop(el.scrollTop)
    }
  }, [active, virtual, headerRows, rowHeight])

  useEffect(() => {
    if (!pendingFocus.current) return
    const cell = scrollRef.current?.querySelector<HTMLElement>(`[data-cell="${active.row}:${active.col}"]`)
    if (!cell) return
    pendingFocus.current = false
    const widget = cell.querySelector<HTMLElement>('[data-cell-widget]')
    ;(widget ?? cell).focus({ preventScroll: !virtual })
  })

  const moveTo = (r: number, c: number) => {
    pendingFocus.current = true
    setActive(clampActive(r, c))
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    const inText = target instanceof HTMLInputElement && target.type === 'text'
    const { row, col } = active
    const isHeader = row === 0
    const dataCol = col - (selectable ? 1 : 0)
    const column = columns[dataCol]

    if (isHeader && column && e.shiftKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault()
      resize(column.key, e.key === 'ArrowRight' ? 16 : -16)
      return
    }
    if (inText && ['ArrowLeft', 'ArrowRight', 'Home', 'End', ' '].includes(e.key)) return

    const pageStep = Math.max(1, (virtual ? visibleCount : 10) - 1)
    const to =
      e.key === 'ArrowDown' ? [row + 1, col]
      : e.key === 'ArrowUp' ? [row - 1, col]
      : e.key === 'ArrowRight' ? [row, col + 1]
      : e.key === 'ArrowLeft' ? [row, col - 1]
      : e.key === 'Home' ? (e.ctrlKey ? [0, 0] : [row, 0])
      : e.key === 'End' ? (e.ctrlKey ? [lastRow, colCount - 1] : [row, colCount - 1])
      : e.key === 'PageDown' ? [Math.min(lastRow, row + pageStep), col]
      : e.key === 'PageUp' ? [Math.max(headerRows, row - pageStep), col]
      : null
    if (to) {
      e.preventDefault()
      moveTo(to[0], to[1])
      return
    }
    if ((e.key === 'Enter' || e.key === ' ') && isHeader && column?.sortable && !(target instanceof HTMLInputElement)) {
      e.preventDefault()
      cycleSort(column.key)
      return
    }
    if (e.key === ' ' && selectable && row >= headerRows && !(target instanceof HTMLInputElement)) {
      const r = pageRows[row - headerRows]
      if (r) {
        e.preventDefault()
        toggleRow(getRowId(r))
      }
    }
  }

  const startDrag = (key: string) => (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startW = widths[key]
    const onMove = (ev: PointerEvent) => setWidths((w) => ({ ...w, [key]: Math.max(MIN_WIDTH, startW + ev.clientX - startX) }))
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const tab = (r: number, c: number) => (active.row === r && active.col === c ? 0 : -1)
  const cellBase = ['flex min-w-0 items-center outline-none focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-sample', PAD_X[density]].join(' ')
  const alignOf = (c: DataTableColumn<Row>) => (c.align === 'end' ? 'justify-end text-right tabular-nums' : 'justify-start text-left')
  const shownFrom = pageRows.length ? firstIndex + 1 : 0
  const shownTo = firstIndex + pageRows.length

  return (
    <div className="flex w-full min-w-0 flex-col gap-md">
      <div className="flex flex-wrap items-end justify-between gap-md">
        <p id={`${id}-caption`} className="m-0 text-caption text-muted">
          {caption}
        </p>
        {searchable && (
          <label className="flex items-center gap-sm">
            <span className="text-label uppercase text-muted tracking-label">Filter</span>
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              // sm:w-[16rem] is 256px, wide enough for the placeholder; no spacing step fits.
              placeholder="Search every column"
              size={24}
              className="min-w-0 rounded-sm border border-line-interactive bg-surface px-md py-xs font-mono text-caption text-ink outline-none transition-colors duration-fast focus-visible:border-sample sm:w-[16rem]"
            />
          </label>
        )}
      </div>

      <p id={`${id}-help`} className="sr-only">
        Arrow keys move between cells. Enter on a column header sorts it; Shift with the left or right arrow resizes it.
        {selectable ? ' Space selects the focused row.' : ''}
      </p>

      <div
        ref={scrollRef}
        role="grid"
        aria-labelledby={`${id}-caption`}
        aria-describedby={`${id}-help`}
        aria-rowcount={sorted.length + headerRows}
        aria-colcount={colCount}
        aria-multiselectable={selectable || undefined}
        onKeyDown={onKeyDown}
        onScroll={virtual ? (e) => setScrollTop(e.currentTarget.scrollTop) : undefined}
        style={virtual ? { height } : undefined}
        className="relative overflow-auto rounded-md border border-line font-mono text-body"
      >
        <div role="rowgroup" className="sticky top-0 z-10 bg-canvas" style={{ width: totalWidth, minWidth: '100%' }}>
          <div role="row" aria-rowindex={1} className={['grid border-b border-line-strong', ROW_CLASS[density]].join(' ')} style={rowStyle}>
            {selectable && (
              <div role="columnheader" aria-colindex={1} data-cell="0:0" tabIndex={-1} className={[cellBase, 'justify-center'].join(' ')}>
                <CheckBox
                  data-cell-widget
                  tabIndex={tab(0, 0)}
                  aria-label={allChecked ? 'Deselect all rows' : 'Select all rows'}
                  checked={allChecked}
                  indeterminate={someChecked}
                  onChange={toggleAll}
                  onFocus={() => setActive({ row: 0, col: 0 })}
                />
              </div>
            )}
            {columns.map((c, i) => {
              const col = i + (selectable ? 1 : 0)
              const dir = sort?.key === c.key ? sort.direction : 'none'
              return (
                <div
                  key={c.key}
                  role="columnheader"
                  aria-colindex={col + 1}
                  aria-sort={c.sortable ? dir : undefined}
                  data-cell={`0:${col}`}
                  tabIndex={tab(0, col)}
                  onFocus={() => setActive({ row: 0, col })}
                  onClick={c.sortable ? () => cycleSort(c.key) : undefined}
                  className={[
                    cellBase,
                    alignOf(c),
                    'relative gap-xs text-label font-normal uppercase text-muted tracking-label',
                    c.sortable ? 'cursor-pointer select-none hover:text-ink' : '',
                    dir !== 'none' ? 'text-ink' : '',
                  ].join(' ')}
                >
                  <span className="truncate">{c.header}</span>
                  {c.sortable && <SortArrow direction={dir} className={['size-md', dir === 'none' ? 'text-muted' : 'text-sample'].join(' ')} />}
                  <div
                    aria-hidden
                    onPointerDown={startDrag(c.key)}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-0 right-0 bottom-0 w-sm cursor-col-resize border-r border-line hover:border-sample"
                  />
                </div>
              )
            })}
          </div>
          {hasFilterRow && (
            <div role="row" aria-rowindex={2} className={['grid border-b border-line', ROW_CLASS[density]].join(' ')} style={rowStyle}>
              {selectable && <div role="gridcell" aria-colindex={1} data-cell="1:0" tabIndex={tab(1, 0)} onFocus={() => setActive({ row: 1, col: 0 })} className={cellBase} />}
              {columns.map((c, i) => {
                const col = i + (selectable ? 1 : 0)
                return (
                  <div key={c.key} role="gridcell" aria-colindex={col + 1} data-cell={`1:${col}`} tabIndex={c.filterable ? -1 : tab(1, col)} onFocus={() => setActive({ row: 1, col })} className={[cellBase, 'px-xs'].join(' ')}>
                    {c.filterable && (
                      <input
                        data-cell-widget
                        type="text"
                        tabIndex={tab(1, col)}
                        aria-label={`Filter ${c.header.toLowerCase()}`}
                        placeholder="Filter"
                        value={columnFilters[c.key] ?? ''}
                        onChange={(e) => {
                          setColumnFilters((f) => ({ ...f, [c.key]: e.target.value }))
                          setPage(1)
                        }}
                        onFocus={() => setActive({ row: 1, col })}
                        className="w-full min-w-0 rounded-sm border border-line bg-surface px-sm py-2xs font-mono text-caption text-ink outline-none transition-colors duration-fast focus-visible:border-sample"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div role="rowgroup" style={{ width: totalWidth, minWidth: '100%' }}>
          {virtual && start > 0 && <div aria-hidden style={{ height: start * rowHeight }} />}
          {pageRows.length === 0 ? (
            <div role="row" aria-rowindex={headerRows + 1} className={['grid', ROW_CLASS[density]].join(' ')} style={rowStyle}>
              <div
                role="gridcell"
                aria-colspan={colCount}
                data-cell={`${headerRows}:0`}
                tabIndex={tab(headerRows, 0)}
                onFocus={() => setActive({ row: headerRows, col: 0 })}
                style={{ gridColumn: '1 / -1' }}
                className={[cellBase, 'font-text text-caption text-muted'].join(' ')}
              >
                {emptyMessage}
              </div>
            </div>
          ) : (
            pageRows.slice(start, end).map((r, k) => {
              const index = start + k
              const gridRow = headerRows + index
              const rowId = getRowId(r)
              const isSelected = selected.has(rowId)
              return (
                <div
                  key={rowId}
                  role="row"
                  aria-rowindex={headerRows + firstIndex + index + 1}
                  aria-selected={selectable ? isSelected : undefined}
                  className={[
                    'grid border-b border-line transition-colors duration-fast',
                    ROW_CLASS[density],
                    isSelected ? 'bg-success-subtle' : 'hover:bg-surface',
                  ].join(' ')}
                  style={rowStyle}
                >
                  {selectable && (
                    <div role="gridcell" aria-colindex={1} data-cell={`${gridRow}:0`} tabIndex={-1} className={[cellBase, 'justify-center'].join(' ')}>
                      <CheckBox
                        data-cell-widget
                        tabIndex={tab(gridRow, 0)}
                        aria-label={`Select row ${firstIndex + index + 1}`}
                        checked={isSelected}
                        onChange={() => toggleRow(rowId)}
                        onFocus={() => setActive({ row: gridRow, col: 0 })}
                      />
                    </div>
                  )}
                  {columns.map((c, i) => {
                    const col = i + (selectable ? 1 : 0)
                    return (
                      <div
                        key={c.key}
                        role="gridcell"
                        aria-colindex={col + 1}
                        data-cell={`${gridRow}:${col}`}
                        tabIndex={tab(gridRow, col)}
                        onFocus={() => setActive({ row: gridRow, col })}
                        className={[cellBase, alignOf(c), 'text-ink'].join(' ')}
                      >
                        <span className="truncate">{c.render ? c.render(r) : asText(valueOf(c, r))}</span>
                      </div>
                    )
                  })}
                </div>
              )
            })
          )}
          {virtual && end < pageRows.length && <div aria-hidden style={{ height: (pageRows.length - end) * rowHeight }} />}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-md">
        <p className="m-0 text-caption text-muted tabular-nums" aria-live="polite">
          {sorted.length === 0
            ? 'No rows'
            : `Rows ${shownFrom.toLocaleString('en-GB')} to ${shownTo.toLocaleString('en-GB')} of ${sorted.length.toLocaleString('en-GB')}`}
          {selectable && selected.size > 0 ? ` · ${selected.size.toLocaleString('en-GB')} selected` : ''}
        </p>
        {pageSize && pageCount > 1 && <Paginator page={currentPage} pageCount={pageCount} onPageChange={setPage} aria-label={`${caption} pages`} />}
      </div>
    </div>
  )
}
