import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Avatar } from './Avatar'

/**
 * Story arg names are the contract. `name` is the text property; `src` is optional text with
 * a `srcVisible` boolean; `size` and `status` are variant axes.
 */
const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  argTypes: {
    name: { control: 'text', description: 'Gives the initials and the accessible name.' },
    src: { control: 'text', description: 'Photo or logo URL. Omit for initials.' },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'], description: 'sm in lists, md in headers, lg on profiles.' },
    status: { control: 'inline-radio', options: ['none', 'online', 'away', 'busy'], description: 'Presence dot.' },
  },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { name: 'Ada Lovelace', size: 'md', status: 'none' },
}

export const WithStatus: Story = {
  args: { name: 'Grace Hopper', size: 'md', status: 'online' },
}

export const Large: Story = {
  args: { name: 'Margaret Hamilton', size: 'lg', status: 'away' },
}

export const Small: Story = {
  args: { name: 'Alan Turing', size: 'sm', status: 'busy' },
}

/** Every size side by side. */
export const Sizes: Story = {
  args: { name: 'Ada Lovelace' },
  render: () => (
    <div className="flex items-center gap-lg">
      <Avatar name="Ada Lovelace" size="sm" />
      <Avatar name="Ada Lovelace" size="md" />
      <Avatar name="Ada Lovelace" size="lg" status="online" />
    </div>
  ),
}
