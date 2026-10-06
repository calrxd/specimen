import { useId, type ComponentPropsWithoutRef } from 'react'

export type SwitchProps = {
  /** What turns on. Name the setting, not the action: "publish on save", not "enable". */
  label: string
  /** One line under the label, in faint. */
  description?: string
  /** Whether it starts on. Uncontrolled; pass onChange to observe it. */
  checked?: boolean
  /** Inert. Track, thumb and text go to the disabled colour. */
  disabled?: boolean
} & Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'checked' | 'defaultChecked' | 'disabled' | 'id' | 'className' | 'role'>

/**
 * A setting that takes effect immediately. Use Checkbox instead when the choice is
 * submitted with a form. A native checkbox with role="switch", drawn as a pill whose thumb
 * is the specimen dot: the line is an inset ring so the 8px dot sits exactly 4px from every
 * edge and travels one spacing step (lg, 16px).
 */
export function Switch({ label, description, checked = false, disabled = false, ...rest }: SwitchProps) {
  const id = useId()
  const describedBy = description ? `${id}-desc` : undefined
  return (
    <label htmlFor={id} className={['flex items-start justify-between gap-2xl', disabled ? 'cursor-not-allowed' : 'cursor-pointer'].join(' ')}>
      <span className="flex flex-col gap-2xs">
        <span className={['text-body', disabled ? 'text-disabled' : 'text-ink'].join(' ')}>{label}</span>
        {description && (
          <span id={`${id}-desc`} className={['font-text text-caption leading-normal', disabled ? 'text-disabled' : 'text-muted'].join(' ')}>
            {description}
          </span>
        )}
      </span>
      <span className="relative mt-2xs flex shrink-0 items-center">
        <input
          id={id}
          type="checkbox"
          role="switch"
          defaultChecked={checked}
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
