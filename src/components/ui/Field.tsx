import { useId, type ComponentPropsWithoutRef } from 'react'
import { FieldLabel, FieldMessage, controlBorder, messageId } from './parts'

export type FieldProps = {
  /** Always visible, above the input. Uppercase label style. */
  label: string
  /** Shown inside the empty input, in faint. */
  placeholder?: string
  /** One line under the input. Hidden while an error is showing. */
  hint?: string
  /** Replaces the hint, turns the border danger, and is announced as an alert. */
  error?: string
  /** Adds the green asterisk and the native required attribute. */
  required?: boolean
  /** Inert. Border and text go to the disabled colour; no fill. */
  disabled?: boolean
  /** Displayed, not editable. Loses the interactive border, since there is nothing to find and click. */
  readOnly?: boolean
} & Omit<ComponentPropsWithoutRef<'input'>, 'placeholder' | 'required' | 'disabled' | 'readOnly' | 'id' | 'className'>

/**
 * A labelled text input with the hint and error slots every form needs. The border does
 * the work: line-interactive at rest (3:1, per WCAG 1.4.11), sample on focus, danger on
 * error, line when read-only, disabled when disabled.
 */
export function Field({ label, placeholder, hint, error, required = false, disabled = false, readOnly = false, type = 'text', ...rest }: FieldProps) {
  const id = useId()
  const describedBy = messageId(id, hint, error)

  const border = controlBorder({ error, readOnly })

  return (
    <div className="flex w-full flex-col gap-sm">
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={[
          'min-w-0 rounded-sm border font-mono text-body transition-colors duration-fast',
          'px-lg py-md',
          readOnly ? 'bg-canvas text-muted' : 'bg-surface text-ink',
          border,
          'disabled:cursor-not-allowed disabled:border-disabled disabled:bg-transparent disabled:text-disabled disabled:placeholder:text-disabled',
        ].join(' ')}
        {...rest}
      />
      <FieldMessage id={id} hint={hint} error={error} />
    </div>
  )
}
