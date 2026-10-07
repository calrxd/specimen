import type { ReactNode } from 'react'

/*
 * Shared pieces of the form controls and the dismissable surfaces. Internal: nothing here has a
 * story, so nothing here is a Figma component. Field, Select, Textarea, InputNumber, Password,
 * Slider and SelectButton all draw their label, hint, error and border from this one file, so
 * a change to the form language lands everywhere at once.
 */

/** The label above a control: label size, capitals, wide tracking, muted. */
export const labelText = 'text-label uppercase text-muted tracking-label'

export function FieldLabel({ htmlFor, required = false, children }: { htmlFor: string; required?: boolean; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className={labelText}>
      {children}
      {required && (
        <span className="text-sample" aria-hidden>
          {' '}
          *
        </span>
      )}
    </label>
  )
}

/** The id a control should name in aria-describedby: the error when there is one, else the hint. */
export const messageId = (id: string, hint?: string, error?: string) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined)

/** The line under a control. An error replaces the hint and is announced; a hint is read with the control. */
export function FieldMessage({ id, hint, error }: { id: string; hint?: string; error?: string }) {
  if (error)
    return (
      <p id={`${id}-error`} role="alert" className="m-0 font-text text-caption text-danger">
        {error}
      </p>
    )
  if (hint)
    return (
      <p id={`${id}-hint`} className="m-0 font-text text-caption text-muted">
        {hint}
      </p>
    )
  return null
}

/**
 * Border classes for a control that takes focus itself (input, select, textarea). At rest the
 * border is line-interactive and turns sample on focus, which is the focus indicator, so the
 * outline is switched off. An invalid or read-only control keeps its border colour, so it keeps
 * the global focus ring instead: focus must never be invisible.
 */
export function controlBorder({ error, readOnly }: { error?: string; readOnly?: boolean }) {
  if (error) return 'border-danger'
  if (readOnly) return 'border-line'
  return 'border-line-interactive outline-none focus-visible:border-sample'
}

/**
 * Border and fill classes for a box that holds an input plus buttons (InputNumber, Password).
 * The input inside switches its outline off, so the box shows focus: a sample border at rest,
 * and the focus ring around the box when the danger border has to stay.
 */
export function groupBorder({ error, disabled }: { error?: string; disabled?: boolean }) {
  if (disabled) return 'border-disabled bg-transparent'
  if (error)
    return 'border-danger bg-surface has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-sample'
  return 'border-line-interactive bg-surface has-[input:focus-visible]:border-sample'
}

/**
 * The text close control on Toast, Message, Dialog and Drawer. Padded to a 24px target, the
 * WCAG 2.2 minimum, and pulled back by the same amount so it does not push the layout around.
 */
export function CloseButton({ onClick, label = 'Close' }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-my-xs shrink-0 cursor-pointer rounded-sm border-0 bg-transparent px-xs py-xs font-mono text-caption text-muted transition-colors duration-fast hover:text-ink"
    >
      {label}
    </button>
  )
}
