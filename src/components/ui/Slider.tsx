'use client'

import { useId, useState, type ChangeEvent, type ComponentPropsWithoutRef } from 'react'

export type SliderProps = {
  /** Always visible, above the track. Uppercase label style. */
  label: string
  /** The starting value. Uncontrolled; pass onChange to observe it. */
  defaultValue?: number
  /** The left end of the track. */
  min?: number
  /** The right end of the track. */
  max?: number
  /** The smallest move, by drag or arrow key. */
  step?: number
  /** A unit shown after the current value: "%", "GB", "days". */
  unit?: string
  /** Shows the current value at the right of the label row. */
  showValue?: boolean
  /** Inert. Track and thumb go to the disabled colour. */
  disabled?: boolean
} & Omit<
  ComponentPropsWithoutRef<'input'>,
  'type' | 'defaultValue' | 'value' | 'min' | 'max' | 'step' | 'disabled' | 'id' | 'className'
>

/**
 * A value picked by position on a track, for settings where the rough amount matters more
 * than the exact number: a storage limit, a retention period, a sampling rate. A native range
 * input, so dragging, arrow keys, Page Up and Page Down, Home and End all work, coloured with
 * the sample accent. Use InputNumber when the exact value matters.
 */
export function Slider({
  label,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  unit,
  showValue = true,
  disabled = false,
  onChange,
  ...rest
}: SliderProps) {
  const id = useId()
  const [value, setValue] = useState(defaultValue ?? min)
  const handle = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(Number(e.target.value))
    onChange?.(e)
  }
  const text = `${value}${unit ? ` ${unit}` : ''}`

  return (
    <div className="flex w-full flex-col gap-sm">
      <div className="flex items-baseline justify-between gap-lg">
        <label htmlFor={id} className="text-label uppercase text-muted tracking-label">
          {label}
        </label>
        {showValue && (
          <output htmlFor={id} className={['font-mono text-caption tabular-nums', disabled ? 'text-disabled' : 'text-ink'].join(' ')}>
            {text}
          </output>
        )}
      </div>
      <input
        id={id}
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        aria-valuetext={text}
        onChange={handle}
        className="h-lg w-full cursor-pointer accent-sample-fill disabled:cursor-not-allowed disabled:accent-disabled"
        {...rest}
      />
      <div aria-hidden className="flex justify-between font-mono text-caption text-muted tabular-nums">
        <span>
          {min}
          {unit ? ` ${unit}` : ''}
        </span>
        <span>
          {max}
          {unit ? ` ${unit}` : ''}
        </span>
      </div>
    </div>
  )
}
