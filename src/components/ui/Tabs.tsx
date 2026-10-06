'use client'

import { useId, useRef, useState, type ComponentPropsWithoutRef, type KeyboardEvent, type ReactNode } from 'react'

export type TabItem = {
  id: string
  /** Sentence case, one or two words. */
  label: string
  content: ReactNode
  disabled?: boolean
}

export type TabsProps = {
  /** The tabs and their panels. Content, not a Figma property: the library shows three. */
  items: TabItem[]
} & Omit<ComponentPropsWithoutRef<'div'>, 'children'>

/**
 * Sections of one view that are read one at a time. The selected tab carries a 2px
 * sample bar on the shared hairline, the same device as the section headers. Arrow keys
 * move between tabs and select as they go; Home and End jump to either end. Give the set
 * a name with aria-label.
 */
export function Tabs({ items, className, ...rest }: TabsProps) {
  const base = useId()
  const firstEnabled = items.find((t) => !t.disabled)?.id
  const [selected, setSelected] = useState(firstEnabled)
  const refs = useRef(new Map<string, HTMLButtonElement>())

  const enabled = items.filter((t) => !t.disabled)
  const move = (e: KeyboardEvent, id: string) => {
    const i = enabled.findIndex((t) => t.id === id)
    const next =
      e.key === 'ArrowRight' ? enabled[(i + 1) % enabled.length]
      : e.key === 'ArrowLeft' ? enabled[(i - 1 + enabled.length) % enabled.length]
      : e.key === 'Home' ? enabled[0]
      : e.key === 'End' ? enabled[enabled.length - 1]
      : null
    if (!next) return
    e.preventDefault()
    setSelected(next.id)
    refs.current.get(next.id)?.focus()
  }

  return (
    <div className={['flex flex-col', className ?? ''].join(' ')} {...rest}>
      <div role="tablist" className="flex gap-xl border-b border-line">
        {items.map((t) => {
          const isSelected = t.id === selected
          return (
            <button
              key={t.id}
              ref={(el) => {
                if (el) refs.current.set(t.id, el)
                else refs.current.delete(t.id)
              }}
              type="button"
              role="tab"
              id={`${base}-tab-${t.id}`}
              aria-selected={isSelected}
              aria-controls={`${base}-panel-${t.id}`}
              tabIndex={isSelected ? 0 : -1}
              disabled={t.disabled}
              onClick={() => setSelected(t.id)}
              onKeyDown={(e) => move(e, t.id)}
              className={[
                '-mb-px cursor-pointer border-0 border-b-2 bg-transparent px-none py-md font-mono text-body transition-colors duration-fast',
                isSelected ? 'border-sample-fill text-ink' : 'border-transparent text-muted hover:text-ink',
                'disabled:cursor-not-allowed disabled:text-disabled',
              ].join(' ')}
            >
              {t.label}
            </button>
          )
        })}
      </div>
      {items.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${base}-panel-${t.id}`}
          aria-labelledby={`${base}-tab-${t.id}`}
          hidden={t.id !== selected}
          tabIndex={0}
          className="pt-xl text-body text-ink"
        >
          {t.content}
        </div>
      ))}
    </div>
  )
}
