import type { ReactNode } from 'react'
import { FieldMessage, labelText } from '@/components/ui/parts'

/**
 * The label, hint and error frame every Pro form control shares with Field, so a
 * DatePicker or a MultiSelect sits in a form beside a Field without a seam. The control
 * itself is passed as children and must carry `id` (labelled by the label) and the
 * describedby id this frame returns.
 */
export function FieldFrame({
  id,
  label,
  hint,
  error,
  required,
  children,
  labelAs = 'label',
}: {
  id: string
  label: string
  hint?: string
  error?: string
  required?: boolean
  children: ReactNode
  /** span when the control is a button or a group a native label cannot point at. */
  labelAs?: 'label' | 'span'
}) {
  const Label = labelAs
  return (
    <div className="flex w-full flex-col gap-sm">
      <Label {...(labelAs === 'label' ? { htmlFor: id } : {})} id={`${id}-label`} className={labelText}>
        {label}
        {required && (
          <span className="text-sample" aria-hidden>
            {' '}
            *
          </span>
        )}
      </Label>
      {children}
      <FieldMessage id={id} hint={hint} error={error} />
    </div>
  )
}

/** The describedby id for a FieldFrame: the error when there is one, else the hint. */
export const describedByOf = (id: string, hint?: string, error?: string) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined)
