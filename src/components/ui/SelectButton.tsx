import { useId } from 'react'

export type SelectButtonOption = { value: string; label: string; disabled?: boolean }
export type SelectButtonSize = 'md' | 'sm'

export type SelectButtonProps = {
  /** Names the choice for assistive technology and, when shown, above the control. Sentence case. */
  label: string
  /** The choices, two to five. Content, not a Figma property: the library shows three. */
  options: SelectButtonOption[]
  /** The value selected at first. Uncontrolled; pass onChange to observe it. */
  defaultValue?: string
  /** Groups the radios for a form, and must be unique on the page. A generated name is used when omitted. */
  name?: string
  /** md beside other fields, sm in toolbars and table headers. */
  size?: SelectButtonSize
  /** Shows the label above the control. Off in toolbars, where the options explain themselves. */
  labelVisible?: boolean
  /** Inert. Every option goes to the disabled colour. */
  disabled?: boolean
  /** Called with the selected value. */
  onChange?: (value: string) => void
}

const SIZE: Record<SelectButtonSize, string> = {
  md: 'px-lg py-sm text-body',
  sm: 'px-md py-xs text-caption',
}

/**
 * A segmented control: two to five mutually exclusive options shown side by side, for
 * switching a view or a period ("Day, Week, Month"). Native radios underneath, so arrow keys
 * move the selection and a form submits the value; the visible segments are their labels.
 * Use Select when there are more than five options or the labels are long.
 */
export function SelectButton({
  label,
  options,
  defaultValue,
  name,
  size = 'md',
  labelVisible = false,
  disabled = false,
  onChange,
}: SelectButtonProps) {
  const id = useId()
  const group = name ?? `${id}-group`

  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-sm border-0 p-0" disabled={disabled}>
      <legend className={labelVisible ? 'mb-sm p-0 text-label uppercase text-muted tracking-label' : 'sr-only'}>{label}</legend>
      <div
        className={[
          'inline-flex w-fit gap-2xs rounded-sm border p-2xs',
          disabled ? 'border-disabled' : 'border-line-interactive',
        ].join(' ')}
      >
        {options.map((o) => (
          <label
            key={o.value}
            className={[
              'cursor-pointer rounded-sm font-mono text-muted transition-colors duration-fast hover:text-ink',
              'has-[:checked]:bg-sample-fill has-[:checked]:text-on-sample',
              'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-sample',
              'has-[:disabled]:cursor-not-allowed has-[:disabled]:text-disabled has-[:checked:disabled]:bg-transparent has-[:checked:disabled]:text-disabled',
              SIZE[size],
            ].join(' ')}
          >
            <input
              type="radio"
              name={group}
              value={o.value}
              defaultChecked={o.value === defaultValue}
              disabled={o.disabled}
              onChange={() => onChange?.(o.value)}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
