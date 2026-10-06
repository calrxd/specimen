import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Spinner } from './Spinner'

/**
 * Story arg names are the contract. `label` is the text property (read by assistive
 * technology, not drawn); `size` is the variant axis.
 */
const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  argTypes: {
    label: { control: 'text', description: 'What is loading. Read aloud, not shown.' },
    size: { control: 'inline-radio', options: ['sm', 'md'], description: 'sm inline, md alone.' },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Loading invoices', size: 'md' },
}

export const Small: Story = {
  args: { label: 'Saving', size: 'sm' },
}

/** How sm sits beside text. */
export const Inline: Story = {
  args: { label: 'Saving', size: 'sm' },
  render: (args) => (
    <span className="flex items-center gap-sm text-body text-muted">
      <Spinner {...args} />
      Saving changes
    </span>
  ),
}
