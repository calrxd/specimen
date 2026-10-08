import { useId, type ReactNode } from 'react'

export type FieldsetProps = {
  /** Names the group, above its fields. Sentence case: "Billing address", "Notifications". */
  legend: string
  /** One or two sentences under the legend that explain the group. Read with every field inside. */
  description?: string
  /** Disables every control inside at once, through the native fieldset attribute. */
  disabled?: boolean
  /** The fields in the group, stacked with a large gap. */
  children: ReactNode
}

/**
 * A titled group of related form fields: a native fieldset and legend, so assistive technology
 * announces the legend when focus enters the group, and disabled reaches every control inside
 * without each one being told. The legend is a sentence-case title rather than a capitalised
 * field label, so it reads as a level above the labels it holds. Legend and description keep
 * their colours when the group is disabled: the controls show the state, the title stays legible.
 */
export function Fieldset({ legend, description, disabled = false, children }: FieldsetProps) {
  const id = useId()
  return (
    <fieldset
      disabled={disabled}
      aria-describedby={description ? `${id}-desc` : undefined}
      className="m-0 flex min-w-0 flex-col gap-lg border-0 p-0"
    >
      {/* A rendered legend sits outside the flex layout, so its spacing is a margin, not the gap. */}
      <legend className={['p-0 text-body-lg font-medium text-ink', description ? 'mb-xs' : 'mb-lg'].join(' ')}>{legend}</legend>
      {description && (
        <p id={`${id}-desc`} className="m-0 font-text text-caption leading-normal text-muted">
          {description}
        </p>
      )}
      {children}
    </fieldset>
  )
}
