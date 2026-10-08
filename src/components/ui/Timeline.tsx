export type TimelineTone = 'muted' | 'sample' | 'success' | 'info' | 'warn' | 'danger'

export type TimelineItem = {
  id: string
  /** When it happened, as people read it: "6 Oct 2026, 09:12". */
  time: string
  /** The same moment in ISO 8601, for the time element: "2026-10-06T09:12". */
  dateTime?: string
  /** What happened, sentence case: "Invoice INV-2048 sent". */
  title: string
  /** One line of detail: who did it, or what changed. */
  description?: string
  /** Colour of the marker. muted for routine events, the status tones for outcomes. The title must say the outcome too. */
  tone?: TimelineTone
}

export type TimelineProps = {
  /** The events, newest first for activity and audit logs. Content, not a Figma property: the library shows four. */
  items: TimelineItem[]
  /** Names the list for assistive technology when no heading sits above it: "Account activity". */
  label?: string
}

const MARKER: Record<TimelineTone, string> = {
  muted: 'border-line-interactive bg-transparent',
  sample: 'border-sample-fill bg-sample-fill',
  success: 'border-success bg-success',
  info: 'border-info bg-info',
  warn: 'border-warn bg-warn',
  danger: 'border-danger bg-danger',
}

/**
 * A vertical list of events: account activity, an audit trail, the history of an invoice.
 * Each event is a dot on a hairline rule, its time in mono above the title, and an optional
 * line of detail in Archivo. A muted event draws a hollow dot; the status tones fill it. The
 * colour only reinforces the title, so a failed payment still says "failed" in words.
 */
export function Timeline({ items, label }: TimelineProps) {
  return (
    <ol aria-label={label} className="m-0 flex list-none flex-col p-0">
      {items.map((item, i) => {
        const last = i === items.length - 1
        return (
          <li key={item.id} className="flex gap-md">
            {/* The rule runs from under one dot to the next, so it stops at the last event. */}
            <span aria-hidden className="flex shrink-0 flex-col items-center pt-2xs">
              <span className={['size-sm shrink-0 rounded-full border', MARKER[item.tone ?? 'muted']].join(' ')} />
              {!last && <span className="mt-xs flex-1 border-l border-line" />}
            </span>
            <div className={['flex min-w-0 flex-1 flex-col gap-2xs', last ? '' : 'pb-xl'].join(' ')}>
              <time dateTime={item.dateTime} className="font-mono text-caption tabular-nums text-muted">
                {item.time}
              </time>
              <p className="m-0 text-body text-ink">{item.title}</p>
              {item.description && <p className="m-0 font-text text-caption leading-normal text-muted">{item.description}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
