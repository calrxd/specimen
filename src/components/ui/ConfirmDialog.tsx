'use client'

import { useEffect, useId, useState, type ReactNode } from 'react'
import { Button } from './Button'
import { Dialog } from './Dialog'
import { Field } from './Field'
import { Spinner } from './Spinner'

export type ConfirmDialogTone = 'primary' | 'danger'

export type ConfirmDialogProps = {
  /** Whether the dialog is showing. Controlled: set it false from onCancel, and from onConfirm once the action succeeds. */
  open: boolean
  /** The decision as a question, sentence case: "Delete the Harbour & Hale workspace?" */
  title: string
  /** What will happen, and what cannot be undone. */
  description?: string
  /** Extra detail under the description, such as a list of what will be removed. */
  children?: ReactNode
  /** Says exactly what the confirm button does: "Delete workspace", never "OK" or "Yes". */
  confirmLabel: string
  /** The safe way out. Takes focus when the dialog opens. */
  cancelLabel?: string
  /** primary for an important action, danger for one that destroys something. Sets the confirm button's variant. */
  tone?: ConfirmDialogTone
  /** The action is running. Both buttons go inert, a spinner shows, and Escape and the close control do nothing until it ends. */
  pending?: boolean
  /** Replaces the confirm label while pending, present tense: "Deleting workspace". Also what the spinner announces. */
  pendingLabel?: string
  /** For the most destructive actions: the exact text, usually the name, the reader must type before confirm unlocks. Case-sensitive. */
  confirmText?: string
  /** Called on the confirm button, and on Enter in the type-to-confirm field once it matches. */
  onConfirm: () => void
  /** Called on the cancel button, on Escape, on a click outside the panel and on the close control. */
  onCancel: () => void
}

/**
 * The confirm step before a destructive or important action, built on Dialog. Focus lands on
 * the cancel button when it opens, so a reflexive Enter backs out rather than going ahead. The
 * confirm button names the action, and the danger tone turns it into the red fill. While the
 * action runs, pending holds the dialog open with both buttons inert and a spinner beside them.
 * For an action that cannot be undone and takes a lot with it (deleting a workspace), pass
 * confirmText: confirm stays locked until the reader types it exactly.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  children,
  confirmLabel,
  cancelLabel = 'Cancel',
  tone = 'primary',
  pending = false,
  pendingLabel,
  confirmText,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const id = useId()
  const cancelId = `${id}-cancel`
  const [typed, setTyped] = useState('')
  const [wasOpen, setWasOpen] = useState(open)

  // Clear the typed text each time the dialog opens, so a second delete starts locked again.
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setTyped('')
  }

  // Dialog's own effect calls showModal first (a child's effects run before its parent's),
  // which focuses the first control in the panel. Moving focus here puts it on the safe action.
  useEffect(() => {
    if (open) document.getElementById(cancelId)?.focus()
  }, [open, cancelId])

  const matches = confirmText === undefined || typed === confirmText
  const confirm = () => {
    if (!pending && matches) onConfirm()
  }

  return (
    <Dialog
      open={open}
      title={title}
      description={description}
      onClose={() => {
        if (!pending) onCancel()
      }}
      footer={
        <>
          {pending && <Spinner label={pendingLabel ?? confirmLabel} size="sm" />}
          <Button id={cancelId} label={cancelLabel} variant="secondary" size="sm" disabled={pending} onClick={onCancel} />
          <Button
            label={pending && pendingLabel ? pendingLabel : confirmLabel}
            variant={tone}
            size="sm"
            disabled={pending || !matches}
            onClick={confirm}
          />
        </>
      }
    >
      {children}
      {confirmText !== undefined && (
        <Field
          label="Type to confirm"
          hint={`Enter “${confirmText}” exactly as shown.`}
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') confirm()
          }}
          disabled={pending}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      )}
    </Dialog>
  )
}
