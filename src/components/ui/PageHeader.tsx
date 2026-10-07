import type { ReactNode } from 'react'

export type PageHeaderProps = {
  /** The screen's name. Sentence case: "Billing overview". */
  title: string
  /** One line under the title: what the screen is for, or its scope. */
  description?: string
  /** A Breadcrumb above the title on screens below the top level. */
  breadcrumb?: ReactNode
  /** Primary actions on the right: one primary Button at most. */
  actions?: ReactNode
}

/**
 * The header at the top of an app screen: where you are, what the screen is called, and the
 * one or two actions that belong to it. The title is the page's h1; actions wrap below it
 * on narrow screens.
 */
export function PageHeader({ title, description, breadcrumb, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-md border-b border-line pb-xl">
      {breadcrumb}
      <div className="flex flex-wrap items-start justify-between gap-lg">
        <div className="flex min-w-0 flex-col gap-xs">
          <h1 className="m-0 text-heading font-medium tracking-display text-ink">{title}</h1>
          {description && <p className="m-0 font-text text-body leading-relaxed text-muted">{description}</p>}
        </div>
        {actions && <div className="flex max-w-full shrink-0 flex-wrap items-center gap-sm">{actions}</div>}
      </div>
    </header>
  )
}
