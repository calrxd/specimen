import { useId, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { FieldLabel, FieldMessage, groupBorder } from './parts'

export type InputGroupProps = {
  /** Always visible, above the input. Uppercase label style. */
  label: string
  /** Shown inside the empty input, in faint. */
  placeholder?: string
  /** A short addon before the input, in its own cell: "£", "https://", "@". Read with the input. */
  prefix?: string
  /** A short addon after the input, in its own cell: "%", "kg", "per seat". Read with the input. */
  suffix?: string
  /** A 16px icon inside the border, before the input: a search glass on a search field. Decorative, so it is hidden from assistive technology. */
  icon?: ReactNode
  /** One line under the input. Hidden while an error is showing. */
  hint?: string
  /** Replaces the hint, turns the border danger, and is announced as an alert. */
  error?: string
  /** Adds the green asterisk and the native required attribute. */
  required?: boolean
  /** Inert. Border, addons and text go to the disabled colour; no fill. */
  disabled?: boolean
  /** Displayed, not editable. Loses the interactive border, since there is nothing to find and click. */
  readOnly?: boolean
} & Omit<ComponentPropsWithoutRef<'input'>, 'placeholder' | 'prefix' | 'required' | 'disabled' | 'readOnly' | 'id' | 'className'>

/**
 * Field with addons: a text input that carries its unit or context with it, such as a price in
 * pounds, a rate in percent or a search field with its glass. Same label, hint, error and states
 * as Field, drawn from the same parts. The text addons sit in cells divided from the input by a
 * hairline and are named in aria-describedby, so "£" is read with the price. The icon sits
 * inside the input's cell and is decorative; the label says what the field is for.
 */
export function InputGroup({
  label,
  placeholder,
  prefix,
  suffix,
  icon,
  hint,
  error,
  required = false,
  disabled = false,
  readOnly = false,
  type = 'text',
  ...rest
}: InputGroupProps) {
  const id = useId()
  const describedBy =
    [prefix ? `${id}-prefix` : '', suffix ? `${id}-suffix` : '', error ? `${id}-error` : hint ? `${id}-hint` : ''].filter(Boolean).join(' ') ||
    undefined

  // A read-only box keeps a decorative border, like Field, and the focus ring instead of the
  // sample border, since the border colour is not allowed to change for it.
  const border =
    readOnly && !disabled && !error
      ? 'border-line bg-canvas has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-sample'
      : groupBorder({ error, disabled })

  const addon = [
    'flex shrink-0 items-center px-lg font-mono text-body',
    disabled ? 'text-disabled' : 'text-muted',
  ].join(' ')
  const divider = disabled ? 'border-disabled' : 'border-line'

  return (
    <div className="flex w-full flex-col gap-sm">
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <div className={['flex min-w-0 items-stretch overflow-hidden rounded-sm border transition-colors duration-fast', border].join(' ')}>
        {prefix && (
          <span id={`${id}-prefix`} className={[addon, 'border-r', divider].join(' ')}>
            {prefix}
          </span>
        )}
        {icon && (
          <span aria-hidden className={['flex shrink-0 items-center pl-lg [&>svg]:size-md', disabled ? 'text-disabled' : 'text-muted'].join(' ')}>
            {icon}
          </span>
        )}
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
            'min-w-0 flex-1 border-0 bg-transparent py-md font-mono text-body outline-none',
            icon ? 'pr-lg pl-md' : 'px-lg',
            readOnly ? 'text-muted' : 'text-ink',
            'disabled:cursor-not-allowed disabled:text-disabled disabled:placeholder:text-disabled',
          ].join(' ')}
          {...rest}
        />
        {suffix && (
          <span id={`${id}-suffix`} className={[addon, 'border-l', divider].join(' ')}>
            {suffix}
          </span>
        )}
      </div>
      <FieldMessage id={id} hint={hint} error={error} />
    </div>
  )
}
