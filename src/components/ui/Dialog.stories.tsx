import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from './Button'
import { Dialog } from './Dialog'

/**
 * Story arg names are the contract. `title` is the text property; `description` is
 * optional text with a `descriptionVisible` boolean; `open` is a boolean that shows the
 * scrim and panel; `children` is a slot for the body and its actions.
 */
const meta = {
  title: 'Components/Dialog',
  component: Dialog,
  argTypes: {
    title: { control: 'text', description: 'A question or a noun phrase.' },
    description: { control: 'text', description: 'What will happen. Omit to hide.' },
    open: { control: 'boolean', description: 'Showing or not.' },
  },
  parameters: { layout: 'fullscreen' },
  render: function Render(args) {
    const [open, setOpen] = useState(args.open)
    return (
      <div className="p-2xl">
        <Button label="Open dialog" variant="secondary" onClick={() => setOpen(true)} />
        <Dialog {...args} open={open} onClose={() => setOpen(false)} />
      </div>
    )
  },
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

const actions = (confirm: string, variant: 'primary' | 'danger') => (
  <div className="flex justify-end gap-sm">
    <Button label="Cancel" variant="secondary" size="sm" />
    <Button label={confirm} variant={variant} size="sm" />
  </div>
)

export const Default: Story = {
  args: {
    open: true,
    title: 'Publish v0.1.0?',
    description: 'The tokens package goes to npm and the changelog entry goes live.',
    children: actions('Publish', 'primary'),
    onClose: () => {},
  },
}

export const Destructive: Story = {
  args: {
    open: true,
    title: 'Delete this release?',
    description: 'The changelog entry is removed. The npm version stays, because npm versions cannot be deleted.',
    children: actions('Delete', 'danger'),
    onClose: () => {},
  },
}

export const TitleOnly: Story = {
  args: { open: true, title: 'Discard unsaved changes?', children: actions('Discard', 'danger'), onClose: () => {} },
}
