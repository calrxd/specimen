import type { ComponentPropsWithoutRef } from 'react'

export type BreadcrumbItem = {
  /** Sentence case, the page or section name. */
  label: string
  /** Link target. The last item is the current page and is not linked. */
  href?: string
}

export type BreadcrumbProps = {
  /** From the top level down to the current page. Content, not a Figma property. */
  items: BreadcrumbItem[]
} & Pick<ComponentPropsWithoutRef<'nav'>, 'aria-label'>

/**
 * Where the current page sits in the hierarchy, with a link back to each level above it.
 * An ordered list in a labelled nav; the last item is the current page, marked with
 * aria-current and left unlinked. Separators are drawn, not read out.
 */
export function Breadcrumb({ items, 'aria-label': ariaLabel = 'Breadcrumb' }: BreadcrumbProps) {
  return (
    <nav aria-label={ariaLabel}>
      <ol className="m-0 flex list-none flex-wrap items-center gap-x-sm gap-y-xs p-0 text-caption">
        {items.map((item, i) => {
          const current = i === items.length - 1
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-sm">
              {current || !item.href ? (
                <span aria-current={current ? 'page' : undefined} className={current ? 'text-ink' : 'text-muted'}>
                  {item.label}
                </span>
              ) : (
                <a href={item.href} className="rounded-sm text-muted transition-colors duration-fast hover:text-ink">
                  {item.label}
                </a>
              )}
              {!current && (
                <span aria-hidden className="text-muted">
                  /
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
