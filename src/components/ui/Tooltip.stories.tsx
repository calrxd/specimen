import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from './Button'
import { Tooltip } from './Tooltip'

/**
 * Story arg names are the contract. `label` is the text property, `side` the variant
 * axis, and `children` (the trigger) a slot. The Figma component shows the open state.
 */
const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  argTypes: {
    label: { control: 'text', description: 'One short line.' },
    side: { control: 'inline-radio', options: ['top', 'bottom'], description: 'Where it opens.' },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Copy token name', side: 'top', children: <Button label="Copy" variant="secondary" size="sm" /> },
}

export const Bottom: Story = {
  args: { label: 'Opens the changelog', side: 'bottom', children: <Button label="v0.1.0" variant="ghost" size="sm" /> },
}
