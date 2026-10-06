import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from './Button'
import { Menu } from './Menu'

/**
 * Story arg names are the contract. `align` is the variant axis; `trigger` is an instance
 * swap (a Button by default); `items` is content, so the Figma set draws four. The Figma
 * component shows the open state. Click the trigger here to open it.
 */
const meta = {
  title: 'Components/Menu',
  component: Menu,
  argTypes: {
    align: { control: 'inline-radio', options: ['start', 'end'], description: 'Which trigger edge it lines up with.' },
  },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Menu>

export default meta
type Story = StoryObj<typeof meta>

const noop = () => {}

export const Default: Story = {
  args: {
    align: 'start',
    trigger: <Button label="Actions" variant="secondary" size="sm" />,
    items: [
      { id: 'duplicate', label: 'Duplicate', onSelect: noop },
      { id: 'copy', label: 'Copy link', onSelect: noop },
      { id: 'archive', label: 'Archive', onSelect: noop, disabled: true },
      { id: 'delete', label: 'Delete', onSelect: noop, tone: 'danger' },
    ],
  },
}

export const AlignEnd: Story = {
  args: {
    align: 'end',
    trigger: <Button label="Row actions" variant="ghost" size="sm" />,
    items: [
      { id: 'edit', label: 'Edit', onSelect: noop },
      { id: 'export', label: 'Export CSV', onSelect: noop },
      { id: 'unsubscribe', label: 'Unsubscribe', onSelect: noop, tone: 'danger' },
    ],
  },
}
