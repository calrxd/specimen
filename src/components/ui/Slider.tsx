'use client'

import { useId, useState, type ChangeEvent, type ComponentPropsWithoutRef } from 'react'
import { labelText } from './parts'

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
        <label htmlFor={id} className={labelText}>
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
        // Drawn from the tokens instead of the browser's own range control, which paints the
        // unfilled track near-black in light mode next to a light accent. The filled part is a
        // gradient stop at the current value; the thumb is the dot, a full circle.
        style={{ ['--spc-fill' as string]: `${max > min ? ((value - min) / (max - min)) * 100 : 0}%` }}
        className={[
          'my-sm h-xs w-full cursor-pointer appearance-none rounded-full disabled:cursor-not-allowed',
          'bg-[linear-gradient(to_right,var(--color-sample-fill)_var(--spc-fill),var(--color-line-strong)_var(--spc-fill))]',
          'disabled:bg-[linear-gradient(to_right,var(--color-disabled)_var(--spc-fill),var(--color-line)_var(--spc-fill))]',
          '[&::-webkit-slider-thumb]:size-lg [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:bg-sample-fill',
          '[&::-moz-range-thumb]:size-lg [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-sample-fill',
          'disabled:[&::-webkit-slider-thumb]:bg-disabled disabled:[&::-moz-range-thumb]:bg-disabled',
        ].join(' ')}
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
