export type ChipProps = {
  /** The value the chip stands for. Sentence case, a few words: "Overdue", "Harbour & Hale". */
  label: string
  /** Shows a remove control after the label. Pair with onRemove. */
  removable?: boolean
  /** Shows the green dot before the label, for an active filter. */
  dot?: boolean
  /** Inert. Text, border and the remove control go to the disabled colour. */
  disabled?: boolean
  /** Called when the remove control is pressed. */
  onRemove?: () => void
}

/**
 * A chip: one selected value or active filter, removable in place. Unlike Tag, which is
 * read-only metadata in capitals, a chip is something the person chose and can take back,
 * so it is sentence case on a surface fill with a real button to remove it.
 */
export function Chip({ label, removable = false, dot = false, disabled = false, onRemove }: ChipProps) {
  return (
    <span
      className={[
        'inline-flex max-w-full items-center gap-sm rounded-sm border bg-surface py-xs font-mono text-caption',
        removable ? 'pr-xs pl-sm' : 'px-sm',
        disabled ? 'border-disabled text-disabled' : 'border-line-strong text-ink',
      ].join(' ')}
    >
      {dot && <span aria-hidden className={['size-xs shrink-0 rounded-full', disabled ? 'bg-disabled' : 'bg-sample-fill'].join(' ')} />}
      <span className="truncate">{label}</span>
      {removable && (
        <button
          type="button"
          aria-label={`Remove ${label}`}
          disabled={disabled}
          onClick={onRemove}
          className="flex size-lg shrink-0 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent p-0 font-mono text-caption text-muted transition-colors duration-fast hover:bg-canvas hover:text-ink disabled:cursor-not-allowed disabled:bg-transparent disabled:text-disabled"
        >
          <svg aria-hidden viewBox="0 0 16 16" className="size-md">
            <path d="M4.5 4.5 11.5 11.5M11.5 4.5 4.5 11.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          </svg>
        </button>
      )}
    </span>
  )
}
