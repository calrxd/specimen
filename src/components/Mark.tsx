/** Fixed brand geometry per size, drawn rather than taken from the spacing scale. */
const SIZES = {
  sm: { w: 32, h: 20, border: 2, radius: 4, dot: 6, inset: 5, bar: 2 },
  md: { w: 38, h: 24, border: 2, radius: 4, dot: 7, inset: 7, bar: 2 },
  lg: { w: 132, h: 84, border: 5, radius: 11, dot: 26, inset: 25, bar: 5 },
} as const

export type MarkSize = keyof typeof SIZES

/**
 * The paper bar only exists at `lg`; at sm and md the slide is too small to carry it.
 * The type says so, so `<Mark size="sm" showBar />` is a compile error rather than a
 * prop that silently does nothing.
 */
export type MarkProps =
  | { size?: 'sm' | 'md'; showBar?: never }
  | { size: 'lg'; /** The paper bar at 45% opacity. */ showBar?: boolean }

/**
 * The mark: a microscope slide, and the green dot is the specimen. Clearspace is twice the
 * dot's diameter. Below 22px wide, use the dot alone.
 */
export function Mark({ size = 'md', showBar = true }: MarkProps) {
  const s = SIZES[size]
  return (
    <div
      aria-hidden
      className="relative shrink-0"
      style={{
        width: s.w,
        height: s.h,
        border: `${s.border}px solid var(--color-ink)`,
        borderRadius: s.radius,
      }}
    >
      <div
        className="absolute rounded-full bg-sample-fill"
        style={{ left: s.inset, top: s.inset, width: s.dot, height: s.dot }}
      />
      {showBar && size === 'lg' && (
        <div
          className="absolute bg-ink opacity-45"
          style={{ right: 16, top: 16, bottom: 16, width: s.bar }}
        />
      )}
    </div>
  )
}

/** Two sizes, both literal like the mark's: md in the site header, sm in admin chrome. */
const WORDMARK_SIZES = { md: 17, sm: 15 } as const

export type WordmarkSize = keyof typeof WORDMARK_SIZES

/**
 * The wordmark: lowercase "specimen" and an underscore in the accent green. With cursor on,
 * the underscore blinks, so the system reads as still being written. One instance per view.
 */
export function Wordmark({
  size = 'md',
  cursor = false,
}: {
  /** Type size in px: md 17, sm 15. Fixed brand geometry, not the type scale. */
  size?: WordmarkSize
  /** The underscore blinks like a cursor instead of sitting still in the accent green. */
  cursor?: boolean
}) {
  return (
    <span className="font-medium tracking-wordmark" style={{ fontSize: WORDMARK_SIZES[size] }}>
      specimen
      <span className={cursor ? 'spc-cursor' : 'text-sample'}>_</span>
    </span>
  )
}
