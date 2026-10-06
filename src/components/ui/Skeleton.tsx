export type SkeletonShape = 'text' | 'rect' | 'circle'

export type SkeletonProps = {
  /** text draws lines of copy, rect a block such as a card or chart, circle an avatar. */
  shape?: SkeletonShape
  /** Number of lines for shape text. The last line is shorter, as real paragraphs are. */
  lines?: number
}

/**
 * A placeholder in the shape of content that is still loading, so the layout does not jump
 * when it arrives. Decorative: hidden from assistive technology, so pair it with a status
 * message or a Spinner label. It pulses slowly and stops under reduced motion.
 */
export function Skeleton({ shape = 'text', lines = 3 }: SkeletonProps) {
  const base = 'spc-pulse bg-line'
  if (shape === 'circle') return <span aria-hidden className={['block size-4xl rounded-full', base].join(' ')} />
  if (shape === 'rect') return <span aria-hidden className={['block h-9xl w-full rounded-md', base].join(' ')} />
  return (
    <span aria-hidden className="flex w-full flex-col gap-sm">
      {Array.from({ length: Math.max(1, lines) }, (_, i) => (
        <span
          key={i}
          className={['block h-md rounded-sm', base, i === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full'].join(' ')}
        />
      ))}
    </span>
  )
}
