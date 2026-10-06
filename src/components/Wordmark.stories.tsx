import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Wordmark } from './Mark'

/**
 * The wordmark: lowercase "specimen" and an underscore in the accent green. Like the
 * mark, its sizes are literal brand geometry rather than steps on the type scale, so
 * the Figma set carries 17 and 15 as drawn values.
 *
 * Story arg names are the contract. `size` becomes the Figma variant axis and
 * `cursor` a boolean property on the set.
 */
const meta = {
  title: 'Components/Wordmark',
  component: Wordmark,
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['md', 'sm'],
      description: 'md (17px) in the site header, sm (15px) in admin chrome.',
    },
    cursor: {
      control: 'boolean',
      description: 'The underscore blinks like a cursor. Stops under prefers-reduced-motion.',
    },
  },
} satisfies Meta<typeof Wordmark>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { size: 'md', cursor: false },
}

export const Small: Story = {
  args: { size: 'sm', cursor: false },
}

/** As on the coming-soon page header. */
export const WithCursor: Story = {
  args: { size: 'md', cursor: true },
}
