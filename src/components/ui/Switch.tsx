import { useId, useState, type ComponentPropsWithoutRef } from 'react'

export type SwitchProps = {
  /** What turns on. Name the setting, not the action: "publish on save", not "enable". */
  label: string
  /** One line under the label, in faint. */
  description?: string
  /** Whether it is on. Follows the prop when it changes, so a parent can drive it; a click flips it either way. */
  checked?: boolean
  /** Show the label beside the switch. Off hides it visually; it stays the accessible name. */
  labelVisible?: boolean
  /** Inert. Track, thumb and text go to the disabled colour. */
  disabled?: boolean
  /** Called with the new state whenever a person flips it. */
  onChange?: (checked: boolean) => void
} & Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'checked' | 'defaultChecked' | 'disabled' | 'id' | 'className' | 'role' | 'onChange'>

/**
 * A setting that takes effect immediately. Use Checkbox instead when the choice is
 * submitted with a form. A native checkbox with role="switch", drawn as a pill whose thumb
 * is the specimen dot: the line is an inset ring so the 8px dot sits exactly 4px from every
 * edge and travels one spacing step (lg, 16px).
 *
 * It holds its own state, seeded from `checked`, and follows `checked` whenever the prop
 * changes, so a parent can turn a group off at once (a "pause all" switch). Pass `onChange`
 * to hear every flip. With `labelVisible` off, the label is read out but not drawn, for a
 * grid of switches whose row and column already say what each one does.
 */
export function Switch({ label, description, checked = false, labelVisible = true, disabled = false, onChange, ...rest }: SwitchProps) {
  const id = useId()
  const describedBy = description ? `${id}-desc` : undefined
  const [on, setOn] = useState(checked)
  // Following the prop during render, not in an effect, so the switch never paints a stale state.
  const [seed, setSeed] = useState(checked)
  if (checked !== seed) {
    setSeed(checked)
    setOn(checked)
  }
  return (
    <label
      htmlFor={id}
      className={[labelVisible ? 'flex items-start justify-between gap-2xl' : 'inline-flex', disabled ? 'cursor-not-allowed' : 'cursor-pointer'].join(' ')}
    >
      <span className={labelVisible ? 'flex flex-col gap-2xs' : 'sr-only'}>
        <span className={['text-body', disabled ? 'text-disabled' : 'text-ink'].join(' ')}>{label}</span>
        {description && (
          <span id={`${id}-desc`} className={['font-text text-caption leading-normal', disabled ? 'text-disabled' : 'text-muted'].join(' ')}>
            {description}
          </span>
        )}
      </span>
      <span className={['relative flex shrink-0 items-center', labelVisible ? 'mt-2xs' : ''].join(' ')}>
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={on}
          onChange={(e) => {
            setOn(e.currentTarget.checked)
            onChange?.(e.currentTarget.checked)
          }}
          disabled={disabled}
          aria-describedby={describedBy}
          className="peer h-lg w-3xl cursor-[inherit] appearance-none rounded-full bg-surface ring-1 ring-line-interactive ring-inset transition-colors duration-fast checked:bg-sample-fill checked:ring-sample-fill disabled:bg-transparent disabled:ring-disabled"
          {...rest}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute left-xs size-sm rounded-full bg-muted transition-transform duration-fast peer-checked:translate-x-lg peer-checked:bg-on-sample peer-disabled:bg-disabled"
        />
      </span>
    </label>
  )
}
