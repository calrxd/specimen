'use client'

import { useId, useState, type ComponentPropsWithoutRef } from 'react'

export type PasswordProps = {
  /** Always visible, above the input. Uppercase label style. */
  label: string
  /** Shown inside the empty input, in faint. */
  placeholder?: string
  /** One line under the input: the rules a new password must meet. Hidden while an error is showing. */
  hint?: string
  /** Replaces the hint, turns the border danger, and is announced as an alert. */
  error?: string
  /** Adds the green asterisk and the native required attribute. */
  required?: boolean
  /** Inert. Border and text go to the disabled colour; no fill. */
  disabled?: boolean
  /** Shows the Show and Hide control, so a person can check what they typed. */
  revealable?: boolean
} & Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'placeholder' | 'required' | 'disabled' | 'id' | 'className'>

/**
 * A password field: Field's label, hint and error, with a Show control that reveals what was
 * typed. The control is a toggle button (aria-pressed) inside the field's border, and the
 * input keeps its autocomplete attribute so password managers still work.
 */
export function Password({
  label,
  placeholder,
  hint,
  error,
  required = false,
  disabled = false,
  revealable = true,
  autoComplete = 'current-password',
  ...rest
}: PasswordProps) {
  const id = useId()
  const [shown, setShown] = useState(false)
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  const border = error ? 'border-danger' : 'border-line-interactive has-[:focus-visible]:border-sample'

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
      <div
        className={[
          'flex min-w-0 items-center rounded-sm border bg-surface transition-colors duration-fast',
          border,
          disabled ? 'border-disabled bg-transparent' : '',
        ].join(' ')}
      >
        <input
          id={id}
          type={shown ? 'text' : 'password'}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="min-w-0 flex-1 border-0 bg-transparent px-lg py-md font-mono text-body text-ink outline-none disabled:cursor-not-allowed disabled:text-disabled disabled:placeholder:text-disabled"
          {...rest}
        />
        {revealable && (
          <button
            type="button"
            aria-pressed={shown}
            aria-controls={id}
            aria-label={shown ? 'Hide password' : 'Show password'}
            disabled={disabled}
            onClick={() => setShown((s) => !s)}
            className="mr-sm shrink-0 cursor-pointer rounded-sm border-0 bg-transparent px-sm py-xs font-mono text-caption text-muted transition-colors duration-fast hover:text-ink disabled:cursor-not-allowed disabled:text-disabled"
          >
            {shown ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="m-0 font-text text-caption text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="m-0 font-text text-caption text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
