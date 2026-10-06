import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from './Button'
import { EmptyState } from './EmptyState'

/**
 * Story arg names are the contract. `title` is the text property; `description` is optional
 * text with a `descriptionVisible` boolean; `action` swaps in an instance (a Button).
 */
const meta = {
  title: 'Components/EmptyState',
  component: EmptyState,
  argTypes: {
    title: { control: 'text', description: 'What is empty.' },
    description: { control: 'text', description: 'What to do about it. Omit to hide.' },
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-measure-lg">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'No invoices yet',
    description: 'Create your first invoice, or import last year’s from a CSV file.',
    action: <Button label="New invoice" />,
  },
}

export const NoResults: Story = {
  args: {
    title: 'No invoices match these filters',
    description: 'Clear a filter or search for a customer name instead.',
    action: <Button label="Clear filters" variant="secondary" />,
  },
}

export const TitleOnly: Story = {
  args: { title: 'Nothing archived' },
}
