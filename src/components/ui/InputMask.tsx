'use client'

import { useId, useState, type ChangeEvent, type ComponentPropsWithoutRef } from 'react'
import { FieldFrame, describedByOf, type FieldBaseProps } from './internal/d2-field'

/**
 * A mask pattern. 9 is a digit, a is a letter, * is a letter or digit; anything else is a
 * literal the field types for you, such as the dashes in a sort code.
 */
export type MaskPattern = string

/** Patterns for the formats B2B forms ask for most. */
export const MASKS = {
  /** A UK mobile or landline, 07700 900123. */
  phone: '99999 999999',
  /** A UK bank sort code, 20-00-00. */
  'sort-code': '99-99-99',
  /** A 16-digit card number in groups of four. */
  card: '9999 9999 9999 9999',
  /** A UK VAT registration number, GB 123 4567 89. */
  vat: 'GB 999 9999 99',
} as const

export type InputMaskProps = FieldBaseProps & {
  /** A named format, or your own pattern (9 digit, a letter, * either; other characters are typed for you). */
  mask: keyof typeof MASKS | MaskPattern
  /** Shown inside the empty input. Defaults to an example of the pattern, such as 00-00-00. */
  placeholder?: string
  /** The unformatted value to start with, digits and letters only. */
  defaultValue?: string
  /** Called on every change with the raw characters and the formatted text. */
  onChange?: (raw: string, formatted: string) => void
  /** Submitted with a form under this name. The raw value, without the literals. */
  name?: string
} & Omit<ComponentPropsWithoutRef<'input'>, 'onChange' | 'defaultValue' | 'value' | 'placeholder' | 'required' | 'disabled' | 'id' | 'className' | 'name' | 'type'>

const SLOT: Record<string, RegExp> = { '9': /[0-9]/, a: /[a-z]/i, '*': /[0-9a-z]/i }

/**
 * Reads typed or pasted text against the pattern and returns the raw characters and the
 * formatted text. Literals the person typed (or that were already in the field) are matched
 * by position and skipped, so a digit inside a pattern, like the 44 in "+44 9999", is never
 * counted twice. Characters that fit no slot are dropped.
 */
export function applyMask(pattern: MaskPattern, input: string) {
  let raw = ''
  let pi = 0
  for (const c of input) {
    // Skip literals the input does not contain: the person typed only the slot characters.
    while (pi < pattern.length && !SLOT[pattern[pi]] && pattern[pi].toUpperCase() !== c.toUpperCase()) pi++
    if (pi >= pattern.length) break
    const rule = SLOT[pattern[pi]]
    if (!rule) {
      pi++ // a literal, already in place
    } else if (rule.test(c)) {
      raw += pattern[pi] === '9' ? c : c.toUpperCase()
      pi++
    }
  }

  // Format: literals are only written once a slot character follows them, so Backspace
  // over the last character also removes the dash before it.
  let formatted = ''
  let pending = ''
  let ri = 0
  for (const p of pattern) {
    if (ri >= raw.length) break
    if (!SLOT[p]) {
      pending += p
      continue
    }
    formatted += pending + raw[ri++]
    pending = ''
  }
  return { raw, formatted }
}

const exampleOf = (pattern: MaskPattern) => pattern.replace(/9/g, '0').replace(/a/g, 'A').replace(/\*/g, '0')

/**
 * A text input that formats as you type: sort codes, phone numbers, card numbers, VAT
 * numbers or a pattern of your own. The literals (dashes, spaces) are written for the person,
 * paste is reformatted, and the form receives the raw characters. It stays a native text
 * input, so selection, undo and screen readers behave as usual; the expected format is in
 * the placeholder and should also be in the hint.
 */
export function InputMask({
  label,
  hint,
  error,
  required = false,
  disabled = false,
  mask,
  placeholder,
  defaultValue = '',
  onChange,
  name,
  inputMode,
  ...rest
}: InputMaskProps) {
  const id = useId()
  const pattern = mask in MASKS ? MASKS[mask as keyof typeof MASKS] : mask
  const [value, setValue] = useState(() => applyMask(pattern, defaultValue))
  const digitsOnly = !/[a*]/.test(pattern.replace(/[^9a*]/g, ''))

  const handle = (e: ChangeEvent<HTMLInputElement>) => {
    const next = applyMask(pattern, e.currentTarget.value)
    setValue(next)
    onChange?.(next.raw, next.formatted)
  }

  const border = disabled
    ? 'border-disabled bg-transparent'
    : error
      ? 'border-danger bg-surface'
      : 'border-line-interactive bg-surface focus-visible:border-sample'

  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} required={required} labelFor={id}>
      <input
        id={id}
        type="text"
        inputMode={inputMode ?? (digitsOnly ? 'numeric' : 'text')}
        placeholder={placeholder ?? exampleOf(pattern)}
        required={required}
        disabled={disabled}
        maxLength={pattern.length}
        value={value.formatted}
        onChange={handle}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedByOf(id, error, hint)}
        className={[
          'min-w-0 rounded-sm border px-lg py-md font-mono text-body tabular-nums text-ink outline-none transition-colors duration-fast',
          border,
          'disabled:cursor-not-allowed disabled:text-disabled disabled:placeholder:text-disabled',
        ].join(' ')}
        {...rest}
      />
      {name && <input type="hidden" name={name} value={value.raw} />}
    </FieldFrame>
  )
}
