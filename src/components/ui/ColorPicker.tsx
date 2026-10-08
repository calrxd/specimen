'use client'

import { useId, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { FieldFrame, describedByOf, type FieldBaseProps } from './internal/d2-field'
import { clamp, hexToHsv, hsvToHex, hueHex, hueName, parseHex, type Hsv } from './internal/d2-color'

export type ColorPickerProps = FieldBaseProps & {
  /** The colour to start with, as #RRGGBB. */
  defaultValue?: string
  /** Preset colours shown as buttons under the picker: brand colours, label colours. */
  swatches?: string[]
  /** Hides the saturation and hue picker, leaving the hex field and the swatches. */
  swatchesOnly?: boolean
  /** Called with #RRGGBB whenever the colour changes. */
  onChange?: (hex: string) => void
  /** Submitted with a form under this name, as #RRGGBB. */
  name?: string
}

const STEP = 0.01
const BIG = 0.1

/**
 * Choose a colour three ways: drag in the saturation and brightness area, move the hue
 * slider, or type a hex value; preset swatches sit underneath. Every part works from the
 * keyboard. The area is a slider whose arrows change saturation (Left, Right) and brightness
 * (Up, Down), Shift moves ten times as far, and its value is read out in words. The hue
 * slider follows the APG slider pattern. Swatches are toggle buttons with the hex as their
 * name. The colours on screen are content, the only colour here not drawn from the tokens.
 */
export function ColorPicker({
  label,
  hint,
  error,
  required = false,
  disabled = false,
  defaultValue = '#07753F',
  swatches = [],
  swatchesOnly = false,
  onChange,
  name,
}: ColorPickerProps) {
  const id = useId()
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(parseHex(defaultValue) ?? '#07753F'))
  const hex = hsvToHex(hsv)
  const [draft, setDraft] = useState<string | null>(null)

  const set = (next: Hsv) => {
    setHsv(next)
    setDraft(null)
    onChange?.(hsvToHex(next))
  }

  const fromPointer = (e: PointerEvent<HTMLDivElement>, kind: 'area' | 'hue') => {
    if (disabled) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = clamp((e.clientX - r.left) / r.width)
    const y = clamp((e.clientY - r.top) / r.height)
    set(kind === 'area' ? { ...hsv, s: x, v: 1 - y } : { ...hsv, h: x * 360 })
  }
  const drag = (kind: 'area' | 'hue') => ({
    onPointerDown: (e: PointerEvent<HTMLDivElement>) => {
      if (disabled) return
      e.currentTarget.setPointerCapture(e.pointerId)
      e.currentTarget.focus()
      fromPointer(e, kind)
    },
    onPointerMove: (e: PointerEvent<HTMLDivElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) fromPointer(e, kind)
    },
  })

  const onAreaKey = (e: KeyboardEvent) => {
    const d = e.shiftKey ? BIG : STEP
    const next =
      e.key === 'ArrowRight' ? { ...hsv, s: clamp(hsv.s + d) }
      : e.key === 'ArrowLeft' ? { ...hsv, s: clamp(hsv.s - d) }
      : e.key === 'ArrowUp' ? { ...hsv, v: clamp(hsv.v + d) }
      : e.key === 'ArrowDown' ? { ...hsv, v: clamp(hsv.v - d) }
      : null
    if (!next) return
    e.preventDefault()
    set(next)
  }
  const onHueKey = (e: KeyboardEvent) => {
    const d = e.shiftKey || e.key === 'PageUp' || e.key === 'PageDown' ? 36 : 1
    const h =
      e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'PageUp' ? hsv.h + d
      : e.key === 'ArrowLeft' || e.key === 'ArrowDown' || e.key === 'PageDown' ? hsv.h - d
      : e.key === 'Home' ? 0
      : e.key === 'End' ? 359
      : null
    if (h === null) return
    e.preventDefault()
    set({ ...hsv, h: clamp(h, 0, 359) })
  }

  const pct = (n: number) => `${Math.round(n * 100)}%`
  const thumb = 'pointer-events-none absolute size-lg -translate-x-1/2 -translate-y-1/2 rounded-full border-strong border-solid'
  // A white ring with a dark edge reads on every colour the area can show.
  const ring = { borderColor: '#FFFFFF', outline: '1px solid rgba(0, 0, 0, 0.6)' }
  const focusable = disabled ? undefined : 0
  // Disabled keeps the colours visible but drained, with the disabled border, so it reads inert
  // without opacity.
  const inert = disabled ? 'cursor-not-allowed grayscale brightness-75' : 'cursor-crosshair'

  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} required={required}>
      <div
        role="group"
        aria-labelledby={`${id}-label`}
        aria-describedby={describedByOf(id, error, hint)}
        className={[
          'flex w-full max-w-measure-sm flex-col gap-lg rounded-md border p-lg',
          disabled ? 'border-disabled' : error ? 'border-danger bg-surface' : 'border-line-strong bg-surface',
        ].join(' ')}
      >
        {!swatchesOnly && (
          <>
            <div
              role="slider"
              tabIndex={focusable}
              aria-label="Saturation and brightness"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(hsv.s * 100)}
              aria-valuetext={`Saturation ${pct(hsv.s)}, brightness ${pct(hsv.v)}`}
              aria-disabled={disabled || undefined}
              onKeyDown={disabled ? undefined : onAreaKey}
              {...drag('area')}
              className={['relative h-9xl w-full touch-none rounded-sm', inert].join(' ')}
              style={{
                backgroundColor: hueHex(hsv.h),
                backgroundImage: 'linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)',
              }}
            >
              <span className={thumb} style={{ ...ring, left: pct(hsv.s), top: pct(1 - hsv.v), backgroundColor: hex }} />
            </div>
            <div
              role="slider"
              tabIndex={focusable}
              aria-label="Hue"
              aria-valuemin={0}
              aria-valuemax={359}
              aria-valuenow={Math.round(hsv.h)}
              aria-valuetext={`${Math.round(hsv.h)} degrees, ${hueName(hsv.h)}`}
              aria-orientation="horizontal"
              aria-disabled={disabled || undefined}
              onKeyDown={disabled ? undefined : onHueKey}
              {...drag('hue')}
              className={['relative h-md w-full touch-none rounded-full', inert].join(' ')}
              style={{ backgroundImage: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' }}
            >
              <span className={[thumb, 'top-1/2'].join(' ')} style={{ ...ring, left: `${(hsv.h / 360) * 100}%`, backgroundColor: hueHex(hsv.h) }} />
            </div>
          </>
        )}

        <div className="flex items-center gap-md">
          <span aria-hidden className="size-4xl shrink-0 rounded-sm border border-line-strong" style={{ backgroundColor: hex }} />
          <label className="flex min-w-0 flex-1 flex-col gap-2xs">
            <span className="text-label uppercase text-muted tracking-label">Hex</span>
            <input
              type="text"
              value={draft ?? hex}
              disabled={disabled}
              spellCheck={false}
              autoComplete="off"
              aria-invalid={draft !== null && !parseHex(draft) ? true : undefined}
              onChange={(e) => {
                const v = e.currentTarget.value
                setDraft(v)
                const ok = parseHex(v)
                if (ok && v.replace('#', '').length === 6) {
                  setHsv(hexToHsv(ok))
                  onChange?.(ok)
                }
              }}
              onBlur={() => {
                const ok = draft !== null && parseHex(draft)
                if (ok) set(hexToHsv(ok))
                else setDraft(null)
              }}
              className="min-w-0 rounded-sm border border-line-interactive bg-canvas px-md py-sm font-mono text-body uppercase text-ink outline-none transition-colors duration-fast focus-visible:border-sample disabled:cursor-not-allowed disabled:border-disabled disabled:bg-transparent disabled:text-disabled"
            />
          </label>
        </div>

        {swatches.length > 0 && (
          <div role="group" aria-label="Preset colours" className="flex flex-wrap gap-sm">
            {swatches.map((s) => {
              const sw = parseHex(s) ?? s
              const on = sw === hex
              return (
                <button
                  key={sw}
                  type="button"
                  aria-label={sw}
                  aria-pressed={on}
                  disabled={disabled}
                  onClick={() => set(hexToHsv(sw))}
                  className={[
                    'size-2xl cursor-pointer rounded-sm border p-none transition-[outline-color] duration-fast disabled:cursor-not-allowed disabled:border-disabled disabled:grayscale disabled:brightness-75',
                    on ? 'border-ink outline-2 outline-offset-2 outline-ink' : 'border-line-strong',
                  ].join(' ')}
                  style={{ backgroundColor: sw }}
                />
              )
            })}
          </div>
        )}
      </div>
      {name && <input type="hidden" name={name} value={hex} />}
    </FieldFrame>
  )
}
