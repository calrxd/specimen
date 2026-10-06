export type TagTone = 'sample' | 'muted' | 'success' | 'info' | 'warn' | 'danger'

const TONE: Record<TagTone, string> = {
  sample: 'border-sample text-sample',
  muted: 'border-line-strong text-muted',
  success: 'border-success text-success',
  info: 'border-info text-info',
  warn: 'border-warn text-warn',
  danger: 'border-danger text-danger',
}

export type TagProps = {
  /** Catalogue text: "SPC-014 · BUTTON · STABLE". Rendered uppercase. Use middle dots to separate. */
  label: string
  /** Colour of stroke and text. sample for catalogue labels, muted for inert metadata, the four status tones for state. */
  tone?: TagTone
}

/**
 * The tag: 1px stroke, no fill, small caps, wide tracking. Metadata only, never a
 * headline. It is a label, not a control, so it carries no hover and no focus.
 */
export function Tag({ label, tone = 'sample' }: TagProps) {
  return (
    <span
      className={['inline-block rounded-sm border px-sm py-xs text-micro uppercase tracking-tag', TONE[tone]].join(' ')}
    >
      {label}
    </span>
  )
}
