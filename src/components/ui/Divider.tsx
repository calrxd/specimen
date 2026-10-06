export type DividerOrientation = 'horizontal' | 'vertical'

export type DividerProps = {
  /** horizontal between stacked blocks, vertical between items in a row. */
  orientation?: DividerOrientation
  /** Short text centred on the line, such as "or". Horizontal only. */
  label?: string
  /** strong uses line-strong for a heavier break; the default is the decorative line. */
  strong?: boolean
}

/**
 * A hairline that separates content, the brand's own structural device. Decorative by
 * default; a labelled divider is announced as a separator with its label.
 */
export function Divider({ orientation = 'horizontal', label, strong = false }: DividerProps) {
  const colour = strong ? 'border-line-strong' : 'border-line'

  if (orientation === 'vertical') {
    return <div role="separator" aria-orientation="vertical" className={['w-none self-stretch border-l', colour].join(' ')} />
  }

  if (!label) return <hr className={['m-0 w-full border-0 border-t', colour].join(' ')} />

  return (
    <div role="separator" aria-label={label} className="flex w-full items-center gap-md">
      <span aria-hidden className={['flex-1 border-t', colour].join(' ')} />
      <span className="text-caption text-muted">{label}</span>
      <span aria-hidden className={['flex-1 border-t', colour].join(' ')} />
    </div>
  )
}
