import { useId, type ComponentPropsWithoutRef } from 'react'

export type TextareaProps = {
  /** Always visible, above the box. Uppercase label style. */
  label: string
  /** Shown inside the empty box, in faint. */
  placeholder?: string
  /** One line under the box. Hidden while an error is showing. */
  hint?: string
  /** Replaces the hint, turns the border danger, and is announced as an alert. */
  error?: string
  /** Adds the green asterisk and the native required attribute. */
  required?: boolean
  /** Inert. Border and text go to the disabled colour; no fill. */
  disabled?: boolean
  /** Displayed, not editable. Loses the interactive border, since there is nothing to find and click. */
  readOnly?: boolean
} & Omit<ComponentPropsWithoutRef<'textarea'>, 'placeholder' | 'required' | 'disabled' | 'readOnly' | 'id' | 'className'>

/**
 * Field for more than one line: same label, hint and error slots, same border rules.
 * Four rows by default and resizable vertically only, so a long answer can grow without
 * breaking the column it sits in.
 */
export function Textarea({ label, placeholder, hint, error, required = false, disabled = false, readOnly = false, rows = 4, ...rest }: TextareaProps) {
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  const border = error
    ? 'border-danger'
    : readOnly
      ? 'border-line'
      : 'border-line-interactive focus-visible:border-sample'

  return (
    <div className="flex w-full flex-col gap-sm">
      <label htmlFor={id} className="text-label uppercase text-muted tracking-label">
        {label}
        {required && (
          <span className="text-sample" aria-hidden>
            {' '}
            *
          </span>
        )}
      </label>
      <textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={[
          'min-w-0 resize-y rounded-sm border font-mono text-body leading-normal outline-none transition-colors duration-fast',
          'px-lg py-md',
          readOnly ? 'bg-canvas text-muted' : 'bg-surface text-ink',
          border,
          'disabled:cursor-not-allowed disabled:resize-none disabled:border-disabled disabled:bg-transparent disabled:text-disabled disabled:placeholder:text-disabled',
        ].join(' ')}
        {...rest}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="font-text text-caption text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="font-text text-caption text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
