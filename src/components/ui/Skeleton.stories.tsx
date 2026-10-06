import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Skeleton } from './Skeleton'

/**
 * Story arg names are the contract. `shape` is the variant axis; `lines` is a number, which
 * the Figma component shows as three drawn lines rather than a property.
 */
const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  argTypes: {
    shape: { control: 'inline-radio', options: ['text', 'rect', 'circle'], description: 'What is loading.' },
    lines: { control: { type: 'number', min: 1, max: 8 }, description: 'Lines for shape text.' },
  },
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-measure-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { shape: 'text', lines: 3 },
}

export const Block: Story = {
  args: { shape: 'rect' },
}

export const Avatar: Story = {
  args: { shape: 'circle' },
}

/** A list row while it loads: avatar, then two lines. */
export const Row: Story = {
  args: { shape: 'text', lines: 2 },
  render: (args) => (
    <div className="flex items-start gap-lg">
      <Skeleton shape="circle" />
      <div className="flex-1">
        <Skeleton {...args} />
      </div>
    </div>
  ),
}
