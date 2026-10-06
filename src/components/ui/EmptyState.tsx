import type { ReactNode } from 'react'

export type EmptyStateProps = {
  /** What is empty, and in a word why: "No invoices yet". */
  title: string
  /** What the reader can do about it, in one or two sentences. */
  description?: string
  /** The action that fills the space, usually a primary Button. */
  action?: ReactNode
}

/**
 * The space a list, table or page shows before it has content. An empty screen is an
 * invitation to act, so it says what is missing and offers the one action that fixes it.
 * The visual is the specimen dot on an empty slide: a frame waiting for something to
 * observe.
 */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex w-full flex-col items-center gap-xl rounded-md border border-dashed border-line px-2xl py-5xl text-center">
      <span aria-hidden className="relative block h-2xl w-4xl rounded-sm border-strong border-line-strong">
        <span className="absolute top-xs left-xs block size-sm rounded-full bg-sample-fill" />
      </span>
      <div className="flex max-w-measure-sm flex-col gap-sm">
        <p className="m-0 text-body-lg font-medium text-ink">{title}</p>
        {description && <p className="m-0 font-text text-body leading-relaxed text-muted">{description}</p>}
      </div>
      {action && <div className="flex flex-wrap justify-center gap-sm">{action}</div>}
    </div>
  )
}
