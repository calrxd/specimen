/**
 * Stroke icons shared by the Pro data and selection components. Strokes, not fills, so
 * they follow the text colour and the disabled colour without a second asset.
 */

type IconProps = { className?: string }

const base = 'pointer-events-none shrink-0'

export function ChevronDown({ className = 'size-md' }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className={[base, className].join(' ')}>
      <path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}

export function ChevronRight({ className = 'size-md' }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className={[base, className].join(' ')}>
      <path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}

export function ChevronLeft({ className = 'size-md' }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className={[base, className].join(' ')}>
      <path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}

export function Tick({ className = 'size-md' }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className={[base, className].join(' ')}>
      <path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  )
}

export function Cross({ className = 'size-md' }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className={[base, className].join(' ')}>
      <path d="M4.5 4.5 11.5 11.5M11.5 4.5 4.5 11.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}

export function Calendar({ className = 'size-md' }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className={[base, className].join(' ')}>
      <path d="M2.5 4h11v9.5h-11zM2.5 7h11M5.5 2v3M10.5 2v3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  )
}

export function SortArrow({ direction, className = 'size-md' }: IconProps & { direction: 'ascending' | 'descending' | 'none' }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className={[base, className].join(' ')}>
      {direction === 'none' ? (
        <path d="M5 6l3-3 3 3M5 10l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
      ) : direction === 'ascending' ? (
        <path d="M4 10l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
      ) : (
        <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
      )}
    </svg>
  )
}
