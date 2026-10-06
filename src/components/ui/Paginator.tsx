'use client'

import type { ComponentPropsWithoutRef } from 'react'

export type PaginatorProps = {
  /** The current page, counting from 1. */
  page: number
  /** How many pages there are. */
  pageCount: number
  /** Called with the page to show. Controlled: set page from it. */
  onPageChange?: (page: number) => void
} & Pick<ComponentPropsWithoutRef<'nav'>, 'aria-label'>

/** First, last, the current page and one either side; gaps become an ellipsis. */
function pagesToShow(page: number, count: number): (number | 'gap')[] {
  const wanted = new Set([1, count, page - 1, page, page + 1].filter((p) => p >= 1 && p <= count))
  const sorted = [...wanted].sort((a, b) => a - b)
  const out: (number | 'gap')[] = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('gap')
    out.push(p)
  })
  return out
}

const pageButton =
  'flex min-w-3xl cursor-pointer items-center justify-center rounded-sm border px-sm py-xs font-mono text-caption transition-colors duration-fast disabled:cursor-not-allowed disabled:border-transparent disabled:text-disabled'

/**
 * Moves through a long list one page at a time, under a table or a set of results.
 * Previous and next sit either side of a compact page list: first, last, the current page
 * and its neighbours, with an ellipsis for the gaps. The current page carries aria-current.
 */
export function Paginator({ page, pageCount, onPageChange, 'aria-label': ariaLabel = 'Pagination' }: PaginatorProps) {
  const go = (p: number) => onPageChange?.(Math.min(Math.max(p, 1), pageCount))
  return (
    <nav aria-label={ariaLabel} className="flex items-center gap-sm">
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        className={[pageButton, 'border-transparent bg-transparent text-muted hover:bg-surface hover:text-ink'].join(' ')}
      >
        Previous
      </button>
      <ol className="m-0 flex list-none items-center gap-xs p-0">
        {pagesToShow(page, pageCount).map((p, i) =>
          p === 'gap' ? (
            <li key={`gap-${i}`} aria-hidden className="px-xs text-caption text-muted">
              …
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                aria-current={p === page ? 'page' : undefined}
                aria-label={`Page ${p}`}
                onClick={() => go(p)}
                className={[
                  pageButton,
                  p === page ? 'border-line-strong bg-surface text-ink' : 'border-transparent bg-transparent text-muted hover:bg-surface hover:text-ink',
                ].join(' ')}
              >
                {p}
              </button>
            </li>
          ),
        )}
      </ol>
      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={page >= pageCount}
        className={[pageButton, 'border-transparent bg-transparent text-muted hover:bg-surface hover:text-ink'].join(' ')}
      >
        Next
      </button>
    </nav>
  )
}
