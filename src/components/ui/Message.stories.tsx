import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from './Button'
import { Message } from './Message'

/**
 * Story arg names are the contract. `title` is the text property; `description` is optional
 * text with a `descriptionVisible` boolean; `tone` is the variant axis; `action` swaps in an
 * instance (a small Button). The close control appears in code when onDismiss is passed.
 */
const meta = {
  title: 'Components/Message',
  component: Message,
  argTypes: {
    title: { control: 'text', description: 'What the reader needs to know.' },
    description: { control: 'text', description: 'Detail or the next step. Omit to hide.' },
    tone: { control: 'inline-radio', options: ['info', 'success', 'warn', 'danger'], description: 'Status colour of the bar.' },
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-measure-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Message>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { title: 'Your trial ends in 3 days', description: 'Add a payment method to keep your workspace.', tone: 'info' },
}

export const WithAction: Story = {
  args: {
    title: 'Card declined',
    description: 'The payment of £1,240 for Harbour & Hale failed on 3 October.',
    tone: 'danger',
    action: <Button label="Retry payment" variant="secondary" size="sm" />,
  },
}

export const Success: Story = {
  args: { title: 'Workspace verified', description: 'Invoices now show your registered company name.', tone: 'success', onDismiss: () => {} },
}

export const Warn: Story = {
  args: { title: 'Two invoices are overdue', tone: 'warn' },
}
