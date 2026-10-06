import { useId, type ComponentPropsWithoutRef } from 'react'

export type SelectOption = { value: string; label: string }

export type SelectProps = {
  /** Always visible, above the control. Uppercase label style. */
  label: string
  /** The choices. Content, not a Figma property: the library shows a representative value. */
  options: SelectOption[]
  /** Shown as the first, unselectable choice when nothing is chosen yet. */
  placeholder?: string
  /** One line under the control. Hidden while an error is showing. */
  hint?: string
  /** Replaces the hint, turns the border danger, and is announced as an alert. */
  error?: string
  /** Adds the green asterisk and the native required attribute. */
  required?: boolean
  /** Inert. Border, text and chevron go to the disabled colour. */
  disabled?: boolean
} & Omit<ComponentPropsWithoutRef<'select'>, 'placeholder' | 'required' | 'disabled' | 'id' | 'className' | 'children'>

/**
 * A native select drawn to match Field: same label, hint and error slots, same border
 * rules. Native so it keeps the platform picker, keyboard behaviour and form semantics.
 * The chevron is a stroke, not a fill, so it follows the text colour.
 */
export function Select({ label, options, placeholder, hint, error, required = false, disabled = false, defaultValue, ...rest }: SelectProps) {
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  const border = error ? 'border-danger' : 'border-line-interactive focus-visible:border-sample'

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
      <span className="relative flex">
        <select
          id={id}
          required={required}
          disabled={disabled}
          // A controlled select (value passed through rest) must not also get a
          // defaultValue, or React warns and ignores one of them.
          {...(rest.value === undefined ? { defaultValue: defaultValue ?? (placeholder ? '' : undefined) } : {})}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={[
            'min-w-0 flex-1 cursor-pointer appearance-none rounded-sm border bg-surface py-md pr-5xl pl-lg font-mono text-body text-ink outline-none transition-colors duration-fast',
            border,
            'disabled:cursor-not-allowed disabled:border-disabled disabled:bg-transparent disabled:text-disabled',
          ].join(' ')}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          className={['pointer-events-none absolute top-1/2 right-lg size-md -translate-y-1/2', disabled ? 'text-disabled' : 'text-muted'].join(' ')}
        >
          <path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
        </svg>
      </span>
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
