import type { ComponentPropsWithoutRef } from 'react'

/**
 * The bare box from Checkbox, without its label: for selection cells in a grid, a tree or
 * a listbox row, where the row itself carries the text. Draws the tick when checked and a
 * dash when `indeterminate`, so a parent with some children selected reads as mixed.
 */
export function CheckBox({
  indeterminate = false,
  ...rest
}: { indeterminate?: boolean } & Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'className'>) {
  return (
    <span className="relative flex size-lg shrink-0 items-center justify-center">
      <input
        type="checkbox"
        ref={(el) => {
          if (el) el.indeterminate = indeterminate
        }}
        className="peer size-lg cursor-pointer appearance-none rounded-sm border border-line-interactive bg-surface transition-colors duration-fast checked:border-sample-fill checked:bg-sample-fill indeterminate:border-sample-fill indeterminate:bg-sample-fill disabled:cursor-not-allowed disabled:border-disabled disabled:bg-transparent"
        {...rest}
      />
      <svg aria-hidden viewBox="0 0 16 16" className="pointer-events-none absolute size-md text-on-sample opacity-0 peer-checked:opacity-100 peer-indeterminate:opacity-100">
        {indeterminate ? (
          <path d="M4 8h8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
        ) : (
          <path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
        )}
      </svg>
    </span>
  )
}

/**
 * A box that only draws, for rows that are themselves the control (an option in a
 * listbox, a treeitem). Hidden from assistive technology: the row carries aria-selected.
 */
export function CheckMark({ checked, indeterminate = false, disabled = false }: { checked: boolean; indeterminate?: boolean; disabled?: boolean }) {
  const on = checked || indeterminate
  return (
    <span
      aria-hidden
      className={[
        'flex size-lg shrink-0 items-center justify-center rounded-sm border transition-colors duration-fast',
        disabled ? 'border-disabled' : on ? 'border-sample-fill bg-sample-fill text-on-sample' : 'border-line-interactive bg-surface',
      ].join(' ')}
    >
      {on && (
        <svg viewBox="0 0 16 16" className="size-md">
          {indeterminate && !checked ? (
            <path d="M4 8h8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
          ) : (
            <path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
          )}
        </svg>
      )}
    </span>
  )
}
