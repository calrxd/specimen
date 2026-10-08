import type { ReactNode } from 'react'
import { FieldMessage, labelText } from '@/components/ui/parts'

/** The label, hint and error props every Pro form control shares with Field. */
export type FieldBaseProps = {
  /** Always visible, above the control. Uppercase label style. */
  label: string
  /** One line under the control. Hidden while an error is showing. */
  hint?: string
  /** Replaces the hint, turns the border danger, and is announced as an alert. */
  error?: string
  /** Adds the green asterisk and marks the control required. */
  required?: boolean
  /** Inert. Border and text go to the disabled colour; no fill. */
  disabled?: boolean
}

/** aria-describedby for the hint or the error, whichever is showing. */
export const describedByOf = (id: string, error?: string, hint?: string) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined

/** The border every control box uses, by state. Matches Field and Password. */
export function borderOf({ error, disabled, focusWithin = true }: { error?: string; disabled?: boolean; focusWithin?: boolean }) {
  if (disabled) return 'border-disabled bg-transparent'
  if (error) return 'border-danger bg-surface'
  return ['border-line-interactive bg-surface', focusWithin ? 'has-[:focus-visible]:border-sample' : 'focus-visible:border-sample'].join(' ')
}

/**
 * Field's frame for a Pro control: the label above, the hint or error below. labelFor points
 * the label at a native input; a composite control passes labelId instead and uses
 * aria-labelledby, since a label element can only name one input.
 */
export function FieldFrame({
  id,
  label,
  hint,
  error,
  required,
  labelFor,
  children,
}: FieldBaseProps & { id: string; labelFor?: string; children: ReactNode }) {
  const labelClass = labelText
  const mark = required && (
    <span className="text-sample" aria-hidden>
      {' '}
      *
    </span>
  )
  return (
    <div className="flex w-full flex-col gap-sm">
      {labelFor ? (
        <label id={`${id}-label`} htmlFor={labelFor} className={labelClass}>
          {label}
          {mark}
        </label>
      ) : (
        <span id={`${id}-label`} className={labelClass}>
          {label}
          {mark}
        </span>
      )}
      {children}
      <FieldMessage id={id} hint={hint} error={error} />
    </div>
  )
}
