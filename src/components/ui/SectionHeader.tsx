/**
 * Opens a section: the label left, optional metadata right, and the hairline that divides
 * sections in place of boxes or shadows.
 */
export function SectionHeader({
  label,
  meta,
}: {
  /** What the section holds. Sentence case. */
  label: string
  /** Right-aligned detail in muted: a count, a date, a catalogue number. */
  meta?: string
}) {
  return (
    <div className="flex items-baseline justify-between border-b border-line pb-lg">
      <div className="text-body text-ink tracking-tag">
        {label}
      </div>
      {meta && <div className="text-label text-muted">{meta}</div>}
    </div>
  )
}
