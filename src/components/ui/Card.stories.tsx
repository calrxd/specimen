import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from './Button'
import { Card } from './Card'

/**
 * Story arg names are the contract. `title` and `description` are optional text, each with
 * a `...Visible` boolean in Figma; `children` is a slot and `actions` an instance swap.
 */
const meta = {
  title: 'Components/Card',
  component: Card,
  argTypes: {
    title: { control: 'text', description: 'The heading. Omit to hide.' },
    description: { control: 'text', description: 'What the card holds. Omit to hide.' },
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-measure-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Monthly report',
    description: 'Revenue, signups and churn for September, sent to the team on the first working day.',
    children: <p className="m-0 font-mono text-display text-ink">£84,210</p>,
    actions: <Button label="Open report" variant="secondary" size="sm" />,
  },
}

export const TitleOnly: Story = {
  args: {
    title: 'Notifications',
    children: <p className="m-0 font-text text-body text-muted">You are up to date.</p>,
  },
}

export const WithActions: Story = {
  args: {
    title: 'Delete workspace',
    description: 'Every project, member and invoice in this workspace is removed. This cannot be undone.',
    actions: (
      <>
        <Button label="Cancel" variant="secondary" size="sm" />
        <Button label="Delete workspace" variant="danger" size="sm" />
      </>
    ),
  },
}

export const Bare: Story = {
  args: {
    children: <p className="m-0 font-text text-body text-muted">A card with no heading frames any content.</p>,
  },
}
