import type { ComponentPropsWithoutRef, ReactNode } from 'react'

export type IconButtonVariant = 'ghost' | 'secondary' | 'primary' | 'danger'
export type IconButtonSize = 'md' | 'sm'

// The same colours as Button, so an icon button beside a labelled one reads as the same family.
// Keep these in step with VARIANT in Button.tsx.
const VARIANT: Record<IconButtonVariant, string> = {
  ghost: 'border-transparent bg-transparent text-muted hover:bg-surface hover:text-ink',
  secondary: 'border-line-interactive bg-transparent text-ink hover:border-ink hover:bg-surface',
  primary:
    'border-sample-fill bg-sample-fill text-on-sample hover:border-sample-hover hover:bg-sample-hover active:border-sample-pressed active:bg-sample-pressed',
  danger:
    'border-danger-fill bg-danger-fill text-on-danger hover:border-danger-hover hover:bg-danger-hover active:border-danger-hover active:bg-danger-hover',
}

// A 20px box for the 16px icon, plus Button's vertical padding on every side: md is 46px square,
// the height of Button, Field and Select md, and sm is 38px, so an icon button sits level in a row.
const SIZE: Record<IconButtonSize, string> = {
  md: 'p-md',
  sm: 'p-sm',
}

export type IconButtonProps = {
  /** Names the button for assistive technology and shows as its tooltip, since the icon has no text. Sentence case, a verb: "Edit customer", "Delete row". */
  label: string
  /** A 16px stroke icon in currentColor. Decorative: the label is the button's name. */
  icon: ReactNode
  /** ghost in toolbars and table rows, secondary where it needs an edge, primary and danger as Button. */
  variant?: IconButtonVariant
  /** md beside fields and buttons, sm in table rows and dense toolbars. */
  size?: IconButtonSize
  /** For a toggle, such as bold in an editor or a pinned row: true while it is on. Turns the fill on and sets aria-pressed. */
  pressed?: boolean
  /** Inert. Every variant collapses to the disabled outline, as Button does. */
  disabled?: boolean
} & Omit<ComponentPropsWithoutRef<'button'>, 'children' | 'disabled' | 'aria-label' | 'aria-pressed'>

/**
 * A square button that shows only an icon, for actions that repeat down a table or sit in a
 * toolbar: edit, copy, more, close. The label is required, because it is the button's only
 * name, and doubles as the native tooltip. Same variants, colours and disabled outline as
 * Button. Pass `pressed` to make it a toggle; it then reports its state with aria-pressed.
 */
export function IconButton({
  label,
  icon,
  variant = 'ghost',
  size = 'md',
  pressed,
  disabled = false,
  type = 'button',
  title,
  className,
  ...rest
}: IconButtonProps) {
  const on = pressed === true
  return (
    <button
      type={type}
      disabled={disabled}
      aria-label={label}
      aria-pressed={pressed}
      title={title ?? label}
      className={[
        'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-sm border transition-colors duration-fast',
        SIZE[size],
        on ? 'border-sample bg-success-subtle text-ink hover:bg-success-subtle' : VARIANT[variant],
        'disabled:cursor-not-allowed disabled:border-disabled disabled:bg-transparent disabled:text-disabled',
        className ?? '',
      ].join(' ')}
      {...rest}
    >
      <span aria-hidden className="flex size-xl items-center justify-center [&>svg]:size-md">
        {icon}
      </span>
    </button>
  )
}
