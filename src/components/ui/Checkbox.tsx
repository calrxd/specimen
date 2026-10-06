import { useId, type ComponentPropsWithoutRef } from 'react'

export type CheckboxProps = {
  /** The text beside the box. Sentence case, no full stop. */
  label: string
  /** One line under the label, in faint. The consent wording on a signup form is the model. */
  description?: string
  /** Whether the box starts ticked. Uncontrolled; pass onChange to observe it. */
  checked?: boolean
  /** Inert. Box and text go to the disabled colour. */
  disabled?: boolean
} & Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'checked' | 'defaultChecked' | 'disabled' | 'id' | 'className'>

/**
 * A box with the mark's 4px corner, hairline border, green fill with an ink tick when on. The native input
 * is drawn with appearance:none so it keeps keyboard, focus ring and form semantics while
 * matching the Figma component pixel for pixel. Never pre-tick a consent box.
 */
export function Checkbox({ label, description, checked = false, disabled = false, ...rest }: CheckboxProps) {
  const id = useId()
  const describedBy = description ? `${id}-desc` : undefined
  return (
    <label htmlFor={id} className={['flex items-start gap-md', disabled ? 'cursor-not-allowed' : 'cursor-pointer'].join(' ')}>
      <span className="relative mt-2xs flex size-lg shrink-0 items-center justify-center">
        <input
          id={id}
          type="checkbox"
          defaultChecked={checked}
          disabled={disabled}
          aria-describedby={describedBy}
          className="peer size-lg cursor-[inherit] appearance-none rounded-sm border border-line-interactive bg-surface transition-colors duration-fast checked:border-sample-fill checked:bg-sample-fill disabled:border-disabled disabled:bg-transparent"
          {...rest}
        />
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          className="pointer-events-none absolute size-md text-on-sample opacity-0 peer-checked:opacity-100 peer-disabled:text-disabled"
        >
          <path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
        </svg>
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
