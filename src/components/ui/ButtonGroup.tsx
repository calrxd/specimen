import type { ReactNode } from 'react'

export type ButtonGroupOrientation = 'horizontal' | 'vertical'

// The buttons share their borders: each overlaps the one before by a pixel, only the outer
// corners stay round, and the hovered or focused button comes up so its whole edge shows.
const ORIENTATION: Record<ButtonGroupOrientation, string> = {
  horizontal:
    'flex-row [&>*:first-child]:rounded-l-sm [&>*:last-child]:rounded-r-sm [&>*:not(:first-child)]:-ml-px',
  vertical:
    'flex-col [&>*:first-child]:rounded-t-sm [&>*:last-child]:rounded-b-sm [&>*:not(:first-child)]:-mt-px',
}

export type ButtonGroupProps = {
  /** Names the group for assistive technology: "Calendar view", "Text alignment". Sentence case. */
  label: string
  /** The Buttons and IconButtons in the group, in reading order. Give them one variant and one size. */
  children: ReactNode
  /** horizontal in toolbars and page headers, vertical in a narrow side panel. */
  orientation?: ButtonGroupOrientation
}

/**
 * Related actions joined into one shape: "Day, Week, Month" view buttons, "Previous, Next", or
 * alignment in an editor toolbar. The buttons stay ordinary Buttons and IconButtons, each in the
 * tab order; the group names them with role="group" and joins their borders. For actions that
 * only need to sit together, a row with a gap is enough. Use SelectButton when exactly one
 * option is on at a time, and SplitButton for one main action with a few related ones in a menu.
 */
export function ButtonGroup({ label, children, orientation = 'horizontal' }: ButtonGroupProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={[
        'inline-flex w-fit items-stretch [&>*]:relative [&>*]:rounded-none [&>*:hover]:z-10 [&>*:focus-visible]:z-20',
        ORIENTATION[orientation],
      ].join(' ')}
    >
      {children}
    </div>
  )
}
