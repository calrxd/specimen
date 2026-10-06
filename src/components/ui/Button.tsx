import type { ComponentPropsWithoutRef } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md'

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    'border-sample-fill bg-sample-fill text-on-sample hover:border-sample-hover hover:bg-sample-hover active:border-sample-pressed active:bg-sample-pressed',
  secondary: 'border-line-interactive bg-transparent text-ink hover:border-ink hover:bg-surface',
  ghost: 'border-transparent bg-transparent text-muted hover:bg-surface hover:text-ink',
  danger:
    'border-danger-fill bg-danger-fill text-on-danger hover:border-danger-hover hover:bg-danger-hover active:border-danger-hover active:bg-danger-hover',
}

const SIZE: Record<ButtonSize, string> = {
  sm: 'px-lg py-sm text-caption',
  md: 'px-2xl py-lg text-body',
}

export type ButtonProps = {
  /** The text on the button. Sentence case, starting with a verb: "Notify me", "Publish", "Delete". */
  label: string
  /** Which job the button does. One primary per view. */
  variant?: ButtonVariant
  /** md for forms and page actions, sm for table rows and toolbars. */
  size?: ButtonSize
  /** Inert. Every variant collapses to the same outlined, muted form so a disabled control reads the same everywhere. */
  disabled?: boolean
} & Omit<ComponentPropsWithoutRef<'button'>, 'children' | 'disabled'>

/**
 * A mono, hairline-bordered button with the mark's 4px corner. Structure comes from the border, so the
 * disabled state drops the fill rather than dimming it, and the danger variant is a
 * fill only because a destructive confirm has to look different from everything else.
 */
export function Button({ label, variant = 'primary', size = 'md', disabled = false, type = 'button', className, ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={[
        'inline-flex cursor-pointer items-center justify-center gap-sm whitespace-nowrap rounded-sm border font-mono font-semibold transition-colors duration-fast',
        SIZE[size],
        VARIANT[variant],
        'disabled:cursor-not-allowed disabled:border-disabled disabled:bg-transparent disabled:text-disabled',
        className ?? '',
      ].join(' ')}
      {...rest}
    >
      {label}
    </button>
  )
}
