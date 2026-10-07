'use client'

import { useId, useRef, useState, type ChangeEvent, type ComponentPropsWithoutRef } from 'react'
import { FieldLabel, FieldMessage, groupBorder } from './parts'

export type InputNumberProps = {
  /** Always visible, above the input. Uppercase label style. */
  label: string
  /** The starting number. Uncontrolled; pass onChange to observe it. */
  defaultValue?: number
  /** The lowest value the steppers and the field accept. */
  min?: number
  /** The highest value the steppers and the field accept. */
  max?: number
  /** How far one press of a stepper or an arrow key moves the value. */
  step?: number
  /** A unit shown after the number, in muted: "seats", "GBP", "%". */
  unit?: string
  /** One line under the input. Hidden while an error is showing. */
  hint?: string
  /** Replaces the hint, turns the border danger, and is announced as an alert. */
  error?: string
  /** Adds the green asterisk and the native required attribute. */
  required?: boolean
  /** Inert. Border, steppers and text go to the disabled colour. */
  disabled?: boolean
} & Omit<
  ComponentPropsWithoutRef<'input'>,
  'type' | 'defaultValue' | 'value' | 'min' | 'max' | 'step' | 'required' | 'disabled' | 'id' | 'className'
>

const clamp = (n: number, min?: number, max?: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n))

/**
 * A number field with decrease and increase buttons either side, for quantities a person
 * adjusts in steps: seats, retries, a percentage. A native number input underneath,
 * so arrow keys step it and assistive technology announces it as a spin button. The steppers
 * stay out of the tab order because the arrow keys already do their job.
 */
export function InputNumber({
  label,
  defaultValue,
  min,
  max,
  step = 1,
  unit,
  hint,
  error,
  required = false,
  disabled = false,
  onChange,
  ...rest
}: InputNumberProps) {
  const id = useId()
  const [value, setValue] = useState(defaultValue === undefined ? '' : String(defaultValue))
  const describedBy = [error ? `${id}-error` : hint ? `${id}-hint` : '', unit ? `${id}-unit` : ''].filter(Boolean).join(' ') || undefined
  const current = value === '' ? (min ?? 0) : Number(value)

  const inputRef = useRef<HTMLInputElement>(null)
  // The steppers write through the input, as typing does, so onChange sees every change.
  // React tracks the value through the native setter, so set it there and fire an input event.
  const nudge = (direction: 1 | -1) => {
    const input = inputRef.current
    if (!input) return
    const next = String(clamp(current + direction * step, min, max))
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, next)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  }
  const handle = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    onChange?.(e)
  }

  const stepper =
    'flex w-4xl shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent font-mono text-body text-muted transition-colors duration-fast hover:bg-canvas hover:text-ink disabled:cursor-not-allowed disabled:bg-transparent disabled:text-disabled'

  return (
    <div className="flex w-full flex-col gap-sm">
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <div
        className={[
          'flex min-w-0 items-stretch overflow-hidden rounded-sm border transition-colors duration-fast',
          groupBorder({ error, disabled }),
        ].join(' ')}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label={`Decrease ${label}`}
          disabled={disabled || (min !== undefined && current <= min)}
          onClick={() => nudge(-1)}
          className={['border-r border-line', stepper].join(' ')}
        >
          −
        </button>
        <input
          ref={inputRef}
          id={id}
          type="number"
          inputMode="decimal"
          value={value}
          min={min}
          max={max}
          step={step}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={handle}
          className="min-w-0 flex-1 appearance-none border-0 bg-transparent px-lg py-md text-center font-mono text-body text-ink tabular-nums outline-none [appearance:textfield] disabled:cursor-not-allowed disabled:text-disabled [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          {...rest}
        />
        {unit && (
          <span id={`${id}-unit`} className="flex items-center pr-lg font-mono text-caption text-muted">
            {unit}
          </span>
        )}
        <button
          type="button"
          tabIndex={-1}
          aria-label={`Increase ${label}`}
          disabled={disabled || (max !== undefined && current >= max)}
          onClick={() => nudge(1)}
          className={['border-l border-line', stepper].join(' ')}
        >
          +
        </button>
      </div>
      <FieldMessage id={id} hint={hint} error={error} />
    </div>
  )
}
