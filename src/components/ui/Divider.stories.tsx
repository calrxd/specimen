import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Divider } from './Divider'

/**
 * Story arg names are the contract. `orientation` is the variant axis; `label` is optional
 * text with a `labelVisible` boolean; `strong` is a boolean.
 */
const meta = {
  title: 'Components/Divider',
  component: Divider,
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'], description: 'Direction of the line.' },
    label: { control: 'text', description: 'Short text on the line. Omit to hide.' },
    strong: { control: 'boolean', description: 'Heavier line-strong rule.' },
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="flex h-6xl max-w-measure-sm items-center gap-lg">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Divider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { orientation: 'horizontal', strong: false },
}

export const WithLabel: Story = {
  args: { orientation: 'horizontal', label: 'or' },
}

export const Strong: Story = {
  args: { orientation: 'horizontal', strong: true },
}

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => (
    <>
      <span className="text-body text-ink">Overview</span>
      <Divider {...args} />
      <span className="text-body text-muted">Invoices</span>
    </>
  ),
}
