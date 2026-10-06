import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from './Button'
import { Toolbar } from './Toolbar'

/**
 * Story arg names are the contract. The accessible name is the native aria-label, so it has no Figma property.
 */
const meta = {
  title: 'Components/Toolbar',
  component: Toolbar,
  argTypes: {
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Toolbar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    'aria-label': 'Invoice actions',
    children: (
      <>
        <Button label="All" variant="secondary" size="sm" />
        <Button label="Overdue" variant="ghost" size="sm" />
        <Button label="Paid" variant="ghost" size="sm" />
      </>
    ),
    end: <Button label="New invoice" size="sm" />,
  },
}

export const WithoutEnd: Story = {
  args: {
    'aria-label': 'Formatting',
    children: (
      <>
        <Button label="Bold" variant="ghost" size="sm" />
        <Button label="Italic" variant="ghost" size="sm" />
        <Button label="Link" variant="ghost" size="sm" />
      </>
    ),
  },
}

export const BulkActions: Story = {
  args: {
    'aria-label': 'Selected rows',
    children: <span className="text-caption text-muted">3 selected</span>,
    end: (
      <>
        <Button label="Export CSV" variant="secondary" size="sm" />
        <Button label="Delete" variant="danger" size="sm" />
      </>
    ),
  },
}
