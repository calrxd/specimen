import { useId, type ComponentPropsWithoutRef } from 'react'

export type RadioProps = {
  /** The text beside the circle. Sentence case, no full stop. */
  label: string
  /** One line under the label, in faint. */
  description?: string
  /** Whether this option starts selected. Uncontrolled; pass onChange to observe it. */
  checked?: boolean
  /** Inert. Circle and text go to the disabled colour. */
  disabled?: boolean
} & Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'checked' | 'defaultChecked' | 'disabled' | 'id' | 'className'>

/**
 * One option in a set where exactly one can be chosen. Group options with a shared
 * `name` inside a fieldset whose legend asks the question. The only round control in the
 * system: it belongs to the dot family, so the selected state is the green specimen dot.
 */
export function Radio({ label, description, checked = false, disabled = false, ...rest }: RadioProps) {
  const id = useId()
  const describedBy = description ? `${id}-desc` : undefined
  return (
    <label htmlFor={id} className={['flex items-start gap-md', disabled ? 'cursor-not-allowed' : 'cursor-pointer'].join(' ')}>
      <span className="relative mt-2xs flex size-lg shrink-0 items-center justify-center">
        <input
          id={id}
          type="radio"
          defaultChecked={checked}
          disabled={disabled}
          aria-describedby={describedBy}
          className="peer size-lg cursor-[inherit] appearance-none rounded-full border border-line-interactive bg-surface transition-colors duration-fast checked:border-sample-fill disabled:border-disabled disabled:bg-transparent"
          {...rest}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute size-sm rounded-full bg-sample-fill opacity-0 transition-opacity duration-fast peer-checked:opacity-100 peer-disabled:bg-disabled"
        />
      </span>
      <span className="flex flex-col gap-2xs">
        <span className={['text-body', disabled ? 'text-disabled' : 'text-ink'].join(' ')}>{label}</span>
        {description && (
          <span id={`${id}-desc`} className={['font-text text-caption leading-normal', disabled ? 'text-disabled' : 'text-muted'].join(' ')}>
            {description}
          </span>
        )}
      </span>
    </label>
  )
}
