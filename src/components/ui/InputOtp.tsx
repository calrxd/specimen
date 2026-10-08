'use client'

import { useId, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react'
import { FieldFrame, describedByOf, type FieldBaseProps } from './internal/d2-field'

export type InputOtpProps = FieldBaseProps & {
  /** How many characters the code has. Six for most authenticator and SMS codes. */
  length?: number
  /** numeric accepts digits only and opens the number keypad on phones; alphanumeric takes letters too. */
  type?: 'numeric' | 'alphanumeric'
  /** The code to start with, for an uncontrolled field. */
  defaultValue?: string
  /** Shows each character as a dot once typed, for codes read over a shoulder. */
  masked?: boolean
  /** Called with the whole code, gaps as empty, on every change. */
  onChange?: (code: string) => void
  /** Called once every box is filled. Submit or verify here. */
  onComplete?: (code: string) => void
  /** Submitted with a form under this name, as one value. */
  name?: string
}

/**
 * A one-time code across separate boxes, one character each. Typing moves to the next box,
 * Backspace clears the box and steps back, the arrow keys and Home and End move between
 * boxes, and pasting a whole code anywhere fills from the first box. The boxes sit in a
 * group named by the label, each announced as "Character 2 of 6"; the first carries
 * autocomplete one-time-code so phones offer the code from a text message.
 */
export function InputOtp({
  label,
  hint,
  error,
  required = false,
  disabled = false,
  length = 6,
  type = 'numeric',
  defaultValue = '',
  masked = false,
  onChange,
  onComplete,
  name,
}: InputOtpProps) {
  const id = useId()
  const [chars, setChars] = useState<string[]>(() => Array.from({ length }, (_, i) => defaultValue[i] ?? ''))
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const allowed = type === 'numeric' ? /[0-9]/ : /[0-9a-z]/i
  const clean = (s: string) => [...s].filter((c) => allowed.test(c)).map((c) => c.toUpperCase())

  const commit = (next: string[]) => {
    setChars(next)
    const code = next.join('')
    onChange?.(code)
    if (next.every(Boolean)) onComplete?.(code)
  }
  const focus = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus()

  const write = (start: number, input: string) => {
    const incoming = clean(input)
    if (!incoming.length) return
    const next = [...chars]
    incoming.slice(0, length - start).forEach((c, k) => (next[start + k] = c))
    commit(next)
    focus(Math.min(start + incoming.length, length - 1))
  }

  const onKeyDown = (i: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const next = [...chars]
      if (next[i]) next[i] = ''
      else if (i > 0) {
        next[i - 1] = ''
        focus(i - 1)
      }
      commit(next)
    } else if (e.key === 'Delete') {
      e.preventDefault()
      const next = [...chars]
      next[i] = ''
      commit(next)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      focus(i - 1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      focus(i + 1)
    } else if (e.key === 'Home') {
      e.preventDefault()
      focus(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      focus(length - 1)
    }
  }

  // A pasted code always fills from the first box, whichever box had focus.
  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = clean(e.clipboardData.getData('text'))
    if (!pasted.length) return
    const next = Array.from({ length }, (_, k) => pasted[k] ?? '')
    commit(next)
    focus(Math.min(pasted.length, length - 1))
  }

  // 40 wide and 46 tall: the md height of Field, so the code boxes line up with the controls
  // around them. 46px has no spacing token.
  const box = [
    'h-[2.875rem] w-4xl rounded-sm border text-center font-mono text-body-lg text-ink outline-none transition-colors duration-fast caret-sample',
    'focus-visible:border-sample',
    disabled
      ? 'cursor-not-allowed border-disabled bg-transparent text-disabled'
      : error
        ? 'border-danger bg-surface'
        : 'border-line-interactive bg-surface',
  ].join(' ')

  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} required={required}>
      <div
        role="group"
        aria-labelledby={`${id}-label`}
        aria-describedby={describedByOf(id, error, hint)}
        className="flex flex-wrap gap-sm"
      >
        {chars.map((c, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el
            }}
            type={masked ? 'password' : 'text'}
            inputMode={type === 'numeric' ? 'numeric' : 'text'}
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            aria-label={`Character ${i + 1} of ${length}`}
            aria-invalid={error ? true : undefined}
            required={required}
            disabled={disabled}
            maxLength={length}
            value={c}
            onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => {
              const v = e.currentTarget.value
              // The box may already hold a character; take whatever was typed last.
              const typed = v.length > 1 && c ? v.replace(c, '') : v
              write(i, typed || v)
            }}
            onKeyDown={onKeyDown(i)}
            onPaste={onPaste}
            className={box}
          />
        ))}
      </div>
      {name && <input type="hidden" name={name} value={chars.join('')} />}
    </FieldFrame>
  )
}
