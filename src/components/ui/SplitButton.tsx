'use client'

import { Button } from './Button'
import { Menu, type MenuItem } from './Menu'

export type SplitButtonVariant = 'primary' | 'secondary'
export type SplitButtonSize = 'md' | 'sm'

export type SplitButtonProps = {
  /** The main action, on the left. Sentence case, starting with a verb: "Send invoice", "Publish". */
  label: string
  /** The other actions, in the menu the arrow opens. Content, not a Figma property: the library shows three. */
  items: MenuItem[]
  /** primary when the main action is the one green action in the view, secondary otherwise. */
  variant?: SplitButtonVariant
  /** md for forms and page actions, sm for table rows and toolbars. */
  size?: SplitButtonSize
  /** Names the arrow for assistive technology, since it shows no text. */
  menuLabel?: string
  /** Inert. Both halves collapse to the disabled outline, as Button does. */
  disabled?: boolean
  /** Runs the main action. */
  onClick?: () => void
}

// The arrow half repeats Button's primary and secondary colours: Button renders only its label,
// so it cannot hold the chevron. Keep these in step with VARIANT in Button.tsx. The arrow
// overlaps the main half by a pixel so the two share one border. On primary it always stacks
// on top, so its ink divider shows; on secondary whichever half is hovered comes up.
const ARROW_VARIANT: Record<SplitButtonVariant, string> = {
  primary:
    'z-10 border-sample-fill border-l-on-sample bg-sample-fill text-on-sample hover:border-sample-hover hover:border-l-on-sample hover:bg-sample-hover active:border-sample-pressed active:border-l-on-sample active:bg-sample-pressed',
  secondary: 'hover:z-10 focus-visible:z-10 border-line-interactive bg-transparent text-ink hover:border-ink hover:bg-surface',
}

// Same vertical padding and text size as Button, so both halves share its height.
const ARROW_SIZE: Record<SplitButtonSize, string> = {
  sm: 'px-sm py-sm text-caption',
  md: 'px-md py-md text-body',
}

/**
 * A main action joined to an arrow that opens the actions next to it, for a button with one
 * common job and a few less common ones: "Send invoice" with "Send a test", "Schedule" and
 * "Download PDF". The left half is a Button and the right half opens a Menu, so the colours,
 * keyboard handling and popover come from those two. On primary an ink rule divides the
 * halves; on secondary they share one border.
 */
export function SplitButton({
  label,
  items,
  variant = 'primary',
  size = 'md',
  menuLabel = 'More actions',
  disabled = false,
  onClick,
}: SplitButtonProps) {
  return (
    <div className="inline-flex items-stretch">
      <Button
        label={label}
        variant={variant}
        size={size}
        disabled={disabled}
        onClick={onClick}
        className="relative rounded-r-none hover:z-10 focus-visible:z-10"
      />
      <Menu
        align="end"
        items={items}
        trigger={
          <button
            type="button"
            aria-label={menuLabel}
            disabled={disabled}
            className={[
              'relative -ml-px inline-flex cursor-pointer items-center justify-center rounded-l-none rounded-r-sm border font-mono transition-colors duration-fast',
              ARROW_SIZE[size],
              ARROW_VARIANT[variant],
              'disabled:cursor-not-allowed disabled:border-disabled disabled:border-l-disabled disabled:bg-transparent disabled:text-disabled',
            ].join(' ')}
          >
            {/* The text line box sets the height, as in Button; the chevron sits inside it. */}
            <span aria-hidden className="inline-flex items-center">
              &#8203;
              <svg viewBox="0 0 16 16" className="size-md">
                <path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
              </svg>
            </span>
          </button>
        }
      />
    </div>
  )
}
