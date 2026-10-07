import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from './Button'
import { Drawer } from './Drawer'
import { Field } from './Field'

/**
 * Story arg names are the contract. `title` is the text property; `description` is optional
 * text with a `descriptionVisible` boolean; `side` is the variant axis; `open` is a boolean
 * that shows the scrim and panel; `children` is a slot for the body; `footer` swaps in the
 * actions pinned to the foot of the sheet.
 */
const meta = {
  title: 'Components/Drawer',
  component: Drawer,
  argTypes: {
    title: { control: 'text', description: 'What the drawer is for.' },
    description: { control: 'text', description: 'One line under the title. Omit to hide.' },
    side: { control: 'inline-radio', options: ['end', 'start'], description: 'Which edge it slides from.' },
    open: { control: 'boolean', description: 'Showing or not.' },
  },
  parameters: { layout: 'fullscreen' },
  render: function Render(args) {
    const [open, setOpen] = useState(args.open)
    return (
      <div className="p-2xl">
        <Button label="Open drawer" variant="secondary" onClick={() => setOpen(true)} />
        <Drawer {...args} open={open} onClose={() => setOpen(false)} />
      </div>
    )
  },
} satisfies Meta<typeof Drawer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    open: true,
    title: 'Invoice INV-2048',
    description: 'Harbour & Hale, due 3 October.',
    side: 'end',
    children: (
      <p className="m-0 font-text text-body leading-relaxed text-muted">£1,240 for the October plan. The card on file was declined.</p>
    ),
    footer: (
      <>
        <Button label="Send reminder" variant="secondary" size="sm" />
        <Button label="Retry payment" size="sm" />
      </>
    ),
    onClose: () => {},
  },
}

export const Form: Story = {
  args: {
    open: true,
    title: 'Edit customer',
    side: 'end',
    children: (
      <div className="flex flex-col gap-xl">
        <Field label="Company name" placeholder="Harbour & Hale" />
        <Field label="Billing email" placeholder="accounts@harbourhale.com" />
      </div>
    ),
    footer: (
      <>
        <Button label="Cancel" variant="secondary" size="sm" />
        <Button label="Save changes" size="sm" />
      </>
    ),
    onClose: () => {},
  },
}

export const Start: Story = {
  args: {
    open: true,
    title: 'Filters',
    side: 'start',
    children: <p className="m-0 font-text text-body text-muted">Filter controls go here.</p>,
    onClose: () => {},
  },
}
