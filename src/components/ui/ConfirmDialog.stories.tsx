import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from './Button'
import { ConfirmDialog } from './ConfirmDialog'

/**
 * Story arg names are the contract. `title`, `confirmLabel` and `cancelLabel` are text
 * properties; `description`, `pendingLabel` and `confirmText` are optional text, each with a
 * `...Visible` boolean; `tone` is the variant axis; `open` shows the scrim and panel; `pending`
 * shows the spinner and the inert buttons as a layer over the footer; `children` is a slot.
 * In the canvas, confirming runs a pretend action for two seconds, then closes.
 */
const meta = {
  title: 'Components/ConfirmDialog',
  component: ConfirmDialog,
  argTypes: {
    title: { control: 'text', description: 'The decision, as a question.' },
    description: { control: 'text', description: 'What will happen. Omit to hide.' },
    confirmLabel: { control: 'text', description: 'Exactly what the confirm button does.' },
    cancelLabel: { control: 'text', description: 'The safe way out. Takes focus on open.' },
    tone: { control: 'inline-radio', options: ['primary', 'danger'], description: 'danger for an action that destroys something.' },
    pending: { control: 'boolean', description: 'The action is running. Buttons go inert.' },
    pendingLabel: { control: 'text', description: 'Replaces the confirm label while pending.' },
    confirmText: { control: 'text', description: 'Text to type before confirm unlocks. Omit to hide the field.' },
    open: { control: 'boolean', description: 'Showing or not.' },
  },
  parameters: { layout: 'fullscreen' },
  render: function Render(args) {
    const [open, setOpen] = useState(args.open)
    const [pending, setPending] = useState(args.pending)
    return (
      <div className="p-2xl">
        <Button label="Open confirm dialog" variant="secondary" onClick={() => setOpen(true)} />
        <ConfirmDialog
          {...args}
          open={open}
          pending={pending}
          onCancel={() => setOpen(false)}
          onConfirm={() => {
            setPending(true)
            setTimeout(() => {
              setPending(false)
              setOpen(false)
            }, 2000)
          }}
        />
      </div>
    )
  },
} satisfies Meta<typeof ConfirmDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    open: true,
    title: 'Send 14 invoices?',
    description: 'Each client gets an email with their invoice attached. Sent invoices can be voided but not edited.',
    confirmLabel: 'Send invoices',
    cancelLabel: 'Cancel',
    tone: 'primary',
    pending: false,
    onConfirm: () => {},
    onCancel: () => {},
  },
}

export const Danger: Story = {
  args: {
    open: true,
    title: 'Remove Priya Shah from Harbour & Hale?',
    description: 'She loses access to every project straight away. Her invoices and comments stay.',
    confirmLabel: 'Remove member',
    cancelLabel: 'Keep member',
    tone: 'danger',
    pending: false,
    onConfirm: () => {},
    onCancel: () => {},
  },
}

export const Pending: Story = {
  args: {
    open: true,
    title: 'Remove Priya Shah from Harbour & Hale?',
    description: 'She loses access to every project straight away. Her invoices and comments stay.',
    confirmLabel: 'Remove member',
    cancelLabel: 'Keep member',
    tone: 'danger',
    pending: true,
    pendingLabel: 'Removing member',
    onConfirm: () => {},
    onCancel: () => {},
  },
}

/** For the most destructive actions: confirm stays locked until the workspace name is typed exactly. */
export const TypeToConfirm: Story = {
  args: {
    open: true,
    title: 'Delete the Harbour & Hale workspace?',
    description: 'This deletes 12 projects, 418 invoices and every file uploaded to them. It cannot be undone.',
    confirmLabel: 'Delete workspace',
    cancelLabel: 'Cancel',
    tone: 'danger',
    pending: false,
    pendingLabel: 'Deleting workspace',
    confirmText: 'harbour-hale',
    onConfirm: () => {},
    onCancel: () => {},
  },
}
