import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AvatarGroup } from './Avatar'

/**
 * Story arg names are the contract. `size` is the variant axis; `max` is a number, which the
 * contract carries as text; `people` is content.
 */
const meta = {
  title: 'Components/AvatarGroup',
  component: AvatarGroup,
  argTypes: {
    max: { control: 'number', description: 'How many show before the count.' },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'], description: 'Size of every avatar.' },
  },
} satisfies Meta<typeof AvatarGroup>

export default meta
type Story = StoryObj<typeof meta>

const team = [
  { name: 'Ada Lovelace' },
  { name: 'Grace Hopper' },
  { name: 'Margaret Hamilton' },
  { name: 'Alan Turing' },
  { name: 'Katherine Johnson' },
  { name: 'Edsger Dijkstra' },
  { name: 'Barbara Liskov' },
]

export const Default: Story = {
  args: { people: team, max: 4, size: 'md' },
}

export const Small: Story = {
  args: { people: team, max: 3, size: 'sm' },
}

export const NoOverflow: Story = {
  args: { people: team.slice(0, 3), max: 4, size: 'md' },
}
