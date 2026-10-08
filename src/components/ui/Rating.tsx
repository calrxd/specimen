'use client'

import { useId, useState } from 'react'
import { labelText } from './parts'

export type RatingSize = 'md' | 'sm'

export type RatingProps = {
  /** Names the rating, above the stars when shown: "Your rating", "Support quality". Sentence case. */
  label: string
  /** The stars filled at first, from 0 to max. Uncontrolled; pass onChange to observe it. */
  defaultValue?: number
  /** How many stars. Five unless a scale says otherwise. */
  max?: number
  /** md in forms, sm in table rows and review lists. */
  size?: RatingSize
  /** Shows the label above the stars. Off in a review list, where the column header names it. */
  labelVisible?: boolean
  /** Shows a score that cannot be changed, such as an average. Read as "4 out of 5". */
  readOnly?: boolean
  /** Inert. The stars go to the disabled colour. */
  disabled?: boolean
  /** Submits the value with a form. A generated name is used when omitted. */
  name?: string
  /** Called with the number of stars chosen. */
  onChange?: (value: number) => void
}

const STAR = 'M8 1.5 9.9 5.6 14.4 6.1 11 9.1 12 13.5 8 11.3 4 13.5 5 9.1 1.6 6.1 6.1 5.6Z'

const ICON: Record<RatingSize, string> = { md: 'size-xl', sm: 'size-md' }

function Star({ on, disabled, size }: { on: boolean; disabled: boolean; size: RatingSize }) {
  const colour = disabled ? (on ? 'fill-disabled stroke-disabled' : 'fill-none stroke-disabled') : on ? 'fill-sample-fill stroke-sample-fill' : 'fill-none stroke-line-interactive'
  return (
    <svg aria-hidden viewBox="0 0 16 16" className={['pointer-events-none shrink-0 transition-colors duration-fast', ICON[size], colour].join(' ')}>
      <path d={STAR} strokeWidth="1.25" strokeLinejoin="miter" />
    </svg>
  )
}

/**
 * Stars for a score out of five: a review, a satisfaction survey, a supplier's quality. Native
 * radios underneath, one per star, so the arrow keys change the score and a form submits it;
 * hovering previews the score before a click sets it. A read-only rating draws the same stars as
 * one image named "4 out of 5". Use a Slider for finer scales and a SelectButton for named levels.
 */
export function Rating({
  label,
  defaultValue = 0,
  max = 5,
  size = 'md',
  labelVisible = true,
  readOnly = false,
  disabled = false,
  name,
  onChange,
}: RatingProps) {
  const id = useId()
  const group = name ?? `${id}-rating`
  const [value, setValue] = useState(defaultValue)
  const [hover, setHover] = useState<number | null>(null)
  const shown = hover ?? value
  const stars = Array.from({ length: max }, (_, i) => i + 1)

  if (readOnly) {
    return (
      <div className="flex flex-col gap-sm">
        {labelVisible && (
          <span id={`${id}-label`} className={labelText}>
            {label}
          </span>
        )}
        <div
          role="img"
          aria-label={`${labelVisible ? '' : `${label}: `}${value} out of ${max}`}
          className="flex w-fit items-center gap-2xs"
        >
          {stars.map((n) => (
            <Star key={n} on={n <= value} disabled={disabled} size={size} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-sm border-0 p-0" disabled={disabled}>
      <legend className={labelVisible ? ['mb-sm p-0', labelText].join(' ') : 'sr-only'}>{label}</legend>
      <div className="flex w-fit items-center gap-2xs" onPointerLeave={() => setHover(null)}>
        {stars.map((n) => (
          <label
            key={n}
            onPointerEnter={() => !disabled && setHover(n)}
            className={[
              'flex cursor-pointer rounded-sm p-2xs',
              'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-sample',
              'has-[:disabled]:cursor-not-allowed',
            ].join(' ')}
          >
            <input
              type="radio"
              name={group}
              value={n}
              checked={value === n}
              onChange={() => {
                setValue(n)
                onChange?.(n)
              }}
              className="sr-only"
            />
            <span className="sr-only">{n === 1 ? '1 star' : `${n} stars`}</span>
            <Star on={n <= shown} disabled={disabled} size={size} />
          </label>
        ))}
      </div>
    </fieldset>
  )
}
