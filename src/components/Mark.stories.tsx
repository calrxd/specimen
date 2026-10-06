import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Mark } from './Mark'

/**
 * The mark is fixed geometry: its sizes are drawn, not derived from the spacing
 * scale, so the Figma component set carries the same literal dimensions rather
 * than binding them to spacing variables.
 *
 * Story arg names are the contract. `size` becomes the Figma variant axis and
 * `showBar` becomes a boolean property on the set.
 */
const meta = {
  title: 'Components/Mark',
  component: Mark,
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Slide dimensions. Below 22px wide, use the dot alone instead.',
    },
    showBar: {
      control: 'boolean',
      description: 'The paper bar at 45% opacity. lg only: the type rejects it at sm and md.',
    },
  },
} satisfies Meta<typeof Mark>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { size: 'md' },
}

export const Small: Story = {
  args: { size: 'sm' },
}

export const Large: Story = {
  args: { size: 'lg', showBar: true },
}

/** The bar is suppressed. */
export const LargeWithoutBar: Story = {
  args: { size: 'lg', showBar: false },
}
