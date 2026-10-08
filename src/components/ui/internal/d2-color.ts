/** Colour maths for ColorPicker. HSV because the picker's area is saturation by brightness. */

export type Hsv = { h: number; s: number; v: number }

const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n))

/** #RGB or #RRGGBB, with or without the hash. Returns null for anything else. */
export function parseHex(input: string): string | null {
  const m = input.trim().replace(/^#/, '')
  if (/^[0-9a-f]{3}$/i.test(m)) return ('#' + [...m].map((c) => c + c).join('')).toUpperCase()
  if (/^[0-9a-f]{6}$/i.test(m)) return ('#' + m).toUpperCase()
  return null
}

export function hexToHsv(hex: string): Hsv {
  const n = parseInt(hex.slice(1), 16)
  const r = ((n >> 16) & 255) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255
  const max = Math.max(r, g, b)
  const d = max - Math.min(r, g, b)
  let h = 0
  if (d) {
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  return { h, s: max ? d / max : 0, v: max }
}

export function hsvToHex({ h, s, v }: Hsv): string {
  const f = (k: number) => {
    const x = (k + h / 60) % 6
    return v - v * s * clamp(Math.min(x, 4 - x))
  }
  const to = (c: number) => Math.round(c * 255).toString(16).padStart(2, '0')
  return ('#' + to(f(5)) + to(f(3)) + to(f(1))).toUpperCase()
}

/** The pure hue at full saturation and brightness, for the area's background. */
export const hueHex = (h: number) => hsvToHex({ h, s: 1, v: 1 })

/** A plain-language name for a hue, for aria-valuetext. */
export function hueName(h: number) {
  const names: [number, string][] = [
    [15, 'red'], [45, 'orange'], [70, 'yellow'], [160, 'green'], [200, 'cyan'],
    [255, 'blue'], [290, 'purple'], [335, 'pink'], [361, 'red'],
  ]
  return names.find(([end]) => h < end)?.[1] ?? 'red'
}

export { clamp }
