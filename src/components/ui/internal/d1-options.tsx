import type { ReactNode } from 'react'
import { CheckMark } from './d1-checkbox'
import { optionBar } from './listbox'

export type ListOption = {
  value: string
  /** Sentence case. The option's accessible name. */
  label: string
  /** A heading the option sits under. Options with the same group render together. */
  group?: string
  /** A second line, in Archivo muted. */
  description?: string
  disabled?: boolean
}

/** Options in group order, keeping the original order inside each group. */
export function grouped(options: ListOption[]): { group: string | null; options: ListOption[] }[] {
  const out: { group: string | null; options: ListOption[] }[] = []
  for (const o of options) {
    const g = o.group ?? null
    const bucket = out.find((b) => b.group === g)
    if (bucket) bucket.options.push(o)
    else out.push({ group: g, options: [o] })
  }
  return out
}

/** Shared drawing for one option row in the Pro listboxes. */
export function OptionRow({
  id,
  option,
  active,
  selected,
  multiple,
  onPick,
  onHover,
  children,
}: {
  id: string
  option: ListOption
  active: boolean
  selected: boolean
  multiple: boolean
  onPick: () => void
  onHover: () => void
  children?: ReactNode
}) {
  return (
    <div
      id={id}
      role="option"
      aria-selected={selected}
      aria-disabled={option.disabled || undefined}
      onPointerDown={(e) => e.preventDefault()}
      onClick={() => !option.disabled && onPick()}
      onPointerMove={onHover}
      className={[
        'flex items-start gap-sm rounded-sm px-md py-sm font-mono text-body transition-colors duration-fast',
        option.disabled ? 'cursor-not-allowed text-disabled' : 'cursor-pointer text-ink',
        optionBar(!!active && !option.disabled),
      ].join(' ')}
    >
      {multiple && (
        <span className="mt-2xs">
          <CheckMark checked={selected} disabled={option.disabled} />
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-2xs">
        <span className="truncate">{children ?? option.label}</span>
        {option.description && <span className={['font-text text-caption leading-normal', option.disabled ? 'text-disabled' : 'text-muted'].join(' ')}>{option.description}</span>}
      </span>
      {!multiple && selected && (
        <svg aria-hidden viewBox="0 0 16 16" className="mt-2xs size-md shrink-0 text-sample">
          <path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
        </svg>
      )}
    </div>
  )
}
