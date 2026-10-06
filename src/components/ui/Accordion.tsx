'use client'

import { useId, useState, type ReactNode } from 'react'

export type AccordionItem = {
  id: string
  /** The heading row. Sentence case, a question or a noun phrase. */
  title: string
  content: ReactNode
  disabled?: boolean
}

export type AccordionProps = {
  /** The sections. Content, not a Figma property: the library shows three. */
  items: AccordionItem[]
  /** Several sections open at once. Off: opening one closes the others. */
  allowMultiple?: boolean
  /** The ids of the sections open on load. Content, not a Figma property. */
  defaultOpen?: string[]
}

/**
 * Stacked sections that open one at a time to keep a long page scannable: settings groups,
 * FAQs, release notes. Each heading is a button with aria-expanded, and its panel is a
 * region labelled by it. Hairlines separate the rows; the open row shows a minus.
 */
export function Accordion({ items, allowMultiple = false, defaultOpen }: AccordionProps) {
  const base = useId()
  const [open, setOpen] = useState<Set<string>>(new Set(defaultOpen ?? []))

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(allowMultiple ? prev : prev.has(id) ? [id] : [])
      if (prev.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div className="flex flex-col border-t border-line">
      {items.map((item) => {
        const isOpen = open.has(item.id)
        const headId = `${base}-h-${item.id}`
        const panelId = `${base}-p-${item.id}`
        return (
          <div key={item.id} className="border-b border-line">
            <h3 className="m-0">
              <button
                type="button"
                id={headId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                disabled={item.disabled}
                onClick={() => toggle(item.id)}
                className="flex w-full cursor-pointer items-center justify-between gap-lg rounded-sm border-0 bg-transparent px-none py-lg text-left font-mono text-body text-ink transition-colors duration-fast hover:text-sample disabled:cursor-not-allowed disabled:text-disabled"
              >
                <span>{item.title}</span>
                <span aria-hidden className="shrink-0 text-body text-muted">
                  {isOpen ? '−' : '+'}
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headId}
              hidden={!isOpen}
              className="pb-lg font-text text-body leading-relaxed text-muted"
            >
              {item.content}
            </div>
          </div>
        )
      })}
    </div>
  )
}
